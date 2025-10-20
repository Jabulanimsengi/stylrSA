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
      if (account) {
        try {
          const backendOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:5000";
          
          // Get role from cookie (set during signup)
          const cookieStore = await cookies();
          const roleCookie = await cookieStore.get('oauth_signup_role');
          const selectedRole = roleCookie?.value || 'CLIENT';
          
          // Clear the role cookie after reading
          if (roleCookie) {
            try {
              await cookieStore.delete('oauth_signup_role');
            } catch {
              // Cookie deletion might fail, that's okay
            }
          }
          
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
              const cookieStore = await cookies();
              await cookieStore.set('access_token', String(data.jwt), {
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
