import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, StaffLoginDto } from '@fundraising/types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private prisma: PrismaService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
        const adminPass = this.configService.get<string>('ADMIN_PASSWORD');

        if (email === adminEmail && pass === adminPass) {
            // In a real app, use bcrypt.compare here too
            // But for env-based single admin, direct comparison is okay if env is secure
            return { id: 'admin', email: adminEmail, role: 'ADMIN' };
        }
        return null;
    }

    async validateStaff(code: string): Promise<any> {
        const staff = await this.prisma.staffCode.findUnique({
            where: { code },
        });
        if (staff) {
            return { id: staff.id, name: staff.name, role: 'STAFF', eventId: staff.eventId };
        }
        return null;
    }

    async login(user: any) {
        const payload = { sub: user.id, email: user.email, role: 'ADMIN' };
        return {
            accessToken: this.jwtService.sign(payload),
            user: { id: user.id, email: user.email, role: 'ADMIN' },
        };
    }

    async loginStaff(staff: any) {
        const payload = { sub: staff.id, name: staff.name, role: 'STAFF', eventId: staff.eventId };
        return {
            accessToken: this.jwtService.sign(payload),
            user: { id: staff.id, name: staff.name, role: 'STAFF' },
        };
    }

    async validateGoogleUser(details: { email: string; firstName: string; lastName: string }) {
        const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
        // Simple check: Is this the authorized admin?
        if (details.email === adminEmail) {
            return {
                id: 'admin',
                email: details.email,
                role: 'ADMIN',
                name: `${details.firstName} ${details.lastName}`,
            };
        }
        // If we want to allow new admins, we'd creating a User model here.
        // For now, reject non-admin emails.
        return null;
    }
}
