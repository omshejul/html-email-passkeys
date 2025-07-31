"use client";

import { useSession, signIn as nextAuthSignIn } from "next-auth/react";
import { signIn } from "next-auth/webauthn";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LuKey, LuUserPlus, LuLogIn } from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    if (session) {
      redirect("/");
    }
  }, [session]);

  const handlePasskeySignin = async () => {
    try {
      setIsLoading(true);
      setError("");

      console.log("Attempting passkey signin...");

      // For existing users
      await signIn("passkey", {
        callbackUrl: "/",
      });
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
            "Passkey not found. Try signing in with Google instead, or contact support if you need help."
          );
          return;
        }

        setError("Passkey sign-in failed. " + err.message);
      } else {
        setError("Passkey sign-in failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignin = async () => {
    try {
      setIsGoogleLoading(true);
      setError("");
      await nextAuthSignIn("google", { callbackUrl: "/" });
    } catch (err) {
      console.error("Google signin error:", err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
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
    <motion.div
      className="relative flex flex-grow items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, scale: 0.95, y: 4, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <Card className="w-full max-w-md py-8 sm:p-4 sm:py-12 md:py-12 lg:py-12">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign in to your account
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your account or create a new one.
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
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative mb-4">
                <TabsList className="grid w-full bg-muted grid-cols-2">
                  <TabsTrigger
                    value="existing"
                    className="data-[state=active]:shadow-none data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent border-none w-full relative z-10"
                  >
                    <LuLogIn className="mr-2 h-4 w-4" />
                    Existing User
                  </TabsTrigger>
                  <TabsTrigger
                    value="new"
                    className="data-[state=active]:shadow-none data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent border-none w-full relative z-10"
                  >
                    <LuUserPlus className="mr-2 h-4 w-4" />
                    New User
                  </TabsTrigger>
                </TabsList>
                <motion.div
                  // "cursor-pointer data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                  className="absolute top-[10%] bottom-[10%] w-[49%] mx-[1%] border border-border bg-background dark:bg-input/30 px-2 py-1 inline-flex h-[calc(80%)] flex-1 items-center justify-center gap-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                  animate={{
                    x: isNewUser ? "100%" : "0%",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                    duration: 0.25,
                  }}
                />
              </div>
            </motion.div>

            <TabsContent value="new" className="space-y-4">
              <div className="space-y-3">
                <Button
                  onClick={handleGoogleSignin}
                  disabled={isGoogleLoading}
                  className="w-full"
                  variant="outline"
                >
                  <FcGoogle className="mr-2 h-4 w-4" />
                  {isGoogleLoading
                    ? "Creating account..."
                    : "Sign up with Google"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="existing" className="space-y-4">
              <div className="space-y-3">
                <Button
                  onClick={handleGoogleSignin}
                  disabled={isGoogleLoading}
                  variant="outline"
                  className="w-full"
                >
                  <FcGoogle className="mr-2 h-4 w-4" />
                  {isGoogleLoading ? "Signing in..." : "Continue with Google"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 py-0.5 text-muted-foreground rounded-md border border-border">
                      Or use your passkey
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handlePasskeySignin}
                  disabled={isLoading}
                  className="w-full"
                >
                  <LuKey className="mr-2 h-4 w-4" />
                  {isLoading ? "Signing in..." : "Sign in with Passkey"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
