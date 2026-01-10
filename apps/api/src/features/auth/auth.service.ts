import { Injectable, Inject } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../database/prisma.service'
import type { AuthProvider, AuthUser } from './providers/auth-provider.interface'

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService, // Keeping if needed for future
        private prisma: PrismaService,
        @Inject('AUTH_PROVIDER') private authProvider: AuthProvider,
    ) {}

    async validateUser(email: string, pass: string): Promise<AuthUser | null> {
        return this.authProvider.verify({ email, password: pass })
    }

    async validateStaff(code: string, eventId: string): Promise<AuthUser | null> {
        const staff = await this.prisma.staffMember.findUnique({
            where: { code },
            include: {
                events: {
                    where: {
                        OR: [{ id: eventId }, { slug: eventId }],
                    },
                },
            },
        })

        if (staff && staff.events.length > 0) {
            return {
                id: staff.id,
                name: staff.name,
                role: 'STAFF',
                eventId: staff.events[0].id,
            }
        }
        return null
    }

    login(user: AuthUser) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role, // Use generic role
        }
        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        }
    }

    loginStaff(staff: AuthUser) {
        const payload = {
            sub: staff.id,
            name: staff.name,
            role: staff.role,
            eventId: staff.eventId,
        }
        return {
            accessToken: this.jwtService.sign(payload),
            user: staff,
        }
    }

    async validateGoogleUser(details: {
        email: string
        firstName: string
        lastName: string
        picture?: string
    }) {
        // Delegate to the active provider to decide if this external user is allowed
        // For LocalProvider, it checks if email matches env var
        return this.authProvider.verify({
            email: details.email,
            name: `${details.firstName} ${details.lastName}`,
            picture: details.picture,
            isTrusted: true,
        })
    }
}
