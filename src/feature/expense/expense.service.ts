import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { FailType } from '../../enum/failType.enum';
import { CreateExpenseDto } from './dto/createExpense.dto';
import { GetExpenseDto } from './dto/getExpense.dto';
import { UpdateExpenseDto } from './dto/updateExpense.dto';
import { Expense } from '../../entity/expense.entity';
import { MonthlyExpense } from '../../entity/monthlyExpense.entity';
import { parse } from 'date-fns';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(MonthlyExpense)
    private readonly monthlyExpenseRepository: Repository<MonthlyExpense>,
  ) {}

  async getExpenseById(expenseId: number): Promise<Expense> {
    try {
      const expenseDetail = await this.expenseRepository.findOne({
        where: {
          id: expenseId,
        },
        select: {
          id: true,
          spentDate: true,
          category: true,
          amount: true,
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
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async getExpenseListByQuery(getExpenseDto: GetExpenseDto): Promise<{
    expenses: Expense[];
    totalAmount: number;
    categoryTotalAmounts: Record<string, number>;
  }> {
    try {
      const { start, end, category, minimum, maximum } = getExpenseDto;

      const queryBuilder = this.expenseRepository.createQueryBuilder('expense');

      queryBuilder.select([
        'expense.id',
        'expense.spentDate',
        'expense.category',
        'expense.amount',
        'expense.isCounted',
      ]);

      // 1. start와 end를 통한 기간 필터링
      if (start && end) {
        queryBuilder.andWhere('expense.spentDate >= :start', { start });
        queryBuilder.andWhere('expense.spentDate <= :end', { end });
      }

      // 2. category 필터링
      if (category) {
        queryBuilder.andWhere('expense.category = :category', { category });
      }

      // 3. minimum 및 maximum 금액 필터링
      if (minimum !== undefined) {
        queryBuilder.andWhere('expense.amount >= :minimum', { minimum });
      }

      if (maximum !== undefined) {
        queryBuilder.andWhere('expense.amount <= :maximum', { maximum });
      }

      // 4. 모든 조건을 합쳐서 조회
      const expenses = await queryBuilder.getMany();

      // 5. 지출 합계 및 카테고리 별 지출 합계 계산
      const totalAmount = expenses
        .filter((expense) => expense.isCounted) // Filter out expenses with isCounted false
        .reduce((sum, expense) => sum + expense.amount, 0);

      // 카테고리 별 합계 계산
      const categoryTotalAmounts = expenses.reduce((result, expense) => {
        const category = expense.category;
        if (expense.isCounted) {
          result[category] = (result[category] || 0) + expense.amount;
        }
        return result;
      }, {});

      return {
        expenses,
        totalAmount,
        categoryTotalAmounts,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async createExpense(
    userId: number,
    createExpenseDto: CreateExpenseDto,
  ): Promise<void> {
    const queryRunner =
      this.expenseRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const spentDate = parse(
        createExpenseDto.spentDate,
        'yyyy-MM-dd',
        new Date(),
      );

      await this.expenseRepository.save({
        user: { id: userId },
        spentDate,
        category: createExpenseDto.category,
        amount: createExpenseDto.amount,
        memo: createExpenseDto.memo,
      });

      const spentMonth = createExpenseDto.spentDate.substring(0, 7);

      const monthlyExpense = await queryRunner.manager.findOne(MonthlyExpense, {
        where: { user: { id: userId }, month: spentMonth },
      });

      if (monthlyExpense) {
        // MonthlyExpense가 이미 존재하면 totalExpense 업데이트
        monthlyExpense.totalExpense += createExpenseDto.amount;
        await queryRunner.manager.save(MonthlyExpense, monthlyExpense);
      } else {
        // MonthlyExpense가 없으면 새로 생성
        await queryRunner.manager.save(MonthlyExpense, {
          user: { id: userId },
          month: spentMonth,
          totalExpense: createExpenseDto.amount,
        });
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
      throw new InternalServerErrorException(FailType.EXPENSE_CREATE_FAIL);
    } finally {
      await queryRunner.release();
    }
  }

  async updateExpense(
    expenseId: number,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<void> {
    const queryRunner =
      this.expenseRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const expense = await queryRunner.manager.findOne(Expense, {
        where: { id: expenseId },
        select: { id: true, spentDate: true, amount: true, user: { id: true } },
        relations: { user: true },
      });

      if (!expense) {
        throw new NotFoundException(FailType.EXPENSE_NOT_FOUND);
      }

      const originalAmount = expense.amount;

      Object.assign(expense, updateExpenseDto);

      await queryRunner.manager.save(Expense, expense);

      // 해당 사용자 및 월에 해당하는 MonthlyExpense 조회
      const spentMonth = (expense.spentDate as unknown as string).substring(
        0,
        7,
      );

      const monthlyExpense = await queryRunner.manager.findOne(MonthlyExpense, {
        where: { user: { id: expense.user.id }, month: spentMonth },
      });

      if (monthlyExpense) {
        monthlyExpense.totalExpense += expense.amount - originalAmount;
        await queryRunner.manager.save(MonthlyExpense, monthlyExpense);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException) {
        throw new NotFoundException(FailType.EXPENSE_NOT_FOUND);
      } else {
        console.error(error);
        throw new InternalServerErrorException(FailType.EXPENSE_UPDATE_FAIL);
      }
    } finally {
      await queryRunner.release();
    }
  }

  async deleteExpense(expenseId: number): Promise<void> {
    const queryRunner =
      this.expenseRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const expense = await queryRunner.manager.findOne(Expense, {
        where: { id: expenseId },
        select: { id: true, spentDate: true, amount: true, user: { id: true } },
        relations: { user: true },
      });

      if (!expense) {
        throw new NotFoundException(FailType.EXPENSE_NOT_FOUND);
      }

      const spentMonth = (expense.spentDate as unknown as string).substring(
        0,
        7,
      );

      const monthlyExpense = await queryRunner.manager.findOne(MonthlyExpense, {
        where: { user: { id: expense.user.id }, month: spentMonth },
      });

      if (monthlyExpense) {
        monthlyExpense.totalExpense -= expense.amount;
        await queryRunner.manager.save(MonthlyExpense, monthlyExpense);
      }

      await queryRunner.manager.delete(Expense, expenseId);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException) {
        throw new NotFoundException(FailType.EXPENSE_NOT_FOUND);
      } else {
        console.error(error);
        throw new InternalServerErrorException(FailType.EXPENSE_DELETE_FAIL);
      }
    } finally {
      await queryRunner.release();
    }
  }

  /* 달의 지정일 부터 지정일까지 총 지출 내역 가져오기 */
  async getExpensesInDateRange(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Expense[]> {
    try {
      return await this.expenseRepository.find({
        where: {
          user: { id: userId },
          isCounted: true,
          spentDate: Between(startDate, endDate),
        },
        select: {
          category: true,
          amount: true,
        },
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  /* 지정한 날의 지출 내역 가져오기 */
  async getExpensesByDate(
    userId: number,
    targetDate: Date,
  ): Promise<Expense[]> {
    try {
      const formattedDate = new Date(targetDate.toISOString().split('T')[0]);
      return await this.expenseRepository
        .createQueryBuilder('expense')
        .where('expense.user.id = :userId', { userId })
        .andWhere('expense.isCounted = :isCounted', { isCounted: true })
        .andWhere('DATE(expense.spentDate) = DATE(:formattedDate)', {
          formattedDate,
        })
        .select(['expense.category', 'expense.amount'])
        .getMany();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }
}
