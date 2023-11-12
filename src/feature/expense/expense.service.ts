import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FailType } from '../../enum/failType.enum';
import { CreateExpenseDto } from './dto/createExpense.dto';
import { GetExpenseDto } from './dto/getExpense.dto';
import { UpdateExpenseDto } from './dto/updateExpense.dto';
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

  async createExpense(
    userId: number,
    createExpenseDto: CreateExpenseDto,
  ): Promise<void> {
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

  async updateExpense(
    expenseId: number,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<void> {
    try {
      const expense = await this.findIfExpenseExists(expenseId);

      if (!expense) {
        throw new NotFoundException(FailType.EXPENSE_NOT_FOUND);
      }

      Object.assign(expense, updateExpenseDto);

      await this.expenseRepository.save(expense);
    } catch (error) {
      throw new InternalServerErrorException(FailType.EXPENSE_UPDATE_FAIL);
    }
  }

  async deleteExpense(expenseId: number): Promise<void> {
    try {
      const expense = await this.findIfExpenseExists(expenseId);

      if (!expense) {
        throw new NotFoundException(FailType.EXPENSE_NOT_FOUND);
      }

      await this.expenseRepository.delete(expense);
    } catch (error) {
      throw new InternalServerErrorException(FailType.EXPENSE_DELETE_FAIL);
    }
  }

  async findIfExpenseExists(expenseId: number): Promise<Expense> {
    return await this.expenseRepository.findOne({
      where: { id: expenseId },
    });
  }
}
