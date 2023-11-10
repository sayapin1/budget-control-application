import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FailType } from '../../enum/failType.enum';
import { Expense } from '../../entity/expense.entity';
import { GetExpenseStatisticsDto } from './dto/getExpenseStatistics.dto';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async getExpenseStatistics(
    userId: number,
    getExpenseStatisticsDto: GetExpenseStatisticsDto,
  ) {
    return true;
  }
}
