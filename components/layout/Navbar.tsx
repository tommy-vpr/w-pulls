"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { User, Settings, LogOut, ChevronDown, Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import { signOutAction } from "@/lib/actions/auth.actions";
import { getInitials } from "@/lib/utils/initials";
import { CartIcon } from "./CartIcon";

type NavItem = {
  label: string;
  href: string;
};

const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Packs", href: "/packs" },
  { label: "Shop", href: "/store" },
  { label: "Changelog", href: "/changelog" },
];

// Holographic corner brackets
function HoloBrackets() {
  return (
    <>
      <div className="absolute top-0 left-0 w-4 h-4">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-cyan-400 to-transparent" />
        <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-cyan-400 to-transparent" />
      </div>
      <div className="absolute top-0 right-0 w-4 h-4">
        <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-cyan-400 to-transparent" />
        <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-cyan-400 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 w-4 h-4">
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-cyan-400 to-transparent" />
        <div className="absolute bottom-0 left-0 h-full w-px bg-gradient-to-t from-cyan-400 to-transparent" />
      </div>
      <div className="absolute bottom-0 right-0 w-4 h-4">
        <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-cyan-400 to-transparent" />
        <div className="absolute bottom-0 right-0 h-full w-px bg-gradient-to-t from-cyan-400 to-transparent" />
      </div>
    </>
  );
}

export function Navbar() {
  const { data: session, status } = useSession();
  const [active, setActive] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <header className="fixed top-0 left-0 right-0 z-50 font-mono">
      <div
        className={`
          relative mx-3 mt-3 rounded-xl transition-all duration-500
          border border-cyan-400/20 backdrop-blur-xl
          ${
            scrolled
              ? "bg-slate-950/90 shadow-[0_0_30px_rgba(0,255,255,0.1),0_10px_40px_rgba(0,0,0,0.5)]"
              : "bg-slate-950/60 shadow-[0_0_20px_rgba(0,255,255,0.05)]"
          }
        `}
      >
        {/* Corner brackets */}
        {/* <div className="absolute inset-2 pointer-events-none">
          <HoloBrackets />
        </div> */}

        <nav className="relative flex h-14 items-center justify-between px-5">
          {/* Logo */}
          <Link href="/" className="group relative flex items-center gap-3">
            {/* Logo container with glow */}
            <div className="relative">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 border border-cyan-400/30 shadow-[0_0_15px_rgba(0,255,255,0.3)]">
                {/* <span className="font-bold text-white text-sm tracking-wider">
                  W
                </span> */}
                <Image
                  src={"/images/w-pull-logo.png"}
                  width={32}
                  height={32}
                  alt="w-pull"
                />
              </div>
              {/* Glow backdrop */}
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-cyan-400/30 to-fuchsia-500/20 blur-md -z-10 opacity-60" />
            </div>

            <div className="flex flex-col">
              <span className="font-bold text-base text-white tracking-widest">
                W-PULL
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-cyan-400/50 -mt-0.5">
                Card System
              </span>
            </div>
          </Link>

          {/* Center - Nav Links */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex items-center"
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
                    className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-400/15 to-fuchsia-500/10 border border-cyan-400/25 shadow-[0_0_15px_rgba(0,255,255,0.2),inset_0_0_15px_rgba(0,255,255,0.05)]"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}

                <Link
                  href={item.href}
                  className="relative z-10 block rounded-lg px-4 py-2 text-sm font-medium uppercase tracking-wider text-cyan-100/70 transition-all duration-300 hover:text-cyan-300"
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Right - User Menu / Auth */}
          <div className="flex items-center gap-3">
            <CartIcon />

            {status === "loading" ? (
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-400/10 to-fuchsia-500/10 border border-cyan-400/20 animate-pulse" />
            ) : session?.user ? (
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`
                      cursor-pointer flex items-center gap-2 rounded-lg p-1.5 pr-3
                      bg-gradient-to-br from-cyan-400/10 to-fuchsia-500/5
                      border border-cyan-400/20 transition-all duration-300
                      hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(0,255,255,0.15)]
                      ${
                        userMenuOpen
                          ? "shadow-[0_0_20px_rgba(0,255,255,0.2)] border-cyan-400/40"
                          : ""
                      }
                    `}
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "Avatar"}
                      className="h-7 w-7 rounded-md object-cover ring-1 ring-cyan-400/30"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-md flex items-center justify-center text-white text-xs font-semibold bg-gradient-to-br from-cyan-400/30 to-fuchsia-500/30">
                      {getInitials(session.user)}
                    </div>
                  )}
                  <span className="text-xs text-cyan-100/80 hidden sm:block">
                    {session.user.name?.split(" ")[0] || "User"}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-cyan-400/60 transition-transform duration-300 ${
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
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden bg-slate-950/95 border border-cyan-400/20 shadow-[0_0_30px_rgba(0,255,255,0.1),0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                    >
                      {/* Corner brackets */}
                      {/* <div className="absolute inset-1 pointer-events-none">
                          <HoloBrackets />
                        </div> */}

                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-cyan-400/10 bg-gradient-to-r from-cyan-400/5 to-transparent">
                        <p className="text-sm font-semibold text-white truncate">
                          {session.user.name || "User"}
                        </p>
                        <p className="text-[10px] font-mono text-cyan-400/50 truncate">
                          {session.user.email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        {[
                          {
                            href: "/dashboard",
                            icon: Zap,
                            label: "Dashboard",
                          },
                          {
                            href: "/dashboard/profile",
                            icon: User,
                            label: "Profile",
                          },
                          {
                            href: "/dashboard/settings",
                            icon: Settings,
                            label: "Settings",
                          },
                        ].map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-xs uppercase tracking-wider text-cyan-100/70 hover:text-cyan-300 hover:bg-cyan-400/5 transition-all duration-300 group"
                          >
                            <item.icon className="h-4 w-4 text-cyan-400/50 group-hover:text-cyan-400 transition-colors" />
                            {item.label}
                            <div className="ml-auto w-1 h-1 rounded-full bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        ))}
                      </div>

                      {/* Sign Out */}
                      <div className="border-t border-red-400/10 py-1">
                        <form action={signOutAction}>
                          <button
                            type="submit"
                            className="cursor-pointer flex w-full items-center gap-3 px-4 py-2.5 text-xs uppercase tracking-wider text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-300 group"
                          >
                            <LogOut className="h-4 w-4 text-rose-400/50 group-hover:text-rose-400 transition-colors" />
                            Sign out
                            <div className="ml-auto w-1 h-1 rounded-full bg-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                  className="px-4 py-2 text-xs uppercase tracking-wider text-cyan-100/70 hover:text-cyan-300 transition-all duration-300"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth"
                  className="relative px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white rounded-lg bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 border border-cyan-400/30 shadow-[0_0_20px_rgba(0,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,255,255,0.3)] hover:border-cyan-400/50 transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </nav>
        {/* Bottom center accent glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/4 h-[6px] bg-cyan-400/50 blur-md" />
      </div>
    </header>
  );
}
