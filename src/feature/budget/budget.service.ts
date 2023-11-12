import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from '../../entity/budget.entity';
import { FailType } from '../../enum/failType.enum';
import { CreateBudgetDto } from './dto/createBudget.dto';
import { YearMonthQueryDto } from './dto/yearMonthQuery.dto';
import { UpdateBudgetDto } from './dto/updateBudget.dto';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async getBudgetSettingsById(
    userId: number,
    yearMonthQueryDto: YearMonthQueryDto,
  ): Promise<Budget> {
    const { year, month } = yearMonthQueryDto;
    const targetMonth = `${year}-${month}`;

    const queryBuilder = this.budgetRepository.createQueryBuilder('budget');

    queryBuilder.select([
      'budget.id',
      'budget.userId',
      'budget.total',
      'budget.month',
    ]);

    const nullableColumns = [
      'budget.food',
      'budget.transport',
      'budget.living',
      'budget.hobby',
      'budget.culture',
      'budget.health',
      'budget.shopping',
      'budget.education',
      'budget.saving',
      'budget.etc',
    ];
    for (const column of nullableColumns) {
      queryBuilder.andWhere(`budget.${column} IS NOT NULL`);
    }

    const budget = await queryBuilder
      .andWhere('budget.userId = :userId', { userId })
      .andWhere('budget.month = :targetMonth', { targetMonth })
      .getOne();

    if (!budget) {
      throw new NotFoundException(FailType.BUDGET_NOT_FOUND);
    }

    return budget;
  }

  async setBudgets(
    userId: number,
    createBudgetDto: CreateBudgetDto,
    yearMonthQueryDto: YearMonthQueryDto,
  ): Promise<void> {
    try {
      const { year, month } = yearMonthQueryDto;
      const targetMonth = `${year}-${month}`;

      const total = Object.values(createBudgetDto).reduce(
        (sum, value) => (sum += value || 0),
        0,
      );

      const budget = this.budgetRepository.create({
        user: { id: userId },
        month: targetMonth,
        food: createBudgetDto.food,
        transport: createBudgetDto.transport,
        living: createBudgetDto.living,
        hobby: createBudgetDto.hobby,
        culture: createBudgetDto.culture,
        health: createBudgetDto.health,
        shopping: createBudgetDto.shopping,
        education: createBudgetDto.education,
        saving: createBudgetDto.saving,
        etc: createBudgetDto.etc,
        total: total,
      });

      await this.budgetRepository.save(budget);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(FailType.BUDGET_SET_FAIL);
    }
  }

  async updateBudgets(
    budgetId: number,
    updateBudgetDto: UpdateBudgetDto,
  ): Promise<void> {
    try {
      const budget = await this.budgetRepository.findOne({
        where: { id: budgetId },
      });

      if (!budget) {
        throw new NotFoundException(FailType.BUDGET_NOT_FOUND);
      }

      for (const category of Object.keys(updateBudgetDto)) {
        if (updateBudgetDto[category]) {
          budget[category] = updateBudgetDto[category];
        }
      }

      budget.total = Object.values(budget).reduce(
        (sum, value) => (sum += value || 0),
        0,
      );

      await this.budgetRepository.save(budget);
    } catch (error) {
      throw new InternalServerErrorException(FailType.BUDGET_UPDATE_FAIL);
    }
  }

  async getBudgetRecommendation(total: number) {
    const budgetStatistics = await this.cacheManager.get('averageBudget');
    const parsedBudgetStatistics = JSON.parse(budgetStatistics as string);

    const recommendedBudget = {};
    for (const category in parsedBudgetStatistics) {
      if (parsedBudgetStatistics.hasOwnProperty(category)) {
        const categoryBudget = total * parsedBudgetStatistics[category];
        recommendedBudget[category] = categoryBudget;
      }
    }

    return recommendedBudget;
  }
}
