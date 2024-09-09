import { Module } from '@nestjs/common';
import { scheduleRepository } from '../schedule.repository';
import { scheduleRelationalRepository } from './repositories/schedule.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { scheduleEntity } from './entities/schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([scheduleEntity])],
  providers: [
    {
      provide: scheduleRepository,
      useClass: scheduleRelationalRepository,
    },
  ],
  exports: [scheduleRepository],
})
export class RelationalschedulePersistenceModule {}
