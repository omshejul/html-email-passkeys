import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PasskeyManager from "@/components/PasskeyManager";

export default async function PasskeysPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <PasskeyManager />
    </div>
  );
}
