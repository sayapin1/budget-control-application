import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { ExpenseCategory } from '../../../enum/expenseCategory.enum';

export class GetExpenseDto {
  @IsDateString()
  start!: string;

  @IsDateString()
  end!: string;

  @IsEnum(ExpenseCategory)
  @IsOptional()
  category?: ExpenseCategory;

  @IsInt()
  @IsOptional()
  minimum?: number;

  @IsInt()
  @IsOptional()
  maximum?: number;
}
