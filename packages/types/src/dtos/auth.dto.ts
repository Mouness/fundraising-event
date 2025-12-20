export class LoginDto {
    email!: string;
    password!: string;
}

export class StaffLoginDto {
    code!: string;
}

export class AuthResponseDto {
    accessToken!: string;
    user?: {
        id: string;
        email: string;
        role: 'ADMIN' | 'STAFF';
    };
}
