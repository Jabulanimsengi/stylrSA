import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    backendJwt?: string;
    user: {
      id?: string;
      role?: string;
    } & DefaultSession['user'];
  }
}

