import { Injectable, NotFoundException } from '@nestjs/common';
import { TicketsService } from 'src/tickets/tickets.service';
import { UsersService } from 'src/users/users.service';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { TicketComment } from './domain/ticket-comment';
import { CreateTicketCommentDto } from './dto/create-ticket-comment.dto';
import { UpdateTicketCommentDto } from './dto/update-ticket-comment.dto';
import { TicketCommentRepository } from './infrastructure/persistence/ticket-comment.repository';
import { exceptionResponses } from './ticket-comments.messages';
import { findOptions } from 'src/utils/types/fine-options.type';

@Injectable()
export class TicketCommentsService {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly usersService: UsersService,
    private readonly ticketCommentRepository: TicketCommentRepository,
  ) {}

  async create(
    createTicketCommentDto: CreateTicketCommentDto,
    createdBy: string,
  ) {
    const user = await this.usersService.findById(createdBy, { minimal: true });
    if (!user) {
      throw new NotFoundException(exceptionResponses.CommenterNotFound);
    }

    const ticket = await this.ticketsService.findOne(
      createTicketCommentDto.ticketId,
    );
    if (!ticket) {
      throw new NotFoundException(exceptionResponses.TicketNotFound);
    }

    const clonedPayload = {
      ...createTicketCommentDto,
      createdBy: user,
      ticket,
    };
    return this.ticketCommentRepository.create(clonedPayload);
  }

  findAllWithPagination({
    paginationOptions,
    options,
  }: {
    paginationOptions: IPaginationOptions;
    options?: findOptions;
  }) {
    return this.ticketCommentRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
      options,
    });
  }

  findOne(id: TicketComment['id'], options?: findOptions) {
    return this.ticketCommentRepository.findById(id, options);
  }

  update(
    id: TicketComment['id'],
    updateTicketCommentDto: UpdateTicketCommentDto,
  ) {
    return this.ticketCommentRepository.update(id, updateTicketCommentDto);
  }

  remove(id: TicketComment['id']) {
    return this.ticketCommentRepository.remove(id);
  }
}
