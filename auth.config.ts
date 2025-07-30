import Passkey from "next-auth/providers/passkey";
import type { NextAuthConfig } from "next-auth";

// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [Passkey],
  experimental: { enableWebAuthn: true },
  pages: {
    error: "/auth-error",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Handle WebAuthn errors
      if (account?.type === "credentials" && account?.provider === "passkey") {
        if (credentials?.error === "WebAuthnVerificationError") {
          // Passkey not found or invalid
          return "/auth-error?error=passkey-not-found";
        }
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
