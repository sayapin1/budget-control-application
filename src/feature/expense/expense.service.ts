import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FailType } from '../../enum/failType.enum';
import { CreateExpenseDto } from './dto/createExpense.dto';
import { GetExpenseDto } from './dto/getExpense.dto';
import { Expense } from '../../entity/expense.entity';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async getExpenseById(expenseId: number) {
    return true;
  }

  async getExpenseListByQuery(getExpenseDto: GetExpenseDto) {
    return true;
  }

  async createExpense(userId: number, createExpenseDto: CreateExpenseDto) {
    return true;
  }

  async updateExpense(expenseId: number, createExpenseDto: CreateExpenseDto) {
    return true;
  }

  async deleteExpense(expenseId: number) {
    return true;
  }
}
