import { AppError } from '../../utils/errors/app.error.js';

export class AuthService {
  /**
   * Validate credentials for a workspace.
   * For development: accepts password "sams123" for any workspace.
   */
  async validateCredentials(workspaceId: string, password: string): Promise<{ userId: string }> {
    const devPassword = process.env['AUTH_PASSWORD'] ?? 'sams123';

    if (password !== devPassword) {
      throw new AppError('Invalid credentials', 'INVALID_CREDENTIALS', 401);
    }

    // In development, userId is derived from workspaceId
    // In production, this would validate against a users table
    const userId = `user-${workspaceId}`;

    return { userId };
  }
}

export const authService = new AuthService();
