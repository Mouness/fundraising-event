import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { CreateStaffDto, UpdateStaffDto } from '@fundraising/types'
import { Prisma } from '@prisma/client'

@Injectable()
export class StaffService {
    /**
     * Initialize StaffService.
     * @param prisma - PrismaService instance
     */
    constructor(private prisma: PrismaService) {}

    /**
     * Retrieve all staff members with event counts.
     * @returns List of staff members.
     */
    async findAll() {
        return this.prisma.staffMember.findMany({
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { events: true } } },
        })
    }

    /**
     * Retrieve a single staff member by ID.
     * @param id - Staff ID
     * @returns Staff member details.
     * @throws NotFoundException if not found.
     */
    async findOne(id: string) {
        const staff = await this.prisma.staffMember.findUnique({
            where: { id },
            include: { events: true },
        })
        if (!staff) throw new NotFoundException('Staff member not found')
        return staff
    }

    /**
     * Create a new staff member.
     * @param data - Creation data (DTO).
     * @returns Created staff member.
     * @throws ConflictException if PIN is already in use.
     */
    async create(data: CreateStaffDto) {
        try {
            return await this.prisma.staffMember.create({
                data: {
                    name: data.name,
                    code: data.code,
                    events: { connect: { id: data.eventId } },
                },
            })
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('PIN code already in use')
            }
            throw error
        }
    }

    /**
     * Update an existing staff member.
     * @param id - Staff ID.
     * @param data - Update data (DTO).
     * @returns Updated staff member.
     * @throws ConflictException if PIN is already in use.
     */
    async update(id: string, data: UpdateStaffDto) {
        try {
            return await this.prisma.staffMember.update({
                where: { id },
                data,
            })
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('PIN code already in use')
            }
            throw error
        }
    }

    /**
     * Remove a staff member.
     * @param id - Staff ID.
     * @returns Deleted staff member.
     */
    async remove(id: string) {
        return this.prisma.staffMember.delete({
            where: { id },
        })
    }
}
