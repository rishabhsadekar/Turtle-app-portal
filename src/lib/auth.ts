import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
          hd: "tamu.edu", // Recommends and restricts to TAMU Google Workspace accounts
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = (user.email || "").toLowerCase().trim();
        if (!email.endsWith("@tamu.edu")) {
          // Strictly reject non-TAMU Google accounts
          return "/login?error=InvalidDomain";
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.name = token.name || session.user.name;
        session.user.email = token.email || session.user.email;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "turtle-robotics-texas-am-secret-key-2026",
};
