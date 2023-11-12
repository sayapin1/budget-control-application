import { PartialType } from '@nestjs/mapped-types';
import { CreateExpenseDto } from './createExpense.dto';

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {}
