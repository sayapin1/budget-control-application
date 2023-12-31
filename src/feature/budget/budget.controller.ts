import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/createBudget.dto';
import { YearMonthQueryDto } from './dto/yearMonthQuery.dto';
import { UpdateBudgetDto } from './dto/updateBudget.dto';
import { JwtAuthGuard } from '../auth/guard/jwtAuth.guard';
import { SuccessType } from '../../enum/successType.enum';

@UseGuards(JwtAuthGuard)
@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  /* 사용자가 정한 예산을 쿼리로 월과 연도를 받아서 불러오기
   * 값이 비어있는 카테고리는 가져오지 않기*/
  @Get('/setting')
  async getBudgetSettingsById(
    @Query() yearMonthQueryDto: YearMonthQueryDto,
    @Req() req,
  ) {
    const { year, month } = yearMonthQueryDto;
    const targetMonth = `${year}-${month}`;

    const budget = await this.budgetService.getBudgetSettingsById(
      req.user.id,
      targetMonth,
    );

    return {
      message: SuccessType.BUDGET_GET,
      data: budget,
    };
  }

  /* 지정한 월의 예산을 정하기
   * body에서 각 카테고리별 예산을 받고 query로 연도와 월을 받기*/
  @Post('/setting')
  async setBudgets(
    @Req() req,
    @Body(ValidationPipe) createBudgetDto: CreateBudgetDto,
    @Query() yearMonthQueryDto: YearMonthQueryDto,
  ) {
    const { year, month } = yearMonthQueryDto;
    const targetMonth = `${year}-${month}`;

    await this.budgetService.setBudgets(
      req.user.id,
      createBudgetDto,
      targetMonth,
    );

    return {
      message: SuccessType.BUDGET_SET,
    };
  }

  /* 예산 수정 */
  @Patch('/setting/:budgetId')
  async updateBudgets(
    @Body(ValidationPipe) updateBudgetDto: UpdateBudgetDto,
    @Param('budgetId') budgetId: number,
  ) {
    await this.budgetService.updateBudgets(budgetId, updateBudgetDto);
    return {
      message: SuccessType.BUDGET_UPDATE,
    };
  }

  /* 예산 설계(추천)
   * 카테고리 지정 없이 총액 (ex. 100만원) 을 입력하면, 카테고리 별 예산을 자동 생성합니다. */
  @Get('/recommendation')
  async getBudgetRecommendation(
    @Body(ValidationPipe) createBudgetDto: CreateBudgetDto,
  ) {
    const budgetRecommendation =
      await this.budgetService.getBudgetRecommendation(createBudgetDto.total);

    return {
      message: SuccessType.BUDGET_RECOMMENDATION_GET,
      data: budgetRecommendation,
    };
  }
}
