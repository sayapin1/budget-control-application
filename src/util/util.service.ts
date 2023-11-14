import { Injectable } from '@nestjs/common';
import { Expense } from '../entity/expense.entity';

@Injectable()
export class UtilService {
  // 주어진 지출 내역의 총액을 계산.
  calculateTotalAmount(expenses: Expense[]): number {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }
}
