import { Injectable } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Injectable()
export class StatisticsLib {
  constructor(private readonly statisticsService: StatisticsService) {}

  async getAverageBudgetStatistics(): Promise<{ [key: string]: number }> {
    return await this.statisticsService.getAverageBudgetStatistics();
  }
}
