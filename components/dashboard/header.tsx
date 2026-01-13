"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Button variant="ghost" size="icon" className="lg:hidden">
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex-1" />
    </header>
  );
}
