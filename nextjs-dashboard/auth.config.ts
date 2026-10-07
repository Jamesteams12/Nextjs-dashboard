import type { NextAuthConfig } from 'next-auth';

const allowedDashboardPaths = ['/dashboard', '/dashboard/patients', '/dashboard/appointments', '/dashboard/tomorrow'];

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isAllowedDashboardPath = allowedDashboardPaths.some((path) => {
        if (path === '/dashboard') {
          return nextUrl.pathname === path || nextUrl.pathname === '/dashboard/';
        }
        return nextUrl.pathname === path || nextUrl.pathname.startsWith(`${path}/`);
      });
      const role = auth?.user?.role as 'owner' | 'front_desk' | undefined;

      if (isOnDashboard) {
        if (!isLoggedIn) return false;

        if (role === 'owner') return true;

        return isAllowedDashboardPath;
      }

      if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;