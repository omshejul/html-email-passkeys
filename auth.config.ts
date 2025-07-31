import Passkey from "next-auth/providers/passkey";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [
    Passkey,
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  experimental: {
    enableWebAuthn: true,
  },
  pages: {
    error: "/auth-error",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Allow Google OAuth account linking with existing accounts
      if (account?.type === "oauth" && account?.provider === "google") {
        return true; // Allow Google OAuth even if email already exists
      }

      // Handle WebAuthn errors and prevent new user creation
      if (account?.type === "credentials" && account?.provider === "passkey") {
        // Check if this is a new user trying to create a passkey
        if (credentials?.isNewUser) {
          return "/auth-error?error=passkey-new-user-not-allowed";
        }

        if (
          credentials?.error &&
          credentials.error.toString().includes("WebAuthnVerificationError")
        ) {
          // Passkey not found or invalid
          return "/auth-error?error=passkey-not-found";
        }
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
