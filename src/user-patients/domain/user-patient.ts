import { ApiProperty } from '@nestjs/swagger';
import { genderEnum } from 'src/employee-profiles/employee-profiles.enum';
import { User } from 'src/users/domain/user';
import { Request } from 'src/requests/domain/request';
export class UserPatient {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  gender: genderEnum;

  @ApiProperty()
  dni: string;

  @ApiProperty({
    type: () => Request,
  })
  savedRequests?: Request[] | null;

  @ApiProperty({
    type: () => User,
  })
  user?: User | null;

  @ApiProperty()
  birthday: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}