import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto, UpdateEventDto } from '@fundraising/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        slug: createEventDto.slug,
        name: createEventDto.name,
        goalAmount: createEventDto.goalAmount,
        themeConfig: createEventDto.themeConfig || {},
      },
    });
  }

  async findAll() {
    return this.prisma.event.findMany();
  }

  async findOne(slugOrId: string) {
    const event = await this.prisma.event.findFirst({
      where: {
        OR: [{ id: slugOrId }, { slug: slugOrId }],
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    return this.prisma.event.update({
      where: { id },
      data: {
        ...(updateEventDto.name && { name: updateEventDto.name }),
        ...(updateEventDto.goalAmount && {
          goalAmount: updateEventDto.goalAmount,
        }),
        ...(updateEventDto.themeConfig && {
          themeConfig: updateEventDto.themeConfig,
        }),
      },
    });
  }

  async remove(id: string) {
    return this.prisma.event.delete({ where: { id } });
  }
}
