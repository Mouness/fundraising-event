export interface AuthUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER';
  name?: string;
  picture?: string;
}

export interface AuthProvider {
  /**
   * Verifies credentials or tokens and returns a user.
   * For Local: inputs are { email, password }.
   * For External (Auth0/Firebase): inputs are { token } (ID Token).
   */
  verify(credentials: Record<string, any>): Promise<AuthUser | null>;
}
