import { SignOptions } from 'jsonwebtoken';

export const JwtConfig: {
  user_secret: string;
  user_expired: SignOptions['expiresIn'];
} = {
  user_secret: process.env.JWT_SECRET!,
  user_expired: '1d',
};
