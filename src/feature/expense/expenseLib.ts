import { Injectable } from '@nestjs/common';
import { ExpenseService } from './expense.service';

@Injectable()
export class ExpenseLib {
  constructor(private readonly expenseService: ExpenseService) {}

  async getPreviousExpense(userId): Promise<number> {
    return await this.expenseService.getPreviousExpense(userId);
  }
}
