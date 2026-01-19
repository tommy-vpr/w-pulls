// components/layout/Footer.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Instagram, Mail, ExternalLink } from "lucide-react";

const FOOTER_LINKS = {
  product: [
    { label: "Packs", href: "/packs" },
    { label: "Store", href: "/store" },
    { label: "Changelog", href: "/changelog" },
    { label: "Roadmap", href: "/roadmap" },
  ],
  support: [
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
    { label: "Discord", href: "#", external: true },
    { label: "Support", href: "/support" },
  ],
  legal: [
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
    { label: "Refunds", href: "/refunds" },
  ],
};

const SOCIAL_LINKS = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Mail, href: "mailto:support@wpull.com", label: "Email" },
];

const CLIP_PATH =
  "polygon(0% 15%, 0 0, 15% 0%, 60% 0, 69% 9%, 100% 9%, 100% 100%, 0 100%)";

export function Footer() {
  return (
    <footer className="relative mt-20 font-mono">
      {/* Border layer - slightly larger */}
      <div
        className="absolute -top-[3px] left-0 right-0 bottom-0 bg-gradient-to-r from-cyan-400/50 via-cyan-400/80 to-cyan-400/50"
        style={{ clipPath: CLIP_PATH }}
      />

      {/* Main footer container */}
      <div className="relative bg-slate-950/95" style={{ clipPath: CLIP_PATH }}>
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/5 via-transparent to-fuchsia-500/5 pointer-events-none" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(0,255,255,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative px-6 pt-16 pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Main footer content */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
              {/* Brand column */}
              <div className="col-span-2">
                <Link
                  href="/"
                  className="group inline-flex items-center gap-3 mb-4"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 border border-cyan-400/30 shadow-[0_0_15px_rgba(0,255,255,0.3)]">
                      <Image
                        src="/images/w-pull-logo.png"
                        width={32}
                        height={32}
                        alt="W-Pull"
                      />
                    </div>
                    <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-cyan-400/30 to-fuchsia-500/20 blur-md -z-10 opacity-60" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg text-white tracking-widest">
                      W-PULL
                    </span>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-cyan-400/50 -mt-0.5">
                      Card System
                    </span>
                  </div>
                </Link>

                <p className="text-sm text-cyan-100/50 max-w-xs mb-6 leading-relaxed">
                  Experience the thrill of digital card collecting with stunning
                  holographic effects and rare pulls.
                </p>

                {/* Social links */}
                <div className="flex items-center gap-2">
                  {SOCIAL_LINKS.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="group p-2.5 rounded-lg bg-gradient-to-br from-cyan-400/10 to-fuchsia-500/5 border border-cyan-400/20 hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(0,255,255,0.15)] transition-all duration-300"
                    >
                      <social.icon className="w-4 h-4 text-cyan-400/60 group-hover:text-cyan-400 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Product links */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-4">
                  Product
                </h4>
                <ul className="space-y-2.5">
                  {FOOTER_LINKS.product.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-cyan-100/50 hover:text-cyan-300 transition-colors duration-300 flex items-center gap-1"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support links */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-4">
                  Support
                </h4>
                <ul className="space-y-2.5">
                  {FOOTER_LINKS.support.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-cyan-100/50 hover:text-cyan-300 transition-colors duration-300 flex items-center gap-1"
                      >
                        {link.label}
                        {link.external && (
                          <ExternalLink className="w-3 h-3 text-cyan-400/40" />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal links */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-4">
                  Legal
                </h4>
                <ul className="space-y-2.5">
                  {FOOTER_LINKS.legal.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-cyan-100/50 hover:text-cyan-300 transition-colors duration-300"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Divider */}
            <div className="relative h-px mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
            </div>

            {/* Bottom bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-cyan-100/30">
                © {new Date().getFullYear()} W-Pull. All rights reserved.
              </p>

              <div className="flex items-center gap-2 text-[10px] text-cyan-400/40 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Systems Online
              </div>
            </div>
          </div>
        </div>

        {/* Bottom glow accent */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-2 bg-fuchsia-500/20 blur-xl" />
      </div>
    </footer>
  );
}
