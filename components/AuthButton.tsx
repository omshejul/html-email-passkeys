"use client";

import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Key, User, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Badge variant="secondary">Loading...</Badge>;
  }

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-muted-foreground flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={session.user?.image || ""} />
                <AvatarFallback>
                  {session.user?.name?.[0] || session.user?.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              {session.user?.name || session.user?.email}
            </DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/passkeys" className="flex items-center">
                <Key className="mr-2 h-4 w-4" />
                <span>Manage Passkeys</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => signOut()}
              className="flex items-center"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <Button asChild>
      <Link href="/login">Sign In</Link>
    </Button>
  );
}
