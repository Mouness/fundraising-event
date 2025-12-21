import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthProvider, AuthUser } from './auth-provider.interface';
import * as bcrypt from 'bcrypt'; // In case we want to use bcrypt later, keeping imports clean

@Injectable()
export class LocalAuthProvider implements AuthProvider {
    constructor(private configService: ConfigService) { }

    async verify(credentials: Record<string, any>): Promise<AuthUser | null> {
        const adminEmail = this.configService.get<string>('ADMIN_EMAIL') || '';
        const adminPass = this.configService.get<string>('ADMIN_PASSWORD') || '';

        // Case 1: External Trusted Provider (e.g. Google) - only check email (ID)
        if (credentials.isTrusted && credentials.email) {
            if (credentials.email === adminEmail) {
                return {
                    id: 'admin',
                    email: adminEmail,
                    role: 'ADMIN',
                    name: credentials.name || 'Administrator',
                    picture: credentials.picture
                };
            }
            return null;
        }

        // Case 2: Local Password Auth
        if (
            credentials.email === adminEmail &&
            credentials.password === adminPass
        ) {
            return {
                id: 'admin',
                email: adminEmail,
                role: 'ADMIN',
                name: 'Administrator',
            };
        }

        return null;
    }
}
