import { IsBoolean, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateExpenseDto } from './createExpense.dto';

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {
  @IsBoolean()
  @IsOptional()
  is_counted?: boolean;
}
