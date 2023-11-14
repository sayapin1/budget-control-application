import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FailType } from '../../enum/failType.enum';
import { Budget } from '../../entity/budget.entity';
import { Expense } from '../../entity/expense.entity';
import { GetExpenseStatisticsDto } from './dto/getExpenseStatistics.dto';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
  ) {}

  /* 사용자들의 예산 평균값을 받고 10%이하의 값은 etc에 더해진다.*/
  async getExpenseStatistics(
    userId: number,
    getExpenseStatisticsDto: GetExpenseStatisticsDto,
  ) {
    return true;
  }

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
