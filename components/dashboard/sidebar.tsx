"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  LayoutDashboard,
  Settings,
  Gift,
  ScrollText,
  LogOut,
  ChevronUp,
  User,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/lib/actions/auth.actions";
import { useState } from "react";
import { getInitials } from "@/lib/utils/initials";
import Image from "next/image";

interface SidebarUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

interface SidebarProps {
  user: SidebarUser;
}

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Activity",
    href: "/dashboard/activity",
    icon: ScrollText,
  },
  {
    label: "Products",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    label: "Mystery Packs",
    href: "/packs",
    icon: Gift,
  },
  { href: "/dashboard/my-orders", label: "My Orders", icon: Package },
  {
    label: "Orders",
    href: "/dashboard/orders",
    icon: DollarSign,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r bg-card lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold">
          {/* <div className="font-bold text-xl text-white bg-violet-500 px-2 py-1 rounded-md">
            Pr
          </div>
          <span>Pullrs</span> */}
          <Image
            src={"/images/logo.png"}
            width={100}
            height={40}
            alt="W-Pulls"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors hover:bg-accent",
                isActive ? "bg-accent" : "text-muted-foreground"
              )}
            >
              {/* <item.icon className="h-4 w-4" /> */}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Menu */}
      <div className="relative border-t p-4">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          {/* Avatar */}
          {user?.image ? (
            <img
              src={user.image}
              alt={user.name || "Avatar"}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-violet-500/20"
            />
          ) : (
            <div className="h-8 w-8 shrink-0 aspect-square rounded-full overflow-hidden flex items-center justify-center bg-violet-500 text-white text-xs font-semibold leading-none">
              {getInitials(user)}
            </div>
          )}

          {/* Name & Email */}
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate font-medium">{user.name || "User"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>

          <ChevronUp
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              menuOpen ? "rotate-180" : ""
            )}
          />
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 rounded-lg border bg-card shadow-lg">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent transition-colors rounded-t-lg"
              onClick={() => setMenuOpen(false)}
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <div className="border-t" />
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors rounded-b-lg"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        )}
      </div>
    </aside>
  );
}
