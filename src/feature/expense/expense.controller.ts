import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/createExpense.dto';
import { GetExpenseDto } from './dto/getExpense.dto';
import { JwtAuthGuard } from '../auth/guard/jwtAuth.guard';
import { SuccessType } from '../../enum/successType.enum';

@UseGuards(JwtAuthGuard)
@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  /* 지출 상세 조회 */
  @Get('/record/:expenseId')
  async getExpenseById(@Param('expenseId') expenseId: number) {
    try {
      const expenseDetail = await this.expenseService.getExpenseById(expenseId);
      return {
        message: SuccessType.EXPENSE_DETAIL_GET,
        data: expenseDetail,
      };
    } catch (error) {
      error.message;
    }
  }

  @Get('/record')
  async getExpenseListByQuery(@Query() getExpenseDto: GetExpenseDto) {
    return await this.expenseService.getExpenseListByQuery(getExpenseDto);
  }

  @Post('/record')
  async createExpense(
    @Req() req,
    @Body(ValidationPipe) createExpenseDto: CreateExpenseDto,
  ) {
    return await this.expenseService.createExpense(req.id, createExpenseDto);
  }

  @Patch('/record/:expenseId')
  async updateExpense(
    @Body(ValidationPipe) createExpenseDto: CreateExpenseDto,
    @Param('expenseId') expenseId: number,
  ) {
    return await this.expenseService.updateExpense(expenseId, createExpenseDto);
  }

  @Delete('/record/:expenseId')
  async deleteExpense(@Param('expenseId') expenseId: number) {
    return await this.expenseService.deleteExpense(expenseId);
  }
}
