import { IsDate, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ExpenseCategory } from '../../../enum/expenseCategory.enum';

export class CreateExpenseDto {
  @IsDate()
  spentDate!: Date;

  @IsEnum(ExpenseCategory)
  category!: ExpenseCategory;

  @IsInt()
  amount!: number;

  @IsString()
  @IsOptional()
  memo?: string;
}
