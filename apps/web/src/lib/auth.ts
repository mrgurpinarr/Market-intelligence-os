import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || 'market_intelligence_default_secret_key_32bytes',
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user }) {
      if (user.email) {
        try {
          const { syncUserProfile } = await import('./user');
          await syncUserProfile(user.email, user.name, user.image);
        } catch (e) {
          console.error('Failed to sync user profile:', e);
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
};
