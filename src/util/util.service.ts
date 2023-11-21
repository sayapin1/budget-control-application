import { Injectable } from '@nestjs/common';
import { Expense } from '../entity/expense.entity';

@Injectable()
export class UtilService {
  // 주어진 지출 내역의 총액을 계산.
  calculateTotalAmount(expenses: Expense[]): number {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  /* 이번달에 남은 기간 계산 */
  getRemainingDaysInMonth(): number {
    const today = new Date();
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    );
    return lastDayOfMonth.getDate() - today.getDate() + 1;
  }
}
