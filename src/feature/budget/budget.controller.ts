import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/createBudget.dto';
import { JwtAuthGuard } from '../auth/guard/jwtAuth.guard';

@UseGuards(JwtAuthGuard)
@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get('/setting')
  async getBudgetSettings(@Req() req) {
    return await this.budgetService.getBudgetSettings(req.id);
  }

  @Post('/setting')
  async setBudgets(
    @Req() req,
    @Body(ValidationPipe) createBudgetDto: CreateBudgetDto,
  ) {
    return await this.budgetService.setBudgets(req.id, createBudgetDto);
  }

  @Get('/recommendation')
  async getBudgetRecommendation(
    @Body(ValidationPipe) createBudgetDto: CreateBudgetDto,
  ) {
    return await this.budgetService.getBudgetRecommendation(
      createBudgetDto.total,
    );
  }
}
