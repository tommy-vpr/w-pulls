// components/contact/ContactContent.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Mail,
  MessageSquare,
  User,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  Twitter,
  Github,
  MessageCircle,
  MapPin,
  Clock,
  Zap,
} from "lucide-react";
import { NeonInput, NeonTextarea, NeonSelect } from "@/components/ui/NeonInput";

const CONTACT_REASONS = [
  { value: "", label: "Select a topic" },
  { value: "general", label: "General Inquiry" },
  { value: "support", label: "Technical Support" },
  { value: "billing", label: "Billing Question" },
  { value: "feedback", label: "Feedback & Suggestions" },
  { value: "partnership", label: "Partnership Opportunity" },
  { value: "press", label: "Press & Media" },
  { value: "other", label: "Other" },
];

const CONTACT_INFO = [
  {
    icon: Mail,
    label: "Email",
    value: "support@wpull.com",
    href: "mailto:support@wpull.com",
  },
  {
    icon: MessageCircle,
    label: "Discord",
    value: "Join our server",
    href: "#",
  },
  {
    icon: Twitter,
    label: "Twitter",
    value: "@wpull",
    href: "#",
  },
];

const RESPONSE_INFO = [
  {
    icon: Clock,
    label: "Response Time",
    value: "Within 24 hours",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Los Angeles, CA",
  },
  {
    icon: Zap,
    label: "Status",
    value: "Online",
    status: "online",
  },
];

export function ContactContent() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    reason: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to send message");
      }

      setStatus("success");
      setFormState({ name: "", email: "", reason: "", message: "" });
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to send message. Please try again."
      );
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormState((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Reset status when user starts typing again
    if (status === "error" || status === "success") {
      setStatus("idle");
    }
  };

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
            CONTACT US
          </h1>

          <p className="text-cyan-100/60 max-w-xl mx-auto">
            Have a question or need assistance? Send us a message and our team
            will get back to you as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Contact Form - Takes 3 columns */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              {/* Glow effect */}
              <div
                className="absolute -inset-[1px] rounded-xl opacity-50 blur-sm pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(255, 0, 255, 0.2), rgba(0, 255, 255, 0.3))`,
                }}
              />

              {/* Form container */}
              <div
                className="relative rounded-xl overflow-hidden border border-cyan-400/30 bg-slate-950/80 backdrop-blur-sm"
                style={{
                  boxShadow: "0 0 30px rgba(0, 255, 255, 0.1)",
                }}
              >
                {/* Header bar */}
                <div className="px-6 py-4 border-b border-cyan-400/20 bg-gradient-to-r from-cyan-400/10 to-transparent">
                  <div className="flex items-center gap-3">
                    <div>
                      <h2 className="font-orbitron text-sm text-white uppercase tracking-wider">
                        Send Message
                      </h2>
                      <p className="text-[10px] text-cyan-400/50 uppercase tracking-widest">
                        All fields required
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <NeonInput
                      label="Name"
                      name="name"
                      value={formState.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      icon={User}
                      required
                    />
                    <NeonInput
                      label="Email"
                      name="email"
                      type="email"
                      value={formState.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      icon={Mail}
                      required
                    />
                  </div>

                  <NeonSelect
                    label="Topic"
                    name="reason"
                    value={formState.reason}
                    onChange={handleChange}
                    options={CONTACT_REASONS}
                    required
                  />

                  <NeonTextarea
                    label="Message"
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    rows={5}
                    required
                  />

                  {/* Status messages */}
                  {status === "success" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-emerald-400/30 bg-emerald-400/10"
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <p className="text-sm text-emerald-400">
                        Message sent successfully! We&apos;ll get back to you
                        soon.
                      </p>
                    </motion.div>
                  )}

                  {status === "error" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-rose-400/30 bg-rose-400/10"
                    >
                      <AlertCircle className="w-5 h-5 text-rose-400" />
                      <p className="text-sm text-rose-400">{errorMessage}</p>
                    </motion.div>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className={`
                      relative w-full py-3.5 rounded-lg font-medium text-sm uppercase tracking-wider
                      flex items-center justify-center gap-2
                      transition-all duration-300 cursor-pointer
                      ${
                        status === "loading"
                          ? "bg-cyan-400/20 text-cyan-400/50 cursor-not-allowed"
                          : "bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white hover:from-cyan-400 hover:to-fuchsia-400 shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]"
                      }
                    `}
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Transmitting...
                      </>
                    ) : (
                      <>Send Message</>
                    )}

                    {/* Button glow effect */}
                    {status !== "loading" && (
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400/20 to-fuchsia-400/20 blur-xl -z-10" />
                    )}
                  </button>
                </form>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
              </div>
            </motion.div>
          </div>

          {/* Contact Info Sidebar - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact methods */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <div
                className="absolute -inset-[1px] rounded-xl opacity-30 blur-sm pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(255, 0, 255, 0.2))`,
                }}
              />

              <div className="relative rounded-xl border border-cyan-400/30 bg-slate-950/80 backdrop-blur-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-cyan-400/20 bg-gradient-to-r from-cyan-400/10 to-transparent">
                  <h3 className="font-orbitron text-sm text-white uppercase tracking-wider">
                    Connect With Us
                  </h3>
                </div>

                <div className="p-5 space-y-4">
                  {CONTACT_INFO.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={index}
                        href={item.href}
                        className="group flex items-center gap-4 p-3 rounded-lg border border-cyan-400/20 hover:border-cyan-400/40 bg-cyan-400/5 hover:bg-cyan-400/10 transition-all duration-300"
                      >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/10 border border-cyan-400/30 group-hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all">
                          <Icon className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-cyan-400/50">
                            {item.label}
                          </p>
                          <p className="text-sm text-white group-hover:text-cyan-300 transition-colors">
                            {item.value}
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Response info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div
                className="absolute -inset-[1px] rounded-xl opacity-30 blur-sm pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, rgba(255, 0, 255, 0.2), rgba(0, 255, 255, 0.3))`,
                }}
              />

              <div className="relative rounded-xl border border-cyan-400/30 bg-slate-950/80 backdrop-blur-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-cyan-400/20 bg-gradient-to-r from-fuchsia-400/10 to-transparent">
                  <h3 className="font-orbitron text-sm text-white uppercase tracking-wider">
                    Info
                  </h3>
                </div>

                <div className="p-5 space-y-4">
                  {RESPONSE_INFO.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-fuchsia-400/20 to-cyan-500/10 border border-fuchsia-400/30">
                          <Icon className="w-5 h-5 text-fuchsia-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] uppercase tracking-widest text-fuchsia-400/50">
                            {item.label}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-white">{item.value}</p>
                            {item.status === "online" && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Quick tip box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative p-4 rounded-xl border border-amber-400/30 bg-amber-400/5"
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-amber-400/20 border border-amber-400/30">
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-amber-400 mb-1">
                    Quick Tip
                  </h4>
                  <p className="text-xs text-amber-100/60 leading-relaxed">
                    For faster support, check our{" "}
                    <a
                      href="/faq"
                      className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
                    >
                      FAQ page
                    </a>{" "}
                    first. Many common questions are already answered there.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
