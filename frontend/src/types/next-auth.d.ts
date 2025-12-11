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
  import { Session } from 'next-auth';

  interface UseSessionOptions {
    required?: boolean;
    onUnauthenticated?: () => void;
  }

  interface SessionContextValue {
    data: Session | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
    update: (data?: any) => Promise<Session | null>;
  }

  export function useSession(options?: UseSessionOptions): SessionContextValue;
  export function signIn(provider?: string, options?: any): Promise<any>;
  export function signOut(options?: any): Promise<any>;
  export function getSession(options?: any): Promise<Session | null>;
  export function getCsrfToken(): Promise<string | undefined>;
  export function getProviders(): Promise<Record<string, any> | null>;
  export const SessionProvider: React.FC<{
    children: React.ReactNode;
    session?: Session | null;
    refetchInterval?: number;
    refetchOnWindowFocus?: boolean;
  }>;
}

