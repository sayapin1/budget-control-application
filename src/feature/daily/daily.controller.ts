import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DailyService } from './daily.service';
import { JwtAuthGuard } from '../auth/guard/jwtAuth.guard';
import { SuccessType } from '../../enum/successType.enum';

@UseGuards(JwtAuthGuard)
@Controller('expense')
export class DailyController {
  constructor(private readonly dailyService: DailyService) {}

  /* 오늘 지출 추천
   * 설정한 월별 예산을 만족하기 위해 오늘 지출 가능한 금액을 총액 과 카테고리 별 금액 으로 제공합니다. */
  @Get('/recommendation')
  async getTodaysExpenseRecommendation(@Req() req) {
    const expenseRecommendation =
      await this.dailyService.getTodaysExpenseRecommendation(req.id);

    return {
      message: SuccessType.EXPENSE_RECOMMENDATION_GET,
      data: expenseRecommendation,
    };
  }

  @Get('/dailyGuide')
  async getTodaysExpenseGuide(@Req() req) {
    return await this.dailyService.getTodaysExpenseGuide(req.id);
  }
}
