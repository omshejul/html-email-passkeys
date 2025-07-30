"use client";

import { useSession } from "next-auth/react";
import { signIn } from "next-auth/webauthn";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    if (session) {
      redirect("/");
    }
  }, [session]);

  const handlePasskeySignin = async (withEmail = false) => {
    try {
      setIsLoading(true);
      setError("");

      console.log(
        "Attempting passkey signin...",
        withEmail ? `with email: ${email}` : "without email"
      );

      if (withEmail && email) {
        // For first-time users, include email in the signin
        await signIn("passkey", {
          email: email,
          callbackUrl: "/",
        });
      } else {
        // For existing users
        await signIn("passkey", {
          callbackUrl: "/",
        });
      }
    } catch (err) {
      console.error("Passkey signin error:", err);

      // Handle WebAuthn cancellation gracefully
      if (err instanceof Error) {
        if (
          err.message.includes("not allowed") ||
          err.message.includes("timed out")
        ) {
          setError(""); // Don't show error for user cancellation
          console.log("User cancelled passkey operation");
          return;
        }

        // Handle passkey not found error
        if (err.message.includes("WebAuthn authenticator not found")) {
          setError(
            "Your passkey was not found. This can happen if the database was reset. Please switch to 'First Time' tab and register a new passkey."
          );
          setIsNewUser(true); // Switch to new user tab
          return;
        }

        setError("Failed to sign in with passkey. " + err.message);
      } else {
        setError("Failed to sign in with passkey. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (session) {
    return null; // Will redirect
  }

  return (
    <div className="relative flex flex-grow items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign in to your account
          </CardTitle>
          <CardDescription className="text-center">
            Use WebAuthn passkeys for secure, passwordless authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs
            value={isNewUser ? "new" : "existing"}
            onValueChange={(value) => setIsNewUser(value === "new")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">Existing User</TabsTrigger>
              <TabsTrigger value="new">First Time</TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <Button
                onClick={() => handlePasskeySignin(true)}
                disabled={isLoading || !email}
                className="w-full"
              >
                {isLoading
                  ? "Creating/Signing in..."
                  : "Create Passkey & Sign In"}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  🔐 <strong>First time?</strong> Enter your email above, then
                  your browser will create a new passkey
                </p>
                <p className="text-xs text-muted-foreground">
                  ✅ Works with Face ID, Touch ID, Windows Hello, or security
                  keys
                </p>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>First time setup:</strong>
                  <ol className="mt-2 text-sm space-y-1">
                    <li>1. Enter your email address above</li>
                    <li>2. Click &quot;Create Passkey &amp; Sign In&quot;</li>
                    <li>3. Your browser will ask to create a new passkey</li>
                    <li>4. Use Face ID/Touch ID/Windows Hello to create it</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="existing" className="space-y-4">
              <Button
                onClick={() => handlePasskeySignin(false)}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Signing in..." : "Sign in with Passkey"}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  🔐 <strong>Returning user?</strong> Your browser will use your
                  existing passkey
                </p>
                <p className="text-xs text-muted-foreground">
                  ✅ Works with Face ID, Touch ID, Windows Hello, or security
                  keys
                </p>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>How it works:</strong>
                  <ol className="mt-2 text-sm space-y-1">
                    <li>1. Click &quot;Sign in with Passkey&quot; above</li>
                    <li>
                      2. Your browser will ask to use your existing passkey
                    </li>
                    <li>
                      3. Use your biometric or security key to authenticate
                    </li>
                    <li>4. You&apos;ll be signed in securely!</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
