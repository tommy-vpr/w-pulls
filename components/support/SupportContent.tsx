// components/support/SupportContent.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Sparkles,
  HelpCircle,
  CreditCard,
  Package,
  Shield,
  Settings,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  BookOpen,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  Mail,
  ArrowRight,
} from "lucide-react";

// Support categories
const SUPPORT_CATEGORIES = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "New to W-Pull? Learn the basics and set up your account.",
    icon: Zap,
    color: "cyan",
    articles: 8,
    href: "/support/getting-started",
  },
  {
    id: "packs-cards",
    title: "Packs & Cards",
    description: "Everything about purchasing packs and collecting cards.",
    icon: Package,
    color: "fuchsia",
    articles: 12,
    href: "/support/packs-cards",
  },
  {
    id: "account",
    title: "Account & Profile",
    description: "Manage your account settings, profile, and preferences.",
    icon: Shield,
    color: "emerald",
    articles: 6,
    href: "/support/account",
  },
  {
    id: "billing",
    title: "Billing & Payments",
    description: "Payment methods, invoices, and transaction history.",
    icon: CreditCard,
    color: "amber",
    articles: 9,
    href: "/support/billing",
  },
  {
    id: "technical",
    title: "Technical Issues",
    description: "Troubleshoot common problems and technical difficulties.",
    icon: Settings,
    color: "rose",
    articles: 14,
    href: "/support/technical",
  },
  {
    id: "policies",
    title: "Policies & Guidelines",
    description: "Terms of service, privacy policy, and community guidelines.",
    icon: FileText,
    color: "violet",
    articles: 5,
    href: "/support/policies",
  },
];

// Popular articles
const POPULAR_ARTICLES = [
  {
    id: 1,
    title: "How to purchase your first pack",
    category: "Getting Started",
    views: 12453,
    href: "/support/articles/first-pack",
  },
  {
    id: 2,
    title: "Understanding card rarity tiers",
    category: "Packs & Cards",
    views: 9821,
    href: "/support/articles/rarity-tiers",
  },
  {
    id: 3,
    title: "How to reset your password",
    category: "Account",
    views: 8234,
    href: "/support/articles/reset-password",
  },
  {
    id: 4,
    title: "Payment methods and security",
    category: "Billing",
    views: 7156,
    href: "/support/articles/payment-methods",
  },
  {
    id: 5,
    title: "Card reveal not loading - troubleshooting",
    category: "Technical",
    views: 6892,
    href: "/support/articles/reveal-troubleshoot",
  },
];

// System status
const SYSTEM_STATUS = [
  { name: "Card Reveal System", status: "operational" },
  { name: "Payment Processing", status: "operational" },
  { name: "User Authentication", status: "operational" },
  { name: "Collection Database", status: "operational" },
];

// Color configurations
const CATEGORY_COLORS: Record<
  string,
  { bg: string; border: string; text: string; glow: string }
> = {
  cyan: {
    bg: "from-cyan-400/20 to-cyan-400/5",
    border: "border-cyan-400/30 hover:border-cyan-400/60",
    text: "text-cyan-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(0,255,255,0.2)]",
  },
  fuchsia: {
    bg: "from-fuchsia-400/20 to-fuchsia-400/5",
    border: "border-fuchsia-400/30 hover:border-fuchsia-400/60",
    text: "text-fuchsia-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(255,0,255,0.2)]",
  },
  emerald: {
    bg: "from-emerald-400/20 to-emerald-400/5",
    border: "border-emerald-400/30 hover:border-emerald-400/60",
    text: "text-emerald-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]",
  },
  amber: {
    bg: "from-amber-400/20 to-amber-400/5",
    border: "border-amber-400/30 hover:border-amber-400/60",
    text: "text-amber-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]",
  },
  rose: {
    bg: "from-rose-400/20 to-rose-400/5",
    border: "border-rose-400/30 hover:border-rose-400/60",
    text: "text-rose-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(251,113,133,0.2)]",
  },
  violet: {
    bg: "from-violet-400/20 to-violet-400/5",
    border: "border-violet-400/30 hover:border-violet-400/60",
    text: "text-violet-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(167,139,250,0.2)]",
  },
};

