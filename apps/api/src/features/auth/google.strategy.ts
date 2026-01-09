import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20'
import { ConfigService } from '@nestjs/config'
import { GoogleAuthUser } from './providers/auth-provider.interface'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(configService: ConfigService) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'mock_client_id',
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || 'mock_client_secret',
            callbackURL:
                configService.get<string>('GOOGLE_CALLBACK_URL') ||
                'http://localhost:3000/auth/google/callback',
            scope: ['email', 'profile'],
        })
    }

    validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ): GoogleAuthUser {
        const { name, emails, photos } = profile
        const user: GoogleAuthUser = {
            email: emails && emails[0] ? emails[0].value : '',
            firstName: name ? name.givenName : '',
            lastName: name ? name.familyName : '',
            picture: photos && photos[0] ? photos[0].value : '',
            accessToken,
        }
        done(null, user)
        return user
    }
}
