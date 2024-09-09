// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreatescheduleDto } from './create-schedule.dto';

export class UpdatescheduleDto extends PartialType(CreatescheduleDto) {}
