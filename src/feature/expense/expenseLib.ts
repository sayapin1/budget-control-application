import { Injectable } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { Expense } from '../../entity/expense.entity';

@Injectable()
export class ExpenseLib {
  constructor(private readonly expenseService: ExpenseService) {}

  async getPreviousExpense(userId: number): Promise<number> {
    return await this.expenseService.getPreviousExpense(userId);
  }

  async getExpensesInDateRange(
    userId: number,
    startOfMonth: Date,
    currentDate: Date,
  ) {
    return await this.expenseService.getExpensesInDateRange(
      userId,
      startOfMonth,
      currentDate,
    );
  }
}
