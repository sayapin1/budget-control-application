import { Injectable } from '@nestjs/common';
import { BudgetService } from './budget.service';

@Injectable()
export class BudgetLib {
  constructor(private readonly budgetService: BudgetService) {}

  async getMonthlyBudget(userId: number): Promise<number> {
    return await this.budgetService.getMonthlyBudget(userId);
  }
}
