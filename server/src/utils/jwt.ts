import jwt from 'jsonwebtoken';

const getJwtSecret = (): string => {
  return process.env.JWT_SECRET || 'mess_management_secure_jwt_secret_dev_key_2026';
};

const getJwtExpiresIn = (): string => {
  return process.env.JWT_EXPIRES_IN || '7d';
};

export interface TokenPayload {
  id: string;
  role: string;
  email: string;
  studentId?: string;
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: getJwtExpiresIn() as any,
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, getJwtSecret()) as TokenPayload;
};
