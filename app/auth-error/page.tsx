import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  const getErrorMessage = (error?: string) => {
    switch (error) {
      case "passkey-not-found":
        return {
          title: "Passkey Not Found",
          message:
            "The passkey you're trying to use is no longer registered. This can happen if the database was reset or if the passkey was deleted. Please try signing in with Google instead.",
        };
      case "passkey-new-user-not-allowed":
        return {
          title: "New User Registration",
          message:
            "New users can only create accounts using Google OAuth. Please use the 'New User' tab and sign up with Google to create your account.",
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

  const { title, message } = getErrorMessage(params.error);

  return (
    <div className="container mx-auto max-w-md py-16 px-4">
      <Card className=" gap-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-red-600 dark:text-red-400">
            {title}
          </CardTitle>
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
