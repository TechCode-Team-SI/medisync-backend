// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateInstallationDto } from './create-installation.dto';

export class UpdateInstallationDto extends PartialType(CreateInstallationDto) {}
