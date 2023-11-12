import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseCategory } from '../../enum/expenseCategory.enum';
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

  async getExpenseById(expenseId: number): Promise<Expense> {
    const expenseDetail = await this.expenseRepository.findOne({
      where: {
        id: expenseId,
      },
      select: {
        id: true,
        spentDate: true,
        category: true,
        amount: true,
        createdAt: true,
        memo: true,
        isCounted: true,
        user: {
          id: true,
          username: true,
        },
      },
      relations: {
        user: true,
      },
    });

    if (!expenseDetail) {
      throw new NotFoundException(FailType.EXPENSE_NOT_FOUND);
    }

    return expenseDetail;
  }

  async getExpenseListByQuery(getExpenseDto: GetExpenseDto) {
    return true;
  }

  async createExpense(userId: number, createExpenseDto: CreateExpenseDto) {
    try {
      await this.expenseRepository.create({
        user: { id: userId },
        spentDate: createExpenseDto.spentDate,
        category: createExpenseDto.category,
        amount: createExpenseDto.amount,
        memo: createExpenseDto.memo,
      });
    } catch (error) {
      throw new InternalServerErrorException(FailType.EXPENSE_CREATE_FAIL);
    }
  }

  async updateExpense(expenseId: number, createExpenseDto: CreateExpenseDto) {
    return true;
  }

  async deleteExpense(expenseId: number) {
    return true;
  }
}
