import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { GetExpenseStatisticsDto } from './dto/getExpenseStatistics.dto';
import { JwtAuthGuard } from '../auth/guard/jwtAuth.guard';

@UseGuards(JwtAuthGuard)
@Controller('expense')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('/statistics')
  async getExpenseStatistics(
    @Query() getExpenseStatisticsDto: GetExpenseStatisticsDto,
    @Req() req,
  ) {
    return await this.statisticsService.getExpenseStatistics(
      req.user.id,
      getExpenseStatisticsDto,
    );
  }
}
