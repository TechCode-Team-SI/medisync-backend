import { IsString, IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicalCenterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  municipality: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  parish: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  local_phone: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  mobile_phone: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  mission: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  vision: string;
}
