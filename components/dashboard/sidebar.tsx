"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  LayoutDashboard,
  Settings,
  Gift,
  Activity,
  LogOut,
  ChevronUp,
  User,
  DollarSign,
  Sparkles,
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
    adminOnly: true,
  },
  {
    label: "Activity",
    href: "/dashboard/activity",
    icon: Activity,
    adminOnly: true,
  },
  {
    label: "Products",
    href: "/dashboard/products",
    icon: Package,
    adminOnly: true,
  },
  {
    label: "Mystery Packs",
    href: "/packs",
    icon: Gift,
    adminOnly: true,
  },
  {
    label: "My Orders",
    href: "/dashboard/my-orders",
    icon: Package,
    adminOnly: false,
  },
  {
    label: "Orders",
    href: "/dashboard/orders",
    icon: DollarSign,
    adminOnly: true,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
    adminOnly: false,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    adminOnly: false,
  },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user?.role === "ADMIN";

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  console.log(isAdmin);

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 lg:flex lg:flex-col bg-[#0a0a0f] border-r border-purple-500/20">
      {/* Animated gradient border */}
      <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-cyan-500 via-purple-500 to-pink-500 opacity-50" />

      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-cyan-900/10 pointer-events-none" />

      {/* Logo */}
      <div className="relative flex h-16 items-center border-b border-purple-500/20 px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold group"
        >
          <div className="relative">
            <Image
              src={"/images/logo.png"}
              width={100}
              height={40}
              alt="W-Pulls"
              className="relative z-10 invert"
            />
            {/* Logo glow */}
            <div className="absolute inset-0 blur-lg bg-purple-500/30 group-hover:bg-cyan-500/30 transition-colors duration-500" />
          </div>
        </Link>

        {/* Role Badge */}
        <div
          className={cn(
            "ml-auto px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
            isAdmin
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
              : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
          )}
        >
          {isAdmin ? "Admin" : "User"}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/20">
        {isAdmin && (
          <div className="px-3 py-2 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-purple-400/60 flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              Admin Panel
            </span>
          </div>
        )}

        {filteredNavItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300",
                isActive ? "text-white" : "text-gray-400 hover:text-white"
              )}
            >
              {/* Active background glow */}
              {isActive && (
                <>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600/20 to-cyan-600/20" />
                  <div className="absolute inset-0 rounded-lg border border-purple-500/30 shadow-lg shadow-purple-500/10" />
                  {/* Left accent bar */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-gradient-to-b from-cyan-400 to-purple-500 shadow-lg shadow-cyan-400/50" />
                </>
              )}

              {/* Hover glow effect */}
              <div
                className={cn(
                  "absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600/0 to-cyan-600/0 transition-all duration-300",
                  !isActive &&
                    "group-hover:from-purple-600/10 group-hover:to-cyan-600/10"
                )}
              />

              {/* Icon with glow */}
              <div className="relative z-10">
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-all duration-300",
                    isActive
                      ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                      : "text-gray-500 group-hover:text-purple-400"
                  )}
                />
              </div>

              <span className="relative z-10">{item.label}</span>

              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Decorative scanner line */}
      <div className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-scan pointer-events-none" />

      {/* User Menu */}
      <div className="relative border-t border-purple-500/20 p-4">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 hover:bg-purple-500/10"
        >
          {/* Avatar with neon ring */}
          <div className="relative">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name || "Avatar"}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-purple-600 to-cyan-600 text-white text-xs font-bold">
                {getInitials(user)}
              </div>
            )}
            {/* Avatar glow ring */}
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 opacity-50 blur-sm group-hover:opacity-75 transition-opacity" />
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 opacity-20" />

            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0a0a0f] bg-emerald-500 shadow-lg shadow-emerald-500/50" />
          </div>

          {/* Name & Email */}
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate font-semibold text-white">
              {user.name || "User"}
            </p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>

          <ChevronUp
            className={cn(
              "h-4 w-4 text-gray-500 transition-transform duration-300",
              menuOpen ? "rotate-180" : ""
            )}
          />
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 rounded-lg border border-purple-500/30 bg-[#0a0a0f]/95 backdrop-blur-xl shadow-2xl shadow-purple-500/10 overflow-hidden">
            {/* Dropdown glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-cyan-900/20 pointer-events-none" />

            <Link
              href="/dashboard/profile"
              className="group relative flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 to-cyan-600/0 group-hover:from-purple-600/10 group-hover:to-cyan-600/10 transition-all" />
              <User className="h-4 w-4 relative z-10" />
              <span className="relative z-10">Profile</span>
            </Link>
            <Link
              href="/dashboard/settings"
              className="group relative flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 to-cyan-600/0 group-hover:from-purple-600/10 group-hover:to-cyan-600/10 transition-all" />
              <Settings className="h-4 w-4 relative z-10" />
              <span className="relative z-10">Settings</span>
            </Link>

            <div className="border-t border-purple-500/20" />

            <form action={signOutAction}>
              <button
                type="submit"
                className="group relative flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 transition-all" />
                <LogOut className="h-4 w-4 relative z-10" />
                <span className="relative z-10">Sign out</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom decorative element */}
      <div className="h-1 bg-gradient-to-r from-purple-600 via-cyan-500 to-pink-500 opacity-75" />
    </aside>
  );
}
