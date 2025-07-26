import { User } from '@roleplay-identity/shared-schema';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {}; 