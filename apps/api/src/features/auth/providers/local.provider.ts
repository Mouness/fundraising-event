import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthProvider, AuthUser } from './auth-provider.interface'
import * as argon2 from 'argon2'

@Injectable()
export class LocalAuthProvider implements AuthProvider {
    private readonly logger = new Logger(LocalAuthProvider.name)

    constructor(private configService: ConfigService) {}

    async verify(credentials: Record<string, any>): Promise<AuthUser | null> {
        const adminEmail = this.configService.get<string>('ADMIN_EMAIL')

        if (!adminEmail) {
            this.logger.warn('ADMIN_EMAIL is not configured')
            return null
        }

        if (credentials.isTrusted) {
            return this.verifyTrustedProvider(credentials, adminEmail)
        }

        if (credentials.email === adminEmail && credentials.password) {
            return this.verifyPassword(credentials.password, adminEmail)
        }

        return null
    }

    private verifyTrustedProvider(
        credentials: Record<string, any>,
        adminEmail: string,
    ): AuthUser | null {
        if (credentials.email !== adminEmail) {
            return null
        }

        return this.createAdminUser(
            adminEmail,
            (credentials.name as string) || 'Administrator',
            credentials.picture as string,
        )
    }

    private async verifyPassword(password: string, adminEmail: string): Promise<AuthUser | null> {
        const adminPassHash = this.configService.get<string>('ADMIN_PASSWORD') || ''

        // 1. Plain Text Check
        if (password === adminPassHash) {
            return this.createAdminUser(adminEmail, 'Administrator')
        }

        // 2. Argon2 Check
        try {
            const isMatch = await argon2.verify(adminPassHash, password)
            if (isMatch) {
                return this.createAdminUser(adminEmail, 'Administrator')
            }
        } catch (e) {
            this.logger.error(`Error verifying password: ${e instanceof Error ? e.message : e}`)
        }

        return null
    }

    private createAdminUser(email: string, name: string, picture?: string): AuthUser {
        return {
            id: 'admin',
            email,
            role: 'ADMIN',
            name,
            picture,
        }
    }
}
