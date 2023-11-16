import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
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
      await this.dailyService.getTodaysExpenseRecommendation(req.user.id);

    return {
      message: SuccessType.EXPENSE_RECOMMENDATION_GET,
      data: expenseRecommendation,
    };
  }

  /* 오늘 지출 안내
   * 오늘 지출한 내용을 총액과 카테고리 별 금액으로 알려줍니다.
   * 오늘 기준 사용했으면 적절했을 금액과 오늘 기준 사용한 금액을 알려주고 위험도를 퍼센테이지로 알려줍니다. */
  @Get('/dailyGuide')
  async getTodaysExpenseGuide(@Req() req) {
    const expenseGuide = await this.dailyService.getTodaysExpenseGuide(
      req.user.id,
    );

    return {
      message: SuccessType.EXPENSE_GUIDE_GET,
      data: expenseGuide,
    };
  }

  @Post('/cacheSet')
  async setCache() {
    await this.dailyService.getAverageBudgetStatistics();
  }
}
