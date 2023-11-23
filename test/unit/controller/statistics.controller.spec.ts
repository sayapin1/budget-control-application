import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsController } from '../../../src/feature/statistics/statistics.controller';
import { StatisticsService } from '../../../src/feature/statistics/statistics.service';
import { GetExpenseStatisticsDto } from '../../../src/feature/statistics/dto/getExpenseStatistics.dto';
import { SuccessType } from '../../../src/enum/successType.enum';
import { StatisticsType } from '../../../src/enum/statisticsType.enum';

describe('StatisticsController', () => {
  let controller: StatisticsController;
  let service: StatisticsService;

  const mockStatisticsService = {
    getExpenseStatisticsByMonth: jest.fn(),
    getExpenseStatisticsByDay: jest.fn(),
    getExpenseStatisticsByUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatisticsController],
      providers: [
        {
          provide: StatisticsService,
          useValue: mockStatisticsService,
        },
      ],
    }).compile();

    controller = module.get<StatisticsController>(StatisticsController);
    service = module.get<StatisticsService>(StatisticsService);
  });

  describe('getExpenseStatistics', () => {
    it('should get expense statistics by month', async () => {
      const getExpenseStatisticsDto: GetExpenseStatisticsDto = {
        type: StatisticsType.MONTH,
      };
      const mockUserId = 1;
      const mockStatisticsResult = {
        thisMonthTotal: 100,
        lastMonthTotal: 200,
        categoryRatios: {
          food: '50%',
          transport: '30%',
          living: '20%',
        },
      };

      jest
        .spyOn(service, 'getExpenseStatisticsByMonth')
        .mockResolvedValue(mockStatisticsResult);

      const result = await controller.getExpenseStatistics(
        getExpenseStatisticsDto,
        { user: { id: mockUserId } },
      );

      expect(result).toEqual({
        message: SuccessType.STATISTICS_GET,
        data: mockStatisticsResult,
      });
      expect(service.getExpenseStatisticsByMonth).toHaveBeenCalledWith(
        mockUserId,
      );
    });

    it('should get expense statistics by day', async () => {
      const getExpenseStatisticsDto: GetExpenseStatisticsDto = {
        type: StatisticsType.DAY,
      };
      const mockUserId = 1;
      const mockStatisticsResult = {
        today: 50,
        lastWeek: 100,
        ratio: '50%',
      };

      jest
        .spyOn(service, 'getExpenseStatisticsByDay')
        .mockResolvedValue(mockStatisticsResult);

      const result = await controller.getExpenseStatistics(
        getExpenseStatisticsDto,
        { user: { id: mockUserId } },
      );

      expect(result).toEqual({
        message: SuccessType.STATISTICS_GET,
        data: mockStatisticsResult,
      });
      expect(service.getExpenseStatisticsByDay).toHaveBeenCalledWith(
        mockUserId,
      );
    });

    it('should get expense statistics by user', async () => {
      const getExpenseStatisticsDto: GetExpenseStatisticsDto = {
        type: StatisticsType.USER,
      };
      const mockUserId = 1;
      const mockStatisticsResult = '50%';

      jest
        .spyOn(service, 'getExpenseStatisticsByUser')
        .mockResolvedValue(mockStatisticsResult);

      const result = await controller.getExpenseStatistics(
        getExpenseStatisticsDto,
        { user: { id: mockUserId } },
      );

      expect(result).toEqual({
        message: SuccessType.STATISTICS_GET,
        data: mockStatisticsResult,
      });
      expect(service.getExpenseStatisticsByUser).toHaveBeenCalledWith(
        mockUserId,
      );
    });
  });
});
