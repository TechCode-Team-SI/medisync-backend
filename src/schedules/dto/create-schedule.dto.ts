import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { IsHourFormat } from 'src/utils/validators/is-hour-format';

export class CreateScheduleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Validate(IsHourFormat)
  from: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Validate(IsHourFormat)
  to: string;
}