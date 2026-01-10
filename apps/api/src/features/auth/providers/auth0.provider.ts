import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { AuthProvider, AuthUser, Auth0UserProfile } from './auth-provider.interface'

@Injectable()
export class Auth0Provider implements AuthProvider {
    private domain: string
    private clientId: string
    private clientSecret: string

    constructor(
        private configService: ConfigService,
        private readonly httpService: HttpService,
    ) {
        this.domain = this.configService.get<string>('AUTH0_DOMAIN') || ''
        this.clientId = this.configService.get<string>('AUTH0_CLIENT_ID') || ''
        this.clientSecret = this.configService.get<string>('AUTH0_CLIENT_SECRET') || ''
    }

    async verify(credentials: Record<string, any>): Promise<AuthUser | null> {
        // Case 1: External Trusted Provider (Pre-verified by Strategy)
        if (credentials.isTrusted && credentials.email) {
            // Logic: You might want to check if this email exists in Auth0 or just allow it
            // For now, mirroring LocalProvider: if email matches Admin or is valid User in Auth0
            return {
                id: credentials.sub || 'auth0_user',
                email: credentials.email,
                role: 'USER', // Default to USER, or map from Auth0 roles
                name: credentials.name,
                picture: credentials.picture,
            }
        }

        // Case 2: Email/Password Login (Resource Owner Password Grant)
        // Warning: correct configuration in Auth0 (Grant Types) is required.
        if (credentials.email && credentials.password) {
            try {
                const { data } = await firstValueFrom(
                    this.httpService.post(
                        `https://${this.domain}/oauth/token`,
                        {
                            grant_type: 'password',
                            username: credentials.email,
                            password: credentials.password,
                            audience: `https://${this.domain}/api/v2/`,
                            client_id: this.clientId,
                            client_secret: this.clientSecret,
                            scope: 'openid profile email',
                        },
                        {
                            headers: { 'content-type': 'application/json' },
                        },
                    ),
                )

                const { access_token } = data

                // Optionally fetch user profile with the token
                const userProfile = await this.getUserProfile(access_token)

                return {
                    id: userProfile.sub,
                    email: userProfile.email,
                    role: 'USER', // You'd need a way to determine Admin/Staff from Auth0 metadata/roles
                    name: userProfile.name,
                    picture: userProfile.picture,
                }
            } catch (error) {
                console.error('Auth0 Verification Failed:', error.message)
                return null
            }
        }

        return null
    }

    private async getUserProfile(accessToken: string): Promise<Auth0UserProfile> {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`https://${this.domain}/userinfo`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }),
            )
            return data
        } catch (_error) {
            throw new Error('Failed to fetch user profile')
        }
    }
}
