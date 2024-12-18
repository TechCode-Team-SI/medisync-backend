import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty } from 'class-validator';

export class CreateDaysOffDto {
  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  from: Date;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  to: Date;
}
