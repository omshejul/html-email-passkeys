"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { signIn as passkeySignIn } from "next-auth/webauthn";
import { Alert } from "@/components/ui/alert";

interface Passkey {
  id: string;
  credentialID: string;
  credentialDeviceType: string;
  credentialBackedUp: boolean;
  transports: string | null;
}

export default function PasskeyManager() {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingPasskey, setIsAddingPasskey] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addPasskeyError, setAddPasskeyError] = useState<string | null>(null);

  const fetchPasskeys = async () => {
    try {
      setError(null);
      const response = await fetch("/api/passkeys");
      const data = await response.json();

      if (response.ok) {
        setPasskeys(data.passkeys);
      } else {
        setError(data.error || "Failed to fetch passkeys");
        console.error("Error fetching passkeys:", data.error);
      }
    } catch (error) {
      setError("Failed to connect to server");
      console.error("Error fetching passkeys:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPasskey = async () => {
    try {
      setIsAddingPasskey(true);
      setAddPasskeyError(null);
      await passkeySignIn("passkey", { action: "register" });
      // Refresh the list after adding
      await fetchPasskeys();
    } catch (err) {
      console.error("Add passkey error:", err);
      if (
        err instanceof Error &&
        (err.message.includes("not allowed") ||
          err.message.includes("timed out"))
      ) {
        console.log("User cancelled passkey registration");
        return;
      }
      setAddPasskeyError("Failed to add passkey. Please try again.");
    } finally {
      setIsAddingPasskey(false);
    }
  };

  const handleDeletePasskey = async (passkeyId: string) => {
    if (!confirm("Are you sure you want to delete this passkey?")) {
      return;
    }

    try {
      setDeletingId(passkeyId);
      setError(null);
      const response = await fetch(`/api/passkeys?id=${passkeyId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (response.ok) {
        setPasskeys(passkeys.filter((p) => p.id !== passkeyId));
      } else {
        setError(data.error || "Failed to delete passkey");
        console.error("Error deleting passkey:", data.error);
      }
    } catch (error) {
      setError("Failed to connect to server");
      console.error("Error deleting passkey:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const getDeviceTypeIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case "singledevice":
        return "📱";
      case "crossplatform":
        return "🔑";
      default:
        return "🔐";
    }
  };

  const formatDeviceType = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case "singledevice":
        return "Device-bound";
      case "crossplatform":
        return "Cross-platform";
      default:
        return deviceType;
    }
  };

  useEffect(() => {
    fetchPasskeys();
  }, []);

  if (loading) {
    return <div className="text-center">Loading passkeys...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Manage Passkeys</h2>
          <p className="text-muted-foreground">
            Add or remove passkeys for secure, passwordless authentication
          </p>
        </div>
        <Button
          onClick={handleAddPasskey}
          disabled={isAddingPasskey}
          className="bg-green-600 hover:bg-green-700 dark:bg-green-400 dark:hover:bg-green-500"
        >
          {isAddingPasskey ? "Adding..." : "Add New Passkey"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}

      {addPasskeyError && (
        <Alert variant="destructive" className="mb-4">
          {addPasskeyError}
        </Alert>
      )}

      {passkeys.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>No passkeys found. Add your first passkey to get started!</p>
              <p className="mt-2 text-sm">
                Note: If you previously had passkeys, they may have been reset.
                Please add a new passkey to continue.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {passkeys.map((passkey) => (
            <Card key={passkey.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {getDeviceTypeIcon(passkey.credentialDeviceType)}
                    </span>
                    <div>
                      <CardTitle className="text-lg">
                        {formatDeviceType(passkey.credentialDeviceType)} Passkey
                      </CardTitle>
                      <CardDescription>
                        ID: {passkey.credentialID.slice(0, 20)}...
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {passkey.credentialBackedUp && (
                      <Badge variant="secondary">Synced</Badge>
                    )}
                    <Button
                      onClick={() => handleDeletePasskey(passkey.id)}
                      disabled={
                        deletingId === passkey.id || passkeys.length === 1
                      }
                      variant="destructive"
                      size="sm"
                    >
                      {deletingId === passkey.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {passkey.transports && (
                <CardContent className="pt-0">
                  <div className="text-sm text-muted-foreground">
                    Transport methods: {passkey.transports}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
