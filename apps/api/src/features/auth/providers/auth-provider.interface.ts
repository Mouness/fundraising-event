export interface AuthUser {
    id: string
    email?: string
    name?: string
    role: 'ADMIN' | 'USER' | 'STAFF'
    picture?: string
    eventId?: string // For STAFF
}

export interface GoogleAuthUser {
    email: string
    firstName: string
    lastName: string
    picture: string
    accessToken: string
}

export interface Auth0UserProfile {
    sub: string
    name: string
    email: string
    picture: string
    email_verified?: boolean
    nickname?: string
    [key: string]: any // Allow custom claims
}

export interface AuthProvider {
    /**
     * Verifies credentials or tokens and returns a user.
     * For Local: inputs are { email, password }.
     * For External (Auth0/Firebase): inputs are { token } (ID Token).
     */
    verify(credentials: Record<string, any>): Promise<AuthUser | null>
}
