import { forwardRef, Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { RelationalRequestPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { RequestTemplatesModule } from 'src/request-templates/request-templates.module';
import { SpecialtiesModule } from 'src/specialties/specialties.module';
import { UsersModule } from 'src/users/users.module';
import { DiagnosticsModule } from 'src/diagnostics/diagnostics.module';
import { InstructionsModule } from 'src/instructions/instructions.module';
import { RatingsModule } from 'src/ratings/ratings.module';
import { permissionsModule } from 'src/permissions/permissions.module';
import { UserPatientsModule } from 'src/user-patients/user-patients.module';

@Module({
  imports: [
    RelationalRequestPersistenceModule,
    RequestTemplatesModule,
    UsersModule,
    DiagnosticsModule,
    InstructionsModule,
    forwardRef(() => RatingsModule),
    forwardRef(() => SpecialtiesModule),
    permissionsModule,
    UserPatientsModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService, RelationalRequestPersistenceModule],
})
export class RequestsModule {}
