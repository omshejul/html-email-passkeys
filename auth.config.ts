import Passkey from "next-auth/providers/passkey";
import type { NextAuthConfig } from "next-auth";

// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [Passkey],
  experimental: { enableWebAuthn: true },
} satisfies NextAuthConfig;
