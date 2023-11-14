import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { ExpenseCategory } from '../../../enum/expenseCategory.enum';

export class GetExpenseDto {
  @IsDateString()
  start!: string;

  @IsDateString()
  end!: string;

  @IsEnum(ExpenseCategory)
  @IsOptional()
  category?: ExpenseCategory;

  @IsString()
  @IsOptional()
  minimum?: string;

  @IsString()
  @IsOptional()
  maximum?: string;
}
