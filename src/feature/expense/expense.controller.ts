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

@UseGuards(JwtAuthGuard)
@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get('/record/:expenseId')
  async getExpenseById(@Param('expenseId') expenseId: number) {
    return await this.expenseService.getExpenseById(expenseId);
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
