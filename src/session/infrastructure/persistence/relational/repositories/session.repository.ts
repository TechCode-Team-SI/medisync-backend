import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { SessionEntity } from '../entities/session.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';

import { SessionRepository } from '../../session.repository';
import { Session } from '../../../../domain/session';

import { SessionMapper } from '../mappers/session.mapper';
import { User } from '../../../../../users/domain/user';
import { exceptionResponses } from 'src/session/session.messages';
import { findOptions } from 'src/utils/types/fine-options.type';

@Injectable()
export class SessionRelationalRepository implements SessionRepository {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
  ) {}

  private relations = [];

  async findById(
    id: Session['id'],
    options?: findOptions,
  ): Promise<NullableType<Session>> {
    let relations = this.relations;
    if (options?.minimal) relations = [];

    const entity = await this.sessionRepository.findOne({
      where: { id },
      relations,
    });

    return entity ? SessionMapper.toDomain(entity) : null;
  }

  async create(data: Session): Promise<Session> {
    const persistenceModel = SessionMapper.toPersistence(data);
    const newEntity = await this.sessionRepository.save(
      this.sessionRepository.create(persistenceModel),
    );
    return SessionMapper.toDomain(newEntity);
  }

  async update(
    id: Session['id'],
    payload: Partial<
      Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
    >,
  ): Promise<Session | null> {
    const entity = await this.sessionRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException(exceptionResponses.NotFound);
    }

    const updatedEntity = await this.sessionRepository.save(
      this.sessionRepository.create(
        SessionMapper.toPersistence({
          ...SessionMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return SessionMapper.toDomain(updatedEntity);
  }

  async deleteById(id: Session['id']): Promise<void> {
    await this.sessionRepository.softDelete({ id });
  }

  async deleteByUserId(conditions: { userId: User['id'] }): Promise<void> {
    await this.sessionRepository.softDelete({
      user: {
        id: conditions.userId,
      },
    });
  }

  async deleteByUserIdWithExclude(conditions: {
    userId: User['id'];
    excludeSessionId: Session['id'];
  }): Promise<void> {
    await this.sessionRepository.softDelete({
      user: {
        id: conditions.userId,
      },
      id: Not(conditions.excludeSessionId),
    });
  }
}
