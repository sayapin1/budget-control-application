import { Injectable } from '@nestjs/common';
import { BudgetService } from './budget.service';

@Injectable()
export class BudgetLib {
  constructor(private readonly budgetService: BudgetService) {}

  async getBudgetSettingsById(
    userId: number,
    targetMonth: string,
  ): Promise<any> {
    return await this.budgetService.getBudgetSettingsById(userId, targetMonth);
  }
}
