import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule, {
        rawBody: true,
    })
    const defaultOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:8080',
        'http://127.0.0.1:8080',
        'http://localhost:5179',
        'http://127.0.0.1:5179',
    ]

    const envOrigins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
        : []
    const corsOrigin = [...new Set([...defaultOrigins, ...envOrigins])]
    app.enableCors({
        origin: corsOrigin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
    })
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    app.setGlobalPrefix('api')
    await app.listen(process.env.PORT ?? 3000, '0.0.0.0')
}
bootstrap()
