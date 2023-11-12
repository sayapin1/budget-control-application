import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { FailType } from '../../enum/failType.enum';
import { Expense } from '../../entity/expense.entity';
import { StatisticsLib } from '../statistics/statisticsLib';

@Injectable()
export class DailyService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    private readonly statisticsLib: StatisticsLib,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async getTodaysExpenseRecommendation(userId: number) {
    return true;
  }

  async getTodaysExpenseGuide(userId: number) {
    return true;
  }

  @Cron('0 9 * * 1')
  async getAverageBudgetStatistics(): Promise<void> {
    const averageBudget = await this.statisticsLib.getAverageBudgetStatistics();

    await this.cacheManager.set('averageBudget', JSON.stringify(averageBudget));
  }
}
