import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Welcome back, {session.user?.name || session.user?.email}!
        </h1>
        <p className="text-xl text-muted-foreground">
          Your HTML email dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📧 Create Email</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Design beautiful HTML email templates
            </CardDescription>
            <Button className="w-full">Start Creating</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📋 My Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Manage your saved email templates
            </CardDescription>
            <Button className="w-full" variant="secondary">
              View Templates
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📊 Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Track email performance and engagement
            </CardDescription>
            <Button className="w-full" variant="outline">
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      <Alert className="mt-8">
        <AlertDescription>
          <strong>🔑 Security Tip:</strong>
          <span className="text-muted-foreground">
            {" "}
            You can add multiple passkeys to your account for different devices.
            Click &quot;Add Passkey&quot; in the navigation to register a new
            one.
          </span>
        </AlertDescription>
      </Alert>
    </div>
  );
}
