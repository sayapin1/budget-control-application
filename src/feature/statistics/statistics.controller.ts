import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { GetExpenseStatisticsDto } from './dto/getExpenseStatistics.dto';
import { JwtAuthGuard } from '../auth/guard/jwtAuth.guard';
import { SuccessType } from '../../enum/successType.enum';
import { StatisticsType } from '../../enum/statisticsType.enum';

@UseGuards(JwtAuthGuard)
@Controller('expense')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  /* 지출 통계
   *  query에 따라 통계 기준이 달라짐
   * 1. 지난달 대비 총액, 카테고리별 소비율
   * 2. 지난 요일 대비 총액, 카테고리별 소비율
   * 3. 다른 유저 대비 오늘 소비율*/
  @Get('/statistics')
  async getExpenseStatistics(
    @Query() getExpenseStatisticsDto: GetExpenseStatisticsDto,
    @Req() req,
  ) {
    let result;

    if (getExpenseStatisticsDto.type === 'month') {
      result = await this.statisticsService.getExpenseStatisticsByMonth(
        req.user.id,
      );
    }

    if (getExpenseStatisticsDto.type === 'day') {
      result = await this.statisticsService.getExpenseStatisticsByDay(
        req.user.id,
      );
    }
    if (getExpenseStatisticsDto.type === 'user') {
      result = await this.statisticsService.getExpenseStatisticsByUser(
        req.user.id,
      );
    }

    return {
      message: SuccessType.STATISTICS_GET,
      data: result,
    };
  }
}
