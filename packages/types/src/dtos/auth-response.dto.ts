export class AuthResponseDto {
    declare accessToken: string;
    declare user?: {
        id: string;
        email?: string;
        name?: string;
        role: 'ADMIN' | 'STAFF';
    };
}
