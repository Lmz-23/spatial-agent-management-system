import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config.js';

export interface TokenPayload {
  userId: string;
  workspaceId: string;
}

export class AuthService {
  generateToken(userId: string, workspaceId: string): string {
    const payload: TokenPayload = { userId, workspaceId };
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    } as jwt.SignOptions);
  }

  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, jwtConfig.secret) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
