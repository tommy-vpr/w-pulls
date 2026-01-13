"use client";

import { signOutAction } from "@/lib/actions/auth.actions";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </form>
  );
}
