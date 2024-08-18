import { Module } from '@nestjs/common';
import { InstallationsService } from './installations.service';
import { RelationalInstallationPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { UsersModule } from 'src/users/users.module';
import { RolesModule } from 'src/roles/roles.module';
import { MedicalCentersModule } from 'src/medical-centers/medical-centers.module';
import { InstallationsController } from './installations.controller';

@Module({
  imports: [
    RelationalInstallationPersistenceModule,
    UsersModule,
    RolesModule,
    MedicalCentersModule,
  ],
  controllers: [InstallationsController],
  providers: [InstallationsService],
  exports: [InstallationsService, RelationalInstallationPersistenceModule],
})
export class InstallationsModule {}
