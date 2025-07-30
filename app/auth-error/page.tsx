import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const getErrorMessage = (error?: string) => {
    switch (error) {
      case "passkey-not-found":
        return {
          title: "Passkey Not Found",
          message:
            "The passkey you're trying to use is no longer registered. This can happen if the database was reset or if the passkey was deleted. Please register a new passkey to continue.",
        };
      case "Configuration":
        return {
          title: "Authentication Error",
          message:
            "There was a problem with the authentication configuration. Please try again or contact support if the problem persists.",
        };
      default:
        return {
          title: "Authentication Error",
          message:
            "An error occurred during authentication. Please try again or contact support if the problem persists.",
        };
    }
  };

  const { title, message } = getErrorMessage(searchParams.error);

  return (
    <div className="container mx-auto max-w-md py-16 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{message}</p>
          <div className="flex space-x-4">
            <Button asChild variant="default">
              <Link href="/login">Back to Login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
