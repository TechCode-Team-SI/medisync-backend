import { FileMapper } from 'src/files/infrastructure/persistence/relational/mappers/file.mapper';
import { TopSpecialties } from '../../../../domain/top-specialties';
import { TopSpecialtiesEntity } from '../entities/top-specialties.entity';

export class TopSpecialtiesMapper {
  static toDomain(raw: TopSpecialtiesEntity): TopSpecialties {
    const domainEntity = new TopSpecialties();
    domainEntity.specialtyId = raw.specialtyId;
    domainEntity.name = raw.name;
    domainEntity.avatar = FileMapper.toDomainFromObject({
      id: raw.avatarId,
      path: raw.avatar,
    });
    domainEntity.requests = Number(raw.requests);

    return domainEntity;
  }
}
