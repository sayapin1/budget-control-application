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
    targetMonth: string,
  ): Promise<any> {
    const budget = await this.budgetRepository.findOne({
      select: {
        id: true,
        total: true,
        month: true,
        food: true,
        transport: true,
        living: true,
        hobby: true,
        culture: true,
        health: true,
        shopping: true,
        education: true,
        saving: true,
        etc: true,
        user: { id: true },
      },
      where: {
        user: { id: userId },
        month: targetMonth,
      },
    });

    if (!budget) {
      throw new NotFoundException(FailType.BUDGET_NOT_FOUND);
    }

    return Object.fromEntries(
      Object.entries(budget).filter(([key, value]) => value !== null),
    );
  }

  async setBudgets(
    userId: number,
    createBudgetDto: CreateBudgetDto,
    targetMonth: string,
  ): Promise<void> {
    try {
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

      const categories = Object.keys(updateBudgetDto);
      categories.forEach((category) => {
        if (updateBudgetDto[category] !== undefined) {
          budget[category] = updateBudgetDto[category];
        }
      });

      budget.total = 0;

      // total 업데이트
      budget.total = (Object.entries(budget) as [string, number][]).reduce(
        (sum, [key, value]) => {
          // key가 'id'일 경우 더하지 않음
          if (key === 'id') {
            return sum;
          }

          // 숫자 타입이 아닌 경우 더하지 않음
          if (typeof value !== 'number') {
            return sum;
          }

          return sum + value;
        },
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
        recommendedBudget[category] = Math.round(categoryBudget / 100) * 100;
      }
    }

    return recommendedBudget;
  }
}
