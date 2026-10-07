import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    role?: 'owner' | 'front_desk';
  }

  interface Session {
    user: DefaultSession['user'] & {
      id?: string;
      role?: 'owner' | 'front_desk';
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: 'owner' | 'front_desk';
  }
}
