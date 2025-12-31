import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto, UpdateEventDto } from '@fundraising/types';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) { }

  private readonly defaultSelect = {
    id: true,
    slug: true,
    name: true,
    goalAmount: true,
    themeConfig: true,
    formConfig: true,
    date: true,
    description: true,
    status: true,
    createdAt: true,
    updatedAt: true,
  };

  async create(createEventDto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        slug: createEventDto.slug,
        name: createEventDto.name,
        goalAmount: createEventDto.goalAmount,
        themeConfig: createEventDto.themeConfig || {},
        date: createEventDto.date ? new Date(createEventDto.date) : new Date(),
        description: createEventDto.description,
        status: createEventDto.status || 'active',
      },
      select: this.defaultSelect,
    });
  }

  async findAll() {
    const events = await this.prisma.event.findMany({ select: this.defaultSelect });

    // Aggregate donations (SUCCEEDED only)
    const aggregations = await this.prisma.donation.groupBy({
      by: ['eventId'],
      _sum: { amount: true },
      _count: { id: true },
      where: { status: 'SUCCEEDED' },
    });

    return events.map((event) => {
      const stats = aggregations.find((a) => a.eventId === event.id);
      return {
        ...event,
        raised: stats?._sum.amount?.toNumber() || 0,
        donorCount: stats?._count.id || 0,
      };
    });
  }

  async findOne(slugOrId: string) {
    const event = await this.prisma.event.findFirst({
      where: {
        OR: [{ id: slugOrId }, { slug: slugOrId }],
      },
      select: this.defaultSelect,
    });
    if (!event) throw new NotFoundException('Event not found');

    // Also attach stats for single event?
    // The previous implementation didn't, but finding one usually benefits from stats too.
    // Let's keep it simple for now as findOne is used for config loading mainly.
    // If needed, I'll add it later.
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    return this.prisma.event.update({
      where: { id },
      data: {
        ...(updateEventDto.name && { name: updateEventDto.name }),
        ...(updateEventDto.slug && { slug: updateEventDto.slug }),
        ...(updateEventDto.goalAmount && {
          goalAmount: updateEventDto.goalAmount,
        }),
        ...(updateEventDto.themeConfig && {
          themeConfig: updateEventDto.themeConfig,
        }),
        ...(updateEventDto.date && { date: new Date(updateEventDto.date) }),
        ...(updateEventDto.description && { description: updateEventDto.description }),
        ...(updateEventDto.status && { status: updateEventDto.status }),
      },
      select: this.defaultSelect,
    });
  }

  async remove(id: string) {
    return this.prisma.event.delete({ where: { id }, select: this.defaultSelect });
  }
}
