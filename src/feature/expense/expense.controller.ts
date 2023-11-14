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
import { UpdateExpenseDto } from './dto/updateExpense.dto';
import { JwtAuthGuard } from '../auth/guard/jwtAuth.guard';
import { SuccessType } from '../../enum/successType.enum';

@UseGuards(JwtAuthGuard)
@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  /* 지출 상세 조회 */
  @Get('/record/:expenseId')
  async getExpenseById(@Param('expenseId') expenseId: number) {
    const expenseDetail = await this.expenseService.getExpenseById(expenseId);
    return {
      message: SuccessType.EXPENSE_DETAIL_GET,
      data: expenseDetail,
    };
  }

  /* 지출 목록 조회
   * Query를 통해 필수적으로 기간을 받고,  조회 조건에 category, 최소, 최대 금액 입력*/
  @Get('/record')
  async getExpenseListByQuery(@Query() getExpenseDto: GetExpenseDto) {
    const expenseList = await this.expenseService.getExpenseListByQuery(
      getExpenseDto,
    );

    return {
      message: SuccessType.EXPENSE_LIST_GET,
      data: expenseList,
    };
  }

  /* 지출 생성 */
  @Post('/record')
  async createExpense(
    @Req() req,
    @Body(ValidationPipe) createExpenseDto: CreateExpenseDto,
  ) {
    await this.expenseService.createExpense(req.user.id, createExpenseDto);

    return {
      message: SuccessType.EXPENSE_CREATE,
    };
  }

  /* 지출 수정 */
  @Patch('/record/:expenseId')
  async updateExpense(
    @Body(ValidationPipe) updateExpenseDto: UpdateExpenseDto,
    @Param('expenseId') expenseId: number,
  ) {
    await this.expenseService.updateExpense(expenseId, updateExpenseDto);

    return {
      message: SuccessType.EXPENSE_UPDATE,
    };
  }

  /* 지출 삭제 */
  @Delete('/record/:expenseId')
  async deleteExpense(@Param('expenseId') expenseId: number) {
    await this.expenseService.deleteExpense(expenseId);

    return {
      message: SuccessType.EXPENSE_DELETE,
    };
  }
}
