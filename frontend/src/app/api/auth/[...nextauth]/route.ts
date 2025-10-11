import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

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
          const r = await fetch(`${process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:3000"}/api/auth/sso`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              email: (profile as any)?.email,
              name: (profile as any)?.name,
            })
          });
          if (r.ok) {
            const data = await r.json();
            (token as any).backendJwt = data.jwt;
            (token as any).userId = data.user?.id;
            (token as any).role = data.user?.role;
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
