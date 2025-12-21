import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthProvider, AuthUser } from './auth-provider.interface';
// import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAuthProvider implements AuthProvider {
    private firebaseApp: any; // admin.app.App

    constructor(private configService: ConfigService) {
        // Initialize Firebase Admin SDK
        // const serviceAccount = JSON.parse(this.configService.get('FIREBASE_SERVICE_ACCOUNT'));
        // this.firebaseApp = admin.initializeApp({
        //   credential: admin.credential.cert(serviceAccount),
        // });
    }

    async verify(credentials: Record<string, any>): Promise<AuthUser | null> {
        const token = credentials.token;
        if (!token) return null;

        try {
            // Verify ID token
            // const decodedToken = await this.firebaseApp.auth().verifyIdToken(token);

            // Mock for example purposes until firebase-admin is installed
            const decodedToken: any = {
                uid: 'firebase_123',
                email: 'user@example.com',
                email_verified: true,
                name: 'Firebase User',
                picture: 'https://...'
            };

            if (!decodedToken.email) return null;

            // Map Firebase user to AuthUser
            return {
                id: decodedToken.uid,
                email: decodedToken.email,
                role: 'USER', // Or determine role based on custom claims
                name: decodedToken.name,
                picture: decodedToken.picture
            };
        } catch (error) {
            console.error('Firebase token verification failed:', error);
            return null;
        }
    }
}
