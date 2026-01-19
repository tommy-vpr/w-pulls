// components/ui/NewsletterSignup.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface NewsletterSignupProps {
  source?: string;
  variant?: "inline" | "card";
  accentColor?: "cyan" | "fuchsia";
}

export function NewsletterSignup({
  source = "footer",
  variant = "inline",
  accentColor = "cyan",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to subscribe");
      }

      setStatus("success");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to subscribe"
      );
    }
  };

  const colors = {
    cyan: {
      border: "border-cyan-400/30 focus-within:border-cyan-400/80",
      text: "text-cyan-400",
      bg: "from-cyan-500 to-fuchsia-500",
      glow: "shadow-[0_0_20px_rgba(0,255,255,0.3)]",
    },
    fuchsia: {
      border: "border-fuchsia-400/30 focus-within:border-fuchsia-400/80",
      text: "text-fuchsia-400",
      bg: "from-fuchsia-500 to-cyan-500",
      glow: "shadow-[0_0_20px_rgba(255,0,255,0.3)]",
    },
  }[accentColor];

  if (variant === "card") {
    return (
      <div className="relative">
        <div
          className="absolute -inset-[1px] rounded-xl opacity-50 blur-sm pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(255, 0, 255, 0.2))",
          }}
        />
        <div className="relative rounded-xl border border-cyan-400/30 bg-slate-950/80 backdrop-blur-sm p-6">
          {/* <div className="flex items-center gap-2 mb-3">
            <h3 className="font-orbitron text-lg text-white">Stay Updated</h3>
          </div> */}
          <p className="text-sm text-cyan-100/60 mb-4">
            Get the latest drops, exclusive offers, and platform updates.
          </p>

          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-emerald-400"
              >
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">You&apos;re subscribed!</span>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-3"
              >
                <div
                  className={`
                    relative rounded-lg overflow-hidden border ${colors.border}
                    bg-slate-900/50 transition-all duration-300
                    focus-within:${colors.glow}
                  `}
                >
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Mail className={`w-4 h-4 ${colors.text} opacity-50`} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={status === "loading"}
                    className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-white placeholder:text-cyan-100/30 focus:outline-none disabled:opacity-50"
                  />
                </div>

                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-rose-400 text-xs"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errorMessage}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className={`
                    w-full py-3 rounded-lg font-medium text-sm uppercase tracking-wider
                    text-white bg-gradient-to-r ${colors.bg}
                    hover:opacity-90 transition-all duration-300 ${colors.glow}
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2 cursor-pointer
                  `}
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </button>

                <p className="text-[10px] text-cyan-100/40 text-center">
                  Unsubscribe anytime.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <AnimatePresence mode="wait">
      {status === "success" ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-emerald-400"
        >
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm">You&apos;re subscribed!</span>
        </motion.div>
      ) : (
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div
            className={`
              relative flex-1 rounded-lg overflow-hidden border ${colors.border}
              bg-slate-900/50 transition-all duration-300
            `}
          >
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Mail className={`w-4 h-4 ${colors.text} opacity-50`} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={status === "loading"}
              className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-white placeholder:text-cyan-100/30 focus:outline-none disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className={`
              px-6 py-3 rounded-lg font-medium text-sm uppercase tracking-wider
              text-white bg-gradient-to-r ${colors.bg}
              hover:opacity-90 transition-all duration-300 ${colors.glow}
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2 whitespace-nowrap
            `}
          >
            {status === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Subscribe"
            )}
          </button>
        </motion.form>
      )}

      {status === "error" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-rose-400 text-xs mt-2"
        >
          <AlertCircle className="w-3 h-3" />
          {errorMessage}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
