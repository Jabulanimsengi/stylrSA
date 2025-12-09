import 'next-auth';

declare module 'next-auth' {
  interface Session {
    backendJwt?: string;
    user?: {
      id?: string;
      email?: string;
      name?: string;
      role?: string;
    };
  }
}

declare module 'next-auth/react' {
  export * from 'next-auth/react';
}
