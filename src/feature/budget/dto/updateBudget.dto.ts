import { PartialType } from '@nestjs/mapped-types';
import { CreateBudgetDto } from './createBudget.dto';

export class UpdateBudgetDto extends PartialType(CreateBudgetDto) {}
