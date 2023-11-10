import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from '../../entity/budget.entity';
import { FailType } from '../../enum/failType.enum';
import { CreateBudgetDto } from './dto/createBudget.dto';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
  ) {}

  async getBudgetSettings(userId: number) {
    return true;
  }

  async setBudgets(userId: number, createBudgetDto: CreateBudgetDto) {
    return true;
  }

  async getBudgetRecommendation(total) {
    return true;
  }
}
