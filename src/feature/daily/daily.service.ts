import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FailType } from '../../enum/failType.enum';
import { Expense } from '../../entity/expense.entity';

@Injectable()
export class DailyService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async getTodaysExpenseRecommendation(userId: number) {
    return true;
  }

  async getTodaysExpenseGuide(userId: number) {
    return true;
  }
}
