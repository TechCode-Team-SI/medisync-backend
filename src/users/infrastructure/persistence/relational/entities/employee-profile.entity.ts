import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from 'src/users/infrastructure/persistence/relational/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { SpecialtyEntity } from 'src/specialties/infrastructure/persistence/relational/entities/specialty.entity';

@Entity({
  name: 'employee_profile',
})
export class EmployeeProfileEntity extends EntityRelationalHelper {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  dni: string;

  @ApiProperty()
  @OneToOne(() => UserEntity, (user) => user.employeeProfile)
  @JoinColumn()
  user: UserEntity;

  @ApiProperty({
    type: () => SpecialtyEntity,
  })
  @ManyToMany(() => SpecialtyEntity)
  @JoinTable({ name: 'employee_specialty' })
  specialties: SpecialtyEntity[];

  @ApiProperty()
  @Column()
  birthday: Date;

  @ApiProperty()
  @Column()
  address: string;
}
