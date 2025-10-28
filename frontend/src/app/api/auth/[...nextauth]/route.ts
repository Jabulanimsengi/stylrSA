import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { cookies } from "next/headers";

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && account.provider === 'google') {
        try {
          // Read role from cookie for Google OAuth
          const cookieStore = cookies();
          const roleCookie = cookieStore.get('oauth_signup_role');
          const selectedRole = roleCookie?.value || 'CLIENT';
          
          console.log('[NextAuth] OAuth signup - role from cookie:', selectedRole);
          console.log('[NextAuth] Cookie value:', roleCookie);

          // Clear cookie after reading
          cookieStore.delete('oauth_signup_role');

          const backendOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:5000";
          const r = await fetch(`${backendOrigin}/api/auth/sso`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              email: (profile as any)?.email,
              name: (profile as any)?.name,
              role: selectedRole,
            })
          });
          if (r.ok) {
            const data = await r.json();
            (token as any).backendJwt = data.jwt;
            (token as any).userId = data.user?.id;
            (token as any).role = data.user?.role;
            // Attach backend JWT as httpOnly cookie for API rewrites
            try {
              const isProduction = process.env.NODE_ENV === 'production';
              cookies().set('access_token', String(data.jwt), {
                httpOnly: true,
                sameSite: 'lax',
                secure: isProduction,
                path: '/',
                maxAge: 60 * 60 * 24, // 1 day in seconds
              });
            } catch {}
          }
        } catch {
          // ignore
        }
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).backendJwt = (token as any).backendJwt;
      if (session.user) {
        (session.user as any).id = (token as any).userId;
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };