import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from '../../entity/budget.entity';
import { Expense } from '../../entity/expense.entity';
import { ExpenseLib } from '../expense/expenseLib';
import { UtilService } from '../../util/util.service';
import { startOfMonth, subMonths, subDays } from 'date-fns';
import { BudgetLib } from '../budget/budgetLib';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    private readonly budgetLib: BudgetLib,
    private readonly expenseLib: ExpenseLib,
    private readonly utilService: UtilService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async getExpenseStatisticsByMonth(userId: number) {
    try {
      // 현재 날짜를 기준으로 지난달의 시작일과 오늘을 계산
      const currentDate = new Date();
      const lastMonthStart = startOfMonth(subMonths(currentDate, 1));

      // 이번 달 1일부터 오늘까지의 지출 데이터 가져오기
      const thisMonthExpenses = await this.expenseLib.getExpensesInDateRange(
        userId,
        startOfMonth(currentDate),
        currentDate,
      );

      // 지난달 1일부터 지난달 현재 날짜까지의 지출 데이터 가져오기
      const lastMonthExpenses = await this.expenseLib.getExpensesInDateRange(
        userId,
        lastMonthStart,
        subMonths(currentDate, 1),
      );

      // 이번 달과 지난달의 총액 계산
      const thisMonthTotal =
        this.utilService.calculateTotalAmount(thisMonthExpenses);
      const lastMonthTotal =
        this.utilService.calculateTotalAmount(lastMonthExpenses);

      // 지난 달 카테고리 별 금액 배정
      const lastMonthCategoryAmounts: Record<string, number> = {};

      lastMonthExpenses.forEach((expense) => {
        const category = expense.category;
        const amount = expense.amount;

        if (!lastMonthCategoryAmounts[category]) {
          lastMonthCategoryAmounts[category] = 0;
        }

        lastMonthCategoryAmounts[category] += amount;
      });

      // 카테고리별 소비율 계산
      const categoryRatios: Record<string, string> = {};
      thisMonthExpenses.forEach((expense) => {
        const category = expense.category;
        const amount = expense.amount;

        const lastMonthCategoryAmount = lastMonthCategoryAmounts[category] || 1;

        if (!categoryRatios[category]) {
          categoryRatios[category] = '0%';
        }

        categoryRatios[category] =
          Math.round((amount / lastMonthCategoryAmount) * 100).toString() + '%';
      });

      return {
        thisMonthTotal,
        lastMonthTotal,
        categoryRatios,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async getExpenseStatisticsByDay(userId: number) {
    try {
      // 오늘의 지출 내역 가져오기
      const todayExpenses = await this.expenseLib.getExpensesByDate(
        userId,
        new Date(),
      );

      // 일주일 전의 지출 내역 가져오기
      const lastWeekExpenses = await this.expenseLib.getExpensesByDate(
        userId,
        subDays(new Date(), 7),
      );

      // 오늘과 일주일 전의 지출 금액과 비율 계산
      const todayTotal = this.utilService.calculateTotalAmount(todayExpenses);
      const lastWeekTotal =
        this.utilService.calculateTotalAmount(lastWeekExpenses);
      const ratio =
        lastWeekTotal !== 0
          ? Math.round(
              ((todayTotal - lastWeekTotal) / lastWeekTotal) * 100,
            ).toString() + '%'
          : '0%';

      return {
        today: todayTotal,
        lastWeek: lastWeekTotal,
        ratio,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async getExpenseStatisticsByUser(userId: number) {
    try {
      // 이번 달의 시작일부터 오늘까지의 지출 내역 가져오기
      const startOfMonthDate = startOfMonth(new Date());
      const today = new Date();
      const thisYear = today.getFullYear();
      const thisMonth = today.getMonth() + 1;
      const formattedMonth = thisMonth < 10 ? `0${thisMonth}` : thisMonth;
      const thisYearMonth = `${thisYear}-${formattedMonth}`;
      const thisMonthExpenses = await this.expenseLib.getExpensesInDateRange(
        userId,
        startOfMonthDate,
        today,
      );

      const thisMonthBudget = await this.budgetLib.getBudgetSettingsById(
        userId,
        thisYearMonth,
      ); //설정한 이번달 카테고리 별 예산

      // 이번 달 사용자의 지출과 예산 대비 비율 계산
      const thisMonthTotal =
        this.utilService.calculateTotalAmount(thisMonthExpenses);
      const userRatio = thisMonthTotal / thisMonthBudget;

      // 다른 사용자들의 이번 달의 평균 비율 계산
      const otherUsersAverageRatio = 0.5;

      // 나의 소비율 대비 다른 사용자 대비 소비율 계산
      const comparedRatio = (userRatio / otherUsersAverageRatio) * 100;

      return comparedRatio;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  /* 사용자들의 예산 평균값을 받고 10%이하의 값은 etc에 더해진다.*/
  async getAverageBudgetStatistics(): Promise<{ [key: string]: number }> {
    const budgetStatistics = await this.budgetRepository
      .createQueryBuilder()
      .select('AVG(food)', 'food')
      .addSelect('AVG(transport)', 'transport')
      .addSelect('AVG(living)', 'living')
      .addSelect('AVG(hobby)', 'hobby')
      .addSelect('AVG(culture)', 'culture')
      .addSelect('AVG(health)', 'health')
      .addSelect('AVG(shopping)', 'shopping')
      .addSelect('AVG(education)', 'education')
      .addSelect('AVG(saving)', 'saving')
      .addSelect('AVG(etc)', 'etc')
      .addSelect('AVG(total)', 'total')
      .getRawOne();

    const averageBudgetStatistics: { [key: string]: number } = {};

    let etcSum = 0;

    for (const key in budgetStatistics) {
      if (budgetStatistics.hasOwnProperty(key)) {
        let value = parseFloat(budgetStatistics[key]);

        if (isNaN(value)) {
          value = 0;
        }

        // 비율로 변환
        if (key !== 'total') {
          value = value / budgetStatistics['total'];
          averageBudgetStatistics[key] = value;
        }

        if (value <= 0.1 && key !== 'total') {
          etcSum += value;
          delete averageBudgetStatistics[key];
        }
      }
    }

    averageBudgetStatistics['etc'] = etcSum;

    return averageBudgetStatistics;
  }
}
