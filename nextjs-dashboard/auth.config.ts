import type { NextAuthConfig } from 'next-auth';

const frontDeskDashboardPaths = [
  '/dashboard/patients',
  '/dashboard/appointments',
  '/dashboard/tomorrow',
];

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        const userId =
          typeof token.id === 'string' ? token.id : token.sub;
        if (typeof userId === 'string') session.user.id = userId;
        if (token.role === 'owner') {
          session.user.role = 'owner';
        } else if (token.role === 'front_desk') {
          session.user.role = 'front_desk';
        }
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard =
        nextUrl.pathname === '/dashboard' ||
        nextUrl.pathname.startsWith('/dashboard/');
      const isLandingPage =
        nextUrl.pathname === '/' || nextUrl.pathname === '/login';
      const isFrontDeskPath = frontDeskDashboardPaths.some((path) => {
        return nextUrl.pathname === path || nextUrl.pathname.startsWith(`${path}/`);
      });
      const role = auth?.user?.role;

      if (isOnDashboard) {
        if (!isLoggedIn) return false;

        if (role === 'owner') return true;

        if (role === 'front_desk') {
          if (nextUrl.pathname === '/dashboard' || nextUrl.pathname === '/dashboard/') {
            return Response.redirect(new URL('/dashboard/patients', nextUrl));
          }
          if (isFrontDeskPath) return true;
          return Response.redirect(new URL('/dashboard/patients', nextUrl));
        }

        return false;
      }

      if (isLoggedIn && isLandingPage) {
        if (role === 'front_desk') {
          return Response.redirect(new URL('/dashboard/patients', nextUrl));
        }
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;