"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { signOutAction } from "@/lib/actions/auth.actions";
import { getInitials } from "@/lib/utils/initials";

type NavItem = {
  label: string;
  href: string;
};

const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Packs", href: "/packs" },
  { label: "Products", href: "/products" },
  { label: "Changelog", href: "/changelog" },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const [active, setActive] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Detect scroll for glass morphism
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        ${
          scrolled
            ? "bg-white/10 backdrop-blur-2xl ring-1 ring-white/15 shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
            : "bg-transparent"
        }
      `}
    >
      <nav className="mx-auto flex h-16 max-w-8xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="relative flex items-center">
          <Image
            src="/images/logo.png"
            alt="WPull"
            width={96}
            height={36}
            className="relative z-10 invert"
          />
          <span
            aria-hidden
            className="absolute inset-0 rounded-md blur-xl"
            style={{
              background:
                "radial-gradient(circle, rgba(96,165,250,0.8), transparent 70%)",
            }}
          />
        </Link>

        <div className="flex items-center gap-2">
          {/* Nav Links */}
          <div
            className="relative flex items-center gap-1"
            onMouseLeave={() => setActive(null)}
          >
            {NAV.map((item) => (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setActive(item.href)}
              >
                {active === item.href && (
                  <motion.span
                    layoutId="nav-pill"
                    className="
                    absolute inset-0 rounded-full
                    bg-white/15
                    ring-1 ring-white/20
                    backdrop-blur-xl
                  "
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 32,
                    }}
                  />
                )}

                <Link
                  href={item.href}
                  className="
                  relative z-10 block rounded-full
                  px-4 py-2 text-sm 
                  text-white/80 transition-colors
                  hover:text-white
                "
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center gap-3">
            {status === "loading" ? (
              <div className="h-9 w-9 rounded-full bg-white/10 animate-pulse" />
            ) : session?.user ? (
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="cursor-pointer flex items-center gap-2 rounded-full p-1 pr-3 bg-white/5 hover:bg-white/10 ring-1 ring-white/10 transition-all"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "Avatar"}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                      {getInitials(session.user)}
                    </div>
                  )}
                  <span className="text-sm text-white/80 hidden sm:block">
                    {session.user.name?.split(" ")[0] || "User"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-white/60 transition-transform ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-xl bg-black/90 backdrop-blur-xl ring-1 ring-white/10 shadow-2xl overflow-hidden"
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white truncate">
                          {session.user.name || "User"}
                        </p>
                        <p className="text-xs text-white/50 truncate">
                          {session.user.email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <User className="h-4 w-4" />
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                        <Link
                          href="/dashboard/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                      </div>

                      {/* Sign Out */}
                      <div className="border-t border-white/10 py-1">
                        <form action={signOutAction}>
                          <button
                            type="submit"
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign out
                          </button>
                        </form>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth"
                  className="px-4 py-2 text-sm text-white/80 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth"
                  className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
