import { ThemeToggle } from "@/components/theme-toggle";
import AuthButton from "@/components/AuthButton";
import { auth } from "@/auth";

export default async function Navigation() {
  const session = await auth();

  return (
    <>
      {!session ? (
        <nav>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center w-full justify-end space-x-4">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </nav>
      ) : (
        <nav className="bg-card/40 shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-foreground">
                  HTML Email
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <AuthButton />
              </div>
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
