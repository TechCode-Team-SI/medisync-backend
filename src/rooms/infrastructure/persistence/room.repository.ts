import { PaginationResponseDto } from 'src/utils/dto/pagination-response.dto';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Room } from '../../domain/room';
import { findOptions } from 'src/utils/types/fine-options.type';
import { BaseRepository } from 'src/common/base.repository';
import { FilterRoomsDto } from 'src/rooms/dto/find-all-rooms.dto';

export abstract class RoomRepository extends BaseRepository {
  abstract create(
    data: Omit<Room, 'id' | 'specialty' | 'employeeProfile' | 'isDisabled'>,
  ): Promise<Room>;

  abstract findAllWithPagination({
    paginationOptions,
    options,
  }: {
    paginationOptions: IPaginationOptions;
    options?: findOptions;
    filterOptions?: FilterRoomsDto | null;
  }): Promise<PaginationResponseDto<Room>>;

  abstract findById(
    id: Room['id'],
    options?: findOptions,
  ): Promise<NullableType<Room>>;

  abstract update(
    id: Room['id'],
    payload: DeepPartial<Room>,
  ): Promise<Room | null>;

  abstract remove(id: Room['id']): Promise<void>;
}
