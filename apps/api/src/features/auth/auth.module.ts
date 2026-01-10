import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtStrategy } from './jwt.strategy'
import { HttpModule } from '@nestjs/axios'

import { GoogleStrategy } from './google.strategy'

import { LocalAuthProvider } from './providers/local.provider'
import { Auth0Provider } from './providers/auth0.provider'

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'dev_secret',
                signOptions: { expiresIn: '1d' },
            }),
            inject: [ConfigService],
        }),
        HttpModule,
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        GoogleStrategy,
        LocalAuthProvider,
        Auth0Provider,
        {
            provide: 'AUTH_PROVIDER',
            useFactory: (
                configService: ConfigService,
                localProvider: LocalAuthProvider,
                auth0Provider: Auth0Provider,
            ) => {
                const type = configService.get<string>('AUTH_PROVIDER_TYPE')
                if (type === 'auth0') {
                    return auth0Provider
                }
                return localProvider
            },
            inject: [ConfigService, LocalAuthProvider, Auth0Provider],
        },
    ],
})
export class AuthModule {}
