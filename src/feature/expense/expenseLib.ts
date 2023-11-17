import { Injectable } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { Expense } from '../../entity/expense.entity';
import { MonthlyExpense } from '../../entity/monthlyExpense.entity';

@Injectable()
export class ExpenseLib {
  constructor(private readonly expenseService: ExpenseService) {}

  async getExpensesInDateRange(
    userId: number,
    startOfMonth: Date,
    currentDate: Date,
  ): Promise<Expense[]> {
    return await this.expenseService.getExpensesInDateRange(
      userId,
      startOfMonth,
      currentDate,
    );
  }

  async getExpensesByDate(
    userId: number,
    targetDate: Date,
  ): Promise<Expense[]> {
    return await this.expenseService.getExpensesByDate(userId, targetDate);
  }

  async getMonthlyExpense(
    userId: number,
    spentMonth: string,
  ): Promise<MonthlyExpense> {
    return await this.expenseService.getMonthlyExpense(userId, spentMonth);
  }

  async getOthersMonthlyExpenseAverage(
    userId: number,
    spentMonth: string,
  ): Promise<number> {
    return await this.expenseService.getOthersMonthlyExpenseAverage(
      userId,
      spentMonth,
    );
  }
}
