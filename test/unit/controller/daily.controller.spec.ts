import { Test, TestingModule } from '@nestjs/testing';
import { DailyController } from '../../../src/feature/daily/daily.controller';
import { DailyService } from '../../../src/feature/daily/daily.service';
import { SuccessType } from '../../../src/enum/successType.enum';

describe('DailyController', () => {
  let controller: DailyController;
  let service: DailyService;

  const mockDailyService = {
    getTodaysExpenseRecommendation: jest.fn(),
    getTodaysExpenseGuide: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyController],
      providers: [
        {
          provide: DailyService,
          useValue: mockDailyService,
        },
      ],
    }).compile();

    controller = module.get<DailyController>(DailyController);
    service = module.get<DailyService>(DailyService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it("should get today's expense recommendation", async () => {
    const mockUserId = 1;
    const mockRequest = {
      user: {
        id: mockUserId,
      },
    };

    const mockExpenseRecommendation = {
      totalAmount: 1000,
      categoryAmounts: {
        category1: 500,
        category2: 300,
        category3: 200,
      },
      message: 'Expense recommendation message',
    };

    jest
      .spyOn(service, 'getTodaysExpenseRecommendation')
      .mockResolvedValue(mockExpenseRecommendation);

    const result = await controller.getTodaysExpenseRecommendation(mockRequest);

    expect(result).toEqual({
      message: SuccessType.EXPENSE_RECOMMENDATION_GET,
      data: mockExpenseRecommendation,
    });
    expect(service.getTodaysExpenseRecommendation).toHaveBeenCalledWith(
      mockUserId,
    );
  });

  it("should get today's expense guide", async () => {
    const mockUserId = 1;
    const mockRequest = {
      user: {
        id: mockUserId,
      },
    };

    const mockExpenseGuide = {
      totalAppropriateAmount: 1000,
      categoryAppropriateAmount: {
        category1: 500,
        category2: 300,
        category3: 200,
      },
      todaySpentAmount: 800,
      todayDangerPercentage: '80%',
      categoryStats: {
        category1: {
          recommendedAmount: 500,
          spentAmount: 400,
          dangerPercentage: '80%',
        },
        category2: {
          recommendedAmount: 300,
          spentAmount: 200,
          dangerPercentage: '66%',
        },
        category3: {
          recommendedAmount: 200,
          spentAmount: 200,
          dangerPercentage: '100%',
        },
      },
    };

    jest
      .spyOn(service, 'getTodaysExpenseGuide')
      .mockResolvedValue(mockExpenseGuide);

    const result = await controller.getTodaysExpenseGuide(mockRequest);

    expect(result).toEqual({
      message: SuccessType.EXPENSE_GUIDE_GET,
      data: mockExpenseGuide,
    });
    expect(service.getTodaysExpenseGuide).toHaveBeenCalledWith(mockUserId);
  });
});
