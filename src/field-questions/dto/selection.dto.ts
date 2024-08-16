import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SelectionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  value: string;
}