export function SupportContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div className="min-h-screen mt-12 pt-28 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="font-orbitron text-4xl md:text-5xl font-bold text-cyan-400 mb-4"
            style={{
              textShadow: `
                0 0 10px rgba(0, 255, 255, 0.7),
                0 0 20px rgba(0, 255, 255, 0.5),
                0 0 40px rgba(0, 255, 255, 0.3)
              `,
            }}
          >
            SUPPORT CENTER
          </h1>

          <p className="text-cyan-100/60 max-w-xl mx-auto mb-8">
            Find answers, troubleshoot issues, and get the help you need to make
            the most of W-Pull.
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto">
            <div
              className={`
                relative rounded-xl overflow-hidden transition-all duration-300
                border ${
                  searchFocused ? "border-cyan-400/80" : "border-cyan-400/30"
                }
                bg-slate-950/80 backdrop-blur-sm
                ${searchFocused ? "shadow-[0_0_30px_rgba(0,255,255,0.2)]" : ""}
              `}
            >
              <div className="flex items-center">
                <div className="pl-5">
                  <Search
                    className={`w-5 h-5 transition-colors duration-300 ${
                      searchFocused ? "text-cyan-400" : "text-cyan-400/50"
                    }`}
                  />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search for help articles, guides, and more..."
                  className="w-full bg-transparent px-4 py-4 text-white placeholder:text-cyan-100/30 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="pr-5 text-cyan-400/50 hover:text-cyan-400 transition-colors"
                  >
                    <span className="text-xs uppercase tracking-wider">
                      Clear
                    </span>
                  </button>
                )}
              </div>

              {/* Bottom accent line */}
              <div
                className={`
                  absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-300
                  ${searchFocused ? "opacity-100" : "opacity-0"}
                `}
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent)",
                }}
              />
            </div>

            {/* Quick search tags */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {["pack odds", "refund", "password", "collection", "payment"].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-3 py-1.5 rounded-lg text-xs text-cyan-400/70 border border-cyan-400/20 hover:border-cyan-400/40 hover:text-cyan-400 bg-cyan-400/5 transition-all duration-300 cursor-pointer"
                  >
                    {tag}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* System Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="relative rounded-xl overflow-hidden border border-emerald-400/30 bg-emerald-400/5 backdrop-blur-sm">
            <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-400/20 border border-emerald-400/30">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">
                    All Systems Operational
                  </h3>
                  <p className="text-xs text-emerald-400/60">
                    Last updated: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {SYSTEM_STATUS.map((system) => (
                  <div key={system.name} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className="text-xs text-cyan-100/60 hidden md:block">
                      {system.name}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href="/status"
                className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                View Status Page
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Support Categories Grid */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
            <h2 className="font-orbitron text-sm uppercase tracking-[0.3em] text-cyan-400">
              Browse by Topic
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUPPORT_CATEGORIES.map((category, index) => {
              const Icon = category.icon;
              const colors = CATEGORY_COLORS[category.color];

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={category.href} className="block group">
                    <div
                      className={`
                        relative h-full rounded-xl overflow-hidden transition-all duration-300
                        border ${colors.border} ${colors.glow}
                        bg-slate-950/80 backdrop-blur-sm
                        p-5
                      `}
                    >
                      {/* Icon and title */}
                      <div className="flex items-start gap-4 mb-3">
                        <div
                          className={`
                            w-12 h-12 rounded-xl flex items-center justify-center
                            bg-gradient-to-br ${colors.bg}
                            border ${colors.border}
                            transition-all duration-300
                            group-hover:scale-110
                          `}
                        >
                          <Icon className={`w-6 h-6 ${colors.text}`} />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-medium text-white group-hover:text-cyan-300 transition-colors">
                            {category.title}
                          </h3>
                          <p className="text-xs text-cyan-400/50">
                            {category.articles} articles
                          </p>
                        </div>

                        <ChevronRight
                          className={`w-5 h-5 ${colors.text} opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all`}
                        />
                      </div>

                      {/* Description */}
                      <p className="text-sm text-cyan-100/50 leading-relaxed">
                        {category.description}
                      </p>

                      {/* Bottom accent */}
                      <div
                        className={`
                          absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity
                          bg-gradient-to-r from-transparent ${colors.text.replace(
                            "text",
                            "via"
                          )} to-transparent
                        `}
                      />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Popular Articles & Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Popular Articles - 2 columns */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div
                className="absolute -inset-[1px] rounded-xl opacity-30 blur-sm pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(255, 0, 255, 0.2))",
                }}
              />

              <div className="relative rounded-xl border border-cyan-400/30 bg-slate-950/80 backdrop-blur-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-cyan-400/20 bg-gradient-to-r from-cyan-400/10 to-transparent flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-orbitron text-sm text-white uppercase tracking-wider">
                      Popular Articles
                    </h3>
                  </div>
                  <Link
                    href="/support/articles"
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    View all
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="divide-y divide-cyan-400/10">
                  {POPULAR_ARTICLES.map((article, index) => (
                    <Link
                      key={article.id}
                      href={article.href}
                      className="group flex items-center gap-4 px-6 py-4 hover:bg-cyan-400/5 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-400/10 border border-cyan-400/20 text-xs font-mono text-cyan-400/60 group-hover:text-cyan-400 group-hover:border-cyan-400/40 transition-all">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm text-white group-hover:text-cyan-300 transition-colors truncate">
                          {article.title}
                        </h4>
                        <p className="text-xs text-cyan-400/50">
                          {article.category}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-cyan-400/40">
                        <span>{article.views.toLocaleString()} views</span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            {/* Contact Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div
                className="absolute -inset-[1px] rounded-xl opacity-30 blur-sm pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255, 0, 255, 0.3), rgba(0, 255, 255, 0.2))",
                }}
              />

              <div className="relative rounded-xl border border-fuchsia-400/30 bg-slate-950/80 backdrop-blur-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-fuchsia-400/20 bg-gradient-to-r from-fuchsia-400/10 to-transparent">
                  <h3 className="font-orbitron text-sm text-white uppercase tracking-wider">
                    Need More Help?
                  </h3>
                </div>

                <div className="p-5 space-y-3">
                  <Link
                    href="/contact"
                    className="group flex items-center gap-3 p-3 rounded-lg border border-cyan-400/20 hover:border-cyan-400/40 bg-cyan-400/5 hover:bg-cyan-400/10 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-cyan-400/20 border border-cyan-400/30 group-hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all">
                      <MessageSquare className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white group-hover:text-cyan-300 transition-colors">
                        Contact Support
                      </p>
                      <p className="text-[10px] text-cyan-400/50 uppercase tracking-wider">
                        Get personal help
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-cyan-400/50 group-hover:text-cyan-400 transition-colors" />
                  </Link>

                  <Link
                    href="/faq"
                    className="group flex items-center gap-3 p-3 rounded-lg border border-fuchsia-400/20 hover:border-fuchsia-400/40 bg-fuchsia-400/5 hover:bg-fuchsia-400/10 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-fuchsia-400/20 border border-fuchsia-400/30 group-hover:shadow-[0_0_15px_rgba(255,0,255,0.3)] transition-all">
                      <HelpCircle className="w-5 h-5 text-fuchsia-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white group-hover:text-fuchsia-300 transition-colors">
                        FAQ
                      </p>
                      <p className="text-[10px] text-fuchsia-400/50 uppercase tracking-wider">
                        Common questions
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-fuchsia-400/50 group-hover:text-fuchsia-400 transition-colors" />
                  </Link>
                  <a
                    href="#"
                    className="group flex items-center gap-3 p-3 rounded-lg border border-violet-400/20 hover:border-violet-400/40 bg-violet-400/5 hover:bg-violet-400/10 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-violet-400/20 border border-violet-400/30 group-hover:shadow-[0_0_15px_rgba(167,139,250,0.3)] transition-all">
                      <Users className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white group-hover:text-violet-300 transition-colors">
                        Community Discord
                      </p>
                      <p className="text-[10px] text-violet-400/50 uppercase tracking-wider">
                        Join discussions
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-violet-400/50 group-hover:text-violet-400 transition-colors" />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Response Times */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative rounded-xl border border-cyan-400/30 bg-slate-950/80 backdrop-blur-sm overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-cyan-400/20 bg-gradient-to-r from-cyan-400/10 to-transparent">
                <h3 className="font-orbitron text-sm text-white uppercase tracking-wider">
                  Response Times
                </h3>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-cyan-400/60" />
                    <span className="text-sm text-cyan-100/70">Email</span>
                  </div>
                  <span className="text-sm text-white">~24 hours</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-400/60" />
                    <span className="text-sm text-cyan-100/70">Discord</span>
                  </div>
                  <span className="text-sm text-white">~2 hours</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400/60" />
                    <span className="text-sm text-cyan-100/70">Hours</span>
                  </div>
                  <span className="text-sm text-white">9AM - 6PM PST</span>
                </div>

                <div className="pt-3 border-t border-cyan-400/10">
                  <p className="text-xs text-cyan-400/50 leading-relaxed">
                    Our support team is available Monday through Friday. Weekend
                    inquiries will be addressed the following business day.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Report Issue */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative p-4 rounded-xl border border-amber-400/30 bg-amber-400/5"
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-amber-400/20 border border-amber-400/30">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-amber-400 mb-1">
                    Found a Bug?
                  </h4>
                  <p className="text-xs text-amber-100/60 leading-relaxed mb-3">
                    Help us improve by reporting issues you encounter.
                  </p>
                  <Link
                    href="/support/report-bug"
                    className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Report an Issue
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
