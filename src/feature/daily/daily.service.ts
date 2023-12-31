import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { FailType } from '../../enum/failType.enum';
import { Expense } from '../../entity/expense.entity';
import { ExpenseLib } from '../expense/expenseLib';
import { StatisticsLib } from '../statistics/statisticsLib';
import { BudgetLib } from '../budget/budgetLib';
import { UtilService } from '../../util/util.service';
import { startOfMonth } from 'date-fns';

@Injectable()
export class DailyService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    private readonly expenseLib: ExpenseLib,
    private readonly statisticsLib: StatisticsLib,
    private readonly budgetLib: BudgetLib,
    private readonly utilService: UtilService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async getTodaysExpenseRecommendation(userId: number): Promise<{
    totalAmount: number;
    categoryAmounts: Record<string, number>;
    message: string;
  }> {
    //현재 달 찾기
    const today = new Date();
    const thisYear = today.getFullYear();
    const thisMonth = today.getMonth() + 1;
    const formattedMonth = thisMonth < 10 ? `0${thisMonth}` : thisMonth;
    const thisYearMonth = `${thisYear}-${formattedMonth}`;
    const startOfMonthDate = startOfMonth(new Date());

    const monthlyBudgetByCategory = await this.budgetLib.getBudgetSettingsById(
      userId,
      thisYearMonth,
    ); //설정한 이번달 카테고리 별 예산

    const monthlyBudgetTotal = monthlyBudgetByCategory.total; //설정한 이번달 총 예산

    const previousExpenses = await this.expenseLib.getExpensesInDateRange(
      userId,
      startOfMonthDate,
      today,
    );

    const totalExpenses =
      this.utilService.calculateTotalAmount(previousExpenses); //이번달 동안 사용한 총 지출 계산

    const minAmount = 1000; // 최소 금액 설정

    // 이후 일자 동안의 예산 계산
    const remainingDays = this.utilService.getRemainingDaysInMonth();

    const dailyBudget = Math.max(
      minAmount,
      (monthlyBudgetTotal - totalExpenses) / remainingDays,
    );

    // 오늘 예산 계산(1000원 미만일 경우 1000원이 표시되도록 합니다).
    const todayBudget = Math.max(minAmount, dailyBudget);

    // 오늘 예산을 사용자 친화적으로 변환
    const roundedTodayBudget = Math.round(todayBudget / 100) * 100;

    const categoryBudgets: Record<string, number> = {};
    const { id, month, total, ...categories } = monthlyBudgetByCategory;

    // 각 카테고리에 할당할 금액 계산 및 카테고리별 금액을 사용자 친화적으로 변환
    Object.entries(categories).forEach(([category, amount]) => {
      const categoryRatio = Number(amount) / total;
      const categoryBudget =
        Math.round((roundedTodayBudget * categoryRatio) / 100) * 100;
      categoryBudgets[category] = Math.max(minAmount, categoryBudget);
    });

    // 사용자 상황에 맞는 멘트 생성
    let message;
    if (roundedTodayBudget < 5000) {
      message =
        '오늘은 예산을 좀 더 신중하게 다뤄봐요. 금액을 다시 확인해보세요.';
    } else if (roundedTodayBudget >= 5000 && roundedTodayBudget < 20000) {
      message =
        '오늘은 적은 예산으로도 절약할 수 있어요. 지출을 신중하게 해보세요.';
    } else {
      message = '적당한 금액으로 지출하고 계시네요. 잘하고 있어요!';
    }

    await this.cacheManager.set(
      `todayTotalBudgetBy${userId}`,
      roundedTodayBudget,
      { ttl: 0 },
    );

    return {
      totalAmount: roundedTodayBudget,
      categoryAmounts: categoryBudgets,
      message: message,
    };
  }

  async getTodaysExpenseGuide(userId: number) {
    // 오늘 지출한 내용을 가져오기
    const todayExpenses = await this.expenseLib.getExpensesByDate(
      userId,
      new Date(),
    );

    const recommendationResult = await this.getTodaysExpenseRecommendation(
      userId,
    );

    const categoryStats: Record<
      string,
      {
        recommendedAmount: number;
        spentAmount: number;
        dangerPercentage: number;
      }
    > = {};

    // 오늘 지출한 내역을 카테고리별로 분류하고 통계를 계산
    todayExpenses.forEach((expense) => {
      const category = expense.category; // 카테고리 필드에 따라 수정
      const amount = expense.amount;

      if (!categoryStats[category]) {
        categoryStats[category] = {
          recommendedAmount: 0,
          spentAmount: 0,
          dangerPercentage: 0,
        };
      }

      // 오늘 적정 금액 계산 (getTodaysExpenseRecommendation에서 계산된 값 사용)
      categoryStats[category].recommendedAmount +=
        recommendationResult.categoryAmounts[category] || 1;

      // 오늘 지출한 금액 누적
      categoryStats[category].spentAmount += amount;
    });

    // 위험도 계산 및 할당
    Object.keys(categoryStats).forEach((category) => {
      const { recommendedAmount, spentAmount } = categoryStats[category];
      categoryStats[category].dangerPercentage =
        (spentAmount / recommendedAmount) * 100 || 0;
    });

    const todaysTotalExpense =
      this.utilService.calculateTotalAmount(todayExpenses);

    return {
      totalAppropriateAmount: recommendationResult.totalAmount,
      categoryAppropriateAmount: recommendationResult.categoryAmounts,
      todaySpentAmount: todaysTotalExpense,
      todayDangerPercentage:
        Math.round(
          (todaysTotalExpense / recommendationResult.totalAmount) * 100 || 0,
        ) + '%',
      categoryStats: Object.fromEntries(
        Object.entries(categoryStats).map(([category, stats]) => {
          return [
            category,
            {
              ...stats,
              dangerPercentage: Math.round(stats.dangerPercentage) + '%',
            },
          ];
        }),
      ),
    };
  }

  @Cron('0 9 * * 1')
  async getAverageBudgetStatistics(): Promise<void> {
    const averageBudget = await this.statisticsLib.getAverageBudgetStatistics();

    await this.cacheManager.set(
      'averageBudget',
      JSON.stringify(averageBudget),
      { ttl: 0 },
    );
  }
}
