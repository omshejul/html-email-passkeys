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
import { Input } from "@/components/ui/input";

import { Alert } from "@/components/ui/alert";
import { signIn as passkeySignIn } from "next-auth/webauthn";
import {
  Laptop,
  Smartphone,
  Key,
  Cloud,
  Pencil,
  Save,
  X,
  Loader2,
} from "lucide-react";

interface Passkey {
  id: string;
  credentialID: string;
  credentialDeviceType: string;
  credentialBackedUp: boolean;
  transports: string | null;
  label: string | null;
  lastUsed: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function PasskeyManager() {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingPasskey, setIsAddingPasskey] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addPasskeyError, setAddPasskeyError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [savingLabelId, setSavingLabelId] = useState<string | null>(null);

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

  const handleUpdateLabel = async (passkeyId: string) => {
    try {
      setSavingLabelId(passkeyId);
      const response = await fetch(`/api/passkeys?id=${passkeyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ label: editLabel }),
      });

      if (response.ok) {
        setPasskeys(
          passkeys.map((p) =>
            p.id === passkeyId ? { ...p, label: editLabel } : p
          )
        );
        setEditingId(null);
        setEditLabel("");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update label");
      }
    } catch (error) {
      setError("Failed to connect to server");
      console.error("Error updating label:", error);
    } finally {
      setSavingLabelId(null);
    }
  };

  const getDeviceInfo = (passkey: Passkey) => {
    const transports = passkey.transports?.toLowerCase() || "";
    const deviceType = passkey.credentialDeviceType.toLowerCase();

    // Detect platform
    const isApple =
      transports.includes("hybrid") ||
      (transports.includes("internal") &&
        (navigator.platform.includes("Mac") ||
          navigator.platform.includes("iPhone") ||
          navigator.platform.includes("iPad")));

    const isWindows =
      transports.includes("internal") && navigator.platform.includes("Win");

    // Default name based on device type and platform
    let defaultName = "Security Key";
    if (deviceType === "singledevice") {
      if (isApple) {
        defaultName = "Apple Device";
      } else if (isWindows) {
        defaultName = "Windows Device";
      } else {
        defaultName = "Device-bound Key";
      }
    } else if (deviceType === "crossplatform") {
      if (transports.includes("usb")) {
        defaultName = "USB Security Key";
      } else if (transports.includes("nfc")) {
        defaultName = "NFC Security Key";
      } else if (transports.includes("ble")) {
        defaultName = "Bluetooth Security Key";
      }
    }

    return {
      name: passkey.label || defaultName,
      icon:
        deviceType === "singledevice" ? (
          isApple ? (
            <Laptop className="h-5 w-5" />
          ) : isWindows ? (
            <Laptop className="h-5 w-5" />
          ) : (
            <Smartphone className="h-5 w-5" />
          )
        ) : (
          <Key className="h-5 w-5" />
        ),
    };
  };

  useEffect(() => {
    fetchPasskeys();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading passkeys...</span>
        </div>
      </div>
    );
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
          {isAddingPasskey ? (
            <span className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Adding...</span>
            </span>
          ) : (
            "Add New Passkey"
          )}
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

      {error && (
        <Alert variant="destructive" className="mb-4">
          <div className="flex items-center space-x-2">
            <X className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </Alert>
      )}

      {addPasskeyError && (
        <Alert variant="destructive" className="mb-4">
          <div className="flex items-center space-x-2">
            <X className="h-4 w-4" />
            <span>{addPasskeyError}</span>
          </div>
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
          {passkeys.map((passkey) => {
            const deviceInfo = getDeviceInfo(passkey);
            return (
              <Card key={passkey.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-muted rounded-lg">
                        {deviceInfo.icon}
                      </div>
                      <div>
                        {editingId === passkey.id ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              value={editLabel}
                              onChange={(e) => setEditLabel(e.target.value)}
                              placeholder="Enter a label"
                              className="h-8"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdateLabel(passkey.id)}
                              disabled={savingLabelId === passkey.id}
                            >
                              {savingLabelId === passkey.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingId(null);
                                setEditLabel("");
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <span>{deviceInfo.name}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => {
                                setEditingId(passkey.id);
                                setEditLabel(passkey.label || "");
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </CardTitle>
                        )}
                        <CardDescription>
                          Added {new Date(passkey.createdAt).toLocaleString()}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {passkey.credentialBackedUp && (
                        <Badge
                          variant="secondary"
                          className="flex items-center space-x-1"
                        >
                          <Cloud className="h-3 w-3" />
                          <span>Synced</span>
                        </Badge>
                      )}
                      <Button
                        onClick={() => handleDeletePasskey(passkey.id)}
                        disabled={
                          deletingId === passkey.id || passkeys.length === 1
                        }
                        variant="destructive"
                        size="sm"
                      >
                        {deletingId === passkey.id ? (
                          <span className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Deleting...</span>
                          </span>
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {passkey.transports && (
                  <CardContent className="pt-0">
                    <div className="text-sm text-muted-foreground">
                      {passkey.lastUsed && (
                        <div>
                          Last used:{" "}
                          {new Date(passkey.lastUsed).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
