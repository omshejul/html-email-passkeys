import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

// Validate required environment variables
function validateAuthConfig() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // AUTH_SECRET validation
  if (!process.env.AUTH_SECRET) {
    errors.push("AUTH_SECRET environment variable is required for NextAuth.js");
  } else {
    if (process.env.AUTH_SECRET.length < 32) {
      errors.push(
        "AUTH_SECRET must be at least 32 characters long for security"
      );
    }

    if (process.env.AUTH_SECRET === "fallback-secret-for-development") {
      if (process.env.NODE_ENV === "production") {
        errors.push(
          "AUTH_SECRET cannot use the development fallback value in production"
        );
      } else {
        warnings.push(
          "Using development fallback AUTH_SECRET - replace with secure secret"
        );
      }
    }

    // Check for common weak secrets
    const weakSecrets = [
      "secret",
      "password",
      "123456",
      "nextauth",
      "your-secret-here",
    ];
    if (weakSecrets.includes(process.env.AUTH_SECRET.toLowerCase())) {
      errors.push(
        "AUTH_SECRET is using a common/weak value - use a cryptographically secure random string"
      );
    }
  }

  // Database validation for Prisma
  if (!process.env.DATABASE_URL) {
    warnings.push(
      "DATABASE_URL not found - make sure your database is configured"
    );
  }

  // Development environment checks
  if (process.env.NODE_ENV !== "production") {
    if (!process.env.NEXTAUTH_URL) {
      warnings.push(
        "NEXTAUTH_URL not set - this may cause issues with redirects"
      );
    }
  }

  // Production environment checks
  if (process.env.NODE_ENV === "production") {
    if (!process.env.NEXTAUTH_URL) {
      errors.push("NEXTAUTH_URL is required in production");
    }
  }

  // Display warnings
  if (warnings.length > 0) {
    console.warn(`
⚠️  NEXTAUTH CONFIGURATION WARNINGS ⚠️
${warnings.map((warning) => `⚠️  ${warning}`).join("\n")}
`);
  }

  // Throw errors if any exist
  if (errors.length > 0) {
    throw new Error(`
🚨 NEXTAUTH CONFIGURATION ERROR 🚨

The following configuration issues MUST be fixed:
${errors.map((error) => `❌ ${error}`).join("\n")}

To fix this:
1. Create a .env.local file in your project root
2. Add the following variables:
   AUTH_SECRET=your-secure-secret-here
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000" (for development)

3. Generate a secure secret: openssl rand -base64 32
4. Restart your development server

For more info: https://next-auth.js.org/configuration/options
    `);
  }
}

// Run validation
validateAuthConfig();

const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  ...authConfig,
});
