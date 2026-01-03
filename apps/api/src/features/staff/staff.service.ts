import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.staffMember.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { events: true } } },
    });
  }

  async findOne(id: string) {
    const staff = await this.prisma.staffMember.findUnique({
      where: { id },
      include: { events: true },
    });
    if (!staff) throw new NotFoundException('Staff member not found');
    return staff;
  }

  async create(data: { name: string; code: string }) {
    try {
      return await this.prisma.staffMember.create({
        data: {
          name: data.name,
          code: data.code,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('PIN code already in use');
      }
      throw error;
    }
  }

  async update(id: string, data: { name?: string; code?: string }) {
    try {
      return await this.prisma.staffMember.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('PIN code already in use');
      }
      throw error;
    }
  }

  async remove(id: string) {
    return this.prisma.staffMember.delete({
      where: { id },
    });
  }
}
