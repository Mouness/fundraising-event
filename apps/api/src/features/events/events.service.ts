import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto, UpdateEventDto } from '@fundraising/types';
import { PrismaService } from '../../database/prisma.service';

import { WhiteLabelingService } from '../white-labeling/white-labeling.service';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private whiteLabelingService: WhiteLabelingService,
  ) { }

  private readonly defaultSelect = {
    id: true,
    slug: true,
    name: true,
    goalAmount: true,
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
        date: createEventDto.date ? new Date(createEventDto.date) : new Date(),
        description: createEventDto.description,
        status: createEventDto.status || 'active',
      },
      select: this.defaultSelect,
    });
  }

  async findAll() {
    const events = await this.prisma.event.findMany({
      select: this.defaultSelect,
    });

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
        raised: (stats?._sum.amount?.toNumber() || 0) / 100,
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

    // Aggregate donations (SUCCEEDED only)
    const stats = await this.prisma.donation.aggregate({
      _sum: { amount: true },
      _count: { id: true },
      where: { eventId: event.id, status: 'SUCCEEDED' },
    });

    return {
      ...event,
      raised: (stats._sum.amount?.toNumber() || 0) / 100,
      donorCount: stats._count.id || 0,
    };
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    // Check for formConfig in the payload (extra field from frontend)
    const formConfig = updateEventDto.formConfig;
    if (formConfig) {
      await this.whiteLabelingService.updateEventSettings(id, { formConfig });
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        ...(updateEventDto.name && { name: updateEventDto.name }),
        ...(updateEventDto.slug && { slug: updateEventDto.slug }),
        ...(updateEventDto.goalAmount && {
          goalAmount: updateEventDto.goalAmount,
        }),
        ...(updateEventDto.date && { date: new Date(updateEventDto.date) }),
        ...(updateEventDto.description && {
          description: updateEventDto.description,
        }),
        ...(updateEventDto.status && { status: updateEventDto.status }),
      },
      select: this.defaultSelect,
    });
  }

  async remove(id: string) {
    return this.prisma.event.delete({
      where: { id },
      select: this.defaultSelect,
    });
  }

  async findStaff(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { staffMembers: { orderBy: { name: 'asc' } } },
    });
    return event?.staffMembers || [];
  }

  async assignStaff(eventId: string, staffId: string) {
    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        staffMembers: { connect: { id: staffId } },
      },
    });
  }

  async unassignStaff(eventId: string, memberId: string) {
    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        staffMembers: { disconnect: { id: memberId } },
      },
    });
  }
}
