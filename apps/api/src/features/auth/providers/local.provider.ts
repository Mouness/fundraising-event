import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthProvider, AuthUser } from './auth-provider.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LocalAuthProvider implements AuthProvider {
  constructor(private configService: ConfigService) {}

  async verify(credentials: Record<string, any>): Promise<AuthUser | null> {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL') || '';
    const adminPassHash =
      this.configService.get<string>('ADMIN_PASSWORD') || '';

    // Case 1: External Trusted Provider (e.g. Google) - only check email (ID)
    if (credentials.isTrusted && credentials.email) {
      if (credentials.email === adminEmail) {
        return {
          id: 'admin',
          email: adminEmail,
          role: 'ADMIN',
          name: (credentials.name as string) || 'Administrator',
          picture: credentials.picture as string,
        };
      }
      return null;
    }

    // Case 2: Local Password Auth (Compare with Bcrypt)
    if (credentials.email === adminEmail && credentials.password) {
      const isMatch = await bcrypt.compare(credentials.password, adminPassHash);
      if (isMatch) {
        return {
          id: 'admin',
          email: adminEmail,
          role: 'ADMIN',
          name: 'Administrator',
        };
      }
    }

    return null;
  }
}
