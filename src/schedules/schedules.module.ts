import { Module } from '@nestjs/common';
import { schedulesService } from './schedules.service';
import { schedulesController } from './schedules.controller';
import { RelationalschedulePersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalschedulePersistenceModule],
  controllers: [schedulesController],
  providers: [schedulesService],
  exports: [schedulesService, RelationalschedulePersistenceModule],
})
export class schedulesModule {}
