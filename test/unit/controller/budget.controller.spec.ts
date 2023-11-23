import { Test, TestingModule } from '@nestjs/testing';
import { BudgetController } from '../../../src/feature/budget/budget.controller';
import { BudgetService } from '../../../src/feature/budget/budget.service';
import { CreateBudgetDto } from '../../../src/feature/budget/dto/createBudget.dto';
import { YearMonthQueryDto } from '../../../src/feature/budget/dto/yearMonthQuery.dto';
import { UpdateBudgetDto } from '../../../src/feature/budget/dto/updateBudget.dto';
import { SuccessType } from '../../../src/enum/successType.enum';

describe('BudgetController', () => {
  let controller: BudgetController;
  let service: BudgetService;

  const mockBudgetService = {
    getBudgetSettingsById: jest.fn(),
    setBudgets: jest.fn(),
    updateBudgets: jest.fn(),
    getBudgetRecommendation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetController],
      providers: [
        {
          provide: BudgetService,
          useValue: mockBudgetService,
        },
      ],
    }).compile();

    controller = module.get<BudgetController>(BudgetController);
    service = module.get<BudgetService>(BudgetService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getBudgetSettingsById', () => {
    it('should return budget settings by ID', async () => {
      const yearMonthQueryDto: YearMonthQueryDto = {
        year: '2023',
        month: '11',
      };
      const userId = 1;
      const mockBudget = {
        id: 1,
        total: 1000,
        month: '2023-11',
        food: 200,
        transport: null,
        living: 500,
      };

      jest
        .spyOn(service, 'getBudgetSettingsById')
        .mockResolvedValue(mockBudget);

      const result = await controller.getBudgetSettingsById(yearMonthQueryDto, {
        user: { id: userId },
      });

      expect(result).toEqual({
        message: SuccessType.BUDGET_GET,
        data: mockBudget,
      });
      expect(service.getBudgetSettingsById).toHaveBeenCalledWith(
        userId,
        '2023-11',
      );
    });
  });

  describe('setBudgets', () => {
    it('should set budgets for specified month and year', async () => {
      const createBudgetDto: CreateBudgetDto = {
        food: 500,
        transport: 200,
        living: 1000,
        hobby: 300,
        culture: 150,
        etc: 200,
      };
      const yearMonthQueryDto: YearMonthQueryDto = {
        year: '2023',
        month: '11',
      };
      const userId = 1;

      jest.spyOn(service, 'setBudgets').mockResolvedValue(undefined);

      const result = await controller.setBudgets(
        { user: { id: userId } },
        createBudgetDto,
        yearMonthQueryDto,
      );

      expect(result).toEqual({
        message: SuccessType.BUDGET_SET,
      });
      expect(service.setBudgets).toHaveBeenCalledWith(
        userId,
        createBudgetDto,
        '2023-11',
      );
    });
  });

  describe('updateBudgets', () => {
    it('should update budgets by budgetId', async () => {
      const updateBudgetDto: UpdateBudgetDto = {
        food: 500,
        transport: 200,
        living: 1000,
        hobby: 300,
        culture: 150,
        etc: 200,
      };
      const budgetId = 1;

      jest.spyOn(service, 'updateBudgets').mockResolvedValue(undefined);

      const result = await controller.updateBudgets(updateBudgetDto, budgetId);

      expect(result).toEqual({
        message: SuccessType.BUDGET_UPDATE,
      });

      expect(service.updateBudgets).toHaveBeenCalledWith(
        budgetId,
        updateBudgetDto,
      );
    });
  });

  describe('getBudgetRecommendation', () => {
    it('should get budget recommendation based on total amount', async () => {
      const createBudgetDto: CreateBudgetDto = {
        total: 30000,
      };
      const budgetRecommendation = {
        food: 5000,
        transport: 5000,
        living: 10000,
        hobby: 3000,
        culture: 2000,
        etc: 5000,
      };

      jest
        .spyOn(service, 'getBudgetRecommendation')
        .mockResolvedValue(budgetRecommendation);

      const result = await controller.getBudgetRecommendation(createBudgetDto);

      expect(result).toEqual({
        message: SuccessType.BUDGET_RECOMMENDATION_GET,
        data: budgetRecommendation,
      });
    });
  });
});
