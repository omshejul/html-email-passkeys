"use client";

import { useSession } from "next-auth/react";
import { signIn, signOut } from "next-auth/react";
import { signIn as passkeySignIn } from "next-auth/webauthn";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [isAddingPasskey, setIsAddingPasskey] = useState(false);

  const handleAddPasskey = async () => {
    try {
      setIsAddingPasskey(true);
      await passkeySignIn("passkey", { action: "register" });
    } catch (err) {
      console.error("Add passkey error:", err);
      // Don't show error for user cancellation
      if (
        err instanceof Error &&
        (err.message.includes("not allowed") ||
          err.message.includes("timed out"))
      ) {
        console.log("User cancelled passkey registration");
        return;
      }
      // Only show errors for actual failures, not cancellations
      alert("Failed to add passkey. Please try again.");
    } finally {
      setIsAddingPasskey(false);
    }
  };

  if (status === "loading") {
    return <Badge variant="secondary">Loading...</Badge>;
  }

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {session.user?.image && (
            <img
              src={session.user.image}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm font-medium text-foreground">
            {session.user?.name || session.user?.email}
          </span>
        </div>

        <Button
          onClick={handleAddPasskey}
          disabled={isAddingPasskey}
          variant="default"
          size="sm"
          className="bg-green-600 hover:bg-green-700 dark:bg-green-400 dark:hover:bg-green-500"
        >
          {isAddingPasskey ? "Adding..." : "Add Passkey"}
        </Button>

        <Button onClick={() => signOut()} variant="secondary" size="sm">
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button asChild>
      <Link href="/login">Sign In</Link>
    </Button>
  );
}
