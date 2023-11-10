import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DailyService } from './daily.service';
import { JwtAuthGuard } from '../auth/guard/jwtAuth.guard';

@UseGuards(JwtAuthGuard)
@Controller('expense')
export class DailyController {
  constructor(private readonly dailyService: DailyService) {}

  @Get('/recommendation')
  async getTodaysExpenseRecommendation(@Req() req) {
    return await this.dailyService.getTodaysExpenseRecommendation(req.id);
  }

  @Get('/dailyGuide')
  async getTodaysExpenseGuide(@Req() req) {
    return await this.dailyService.getTodaysExpenseGuide(req.id);
  }
}
