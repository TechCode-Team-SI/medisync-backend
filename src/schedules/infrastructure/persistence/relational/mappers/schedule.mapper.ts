import { schedule } from '../../../../domain/schedule';
import { scheduleEntity } from '../entities/schedule.entity';

export class scheduleMapper {
  static toDomain(raw: scheduleEntity): schedule {
    const domainEntity = new schedule();
    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: schedule): scheduleEntity {
    const persistenceEntity = new scheduleEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
