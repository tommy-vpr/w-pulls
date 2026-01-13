"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import {
  signUpAction,
  signInAction,
  forgotPasswordAction,
} from "@/lib/actions/auth.actions";
import "./auth-form.css";
import Image from "next/image";
import Link from "next/link";

type FormMode = "login" | "signup" | "forgot";

export function AuthForm() {
  const [mode, setMode] = useState<FormMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      let result;

      switch (mode) {
        case "signup":
          result = await signUpAction(formData);
          break;
        case "login":
          result = await signInAction(formData);
          break;
        case "forgot":
          result = await forgotPasswordAction(formData);
          if (result?.success) {
            setSuccess("If an account exists, you will receive a reset link.");
          }
          break;
      }

      if (result?.error) {
        setError(result.error);
      }
    });
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative auth-card relative z-10 w-full max-w-md mx-4"
    >
      {/* Glass card */}
      <div className="auth-glass rounded-3xl p-8 shadow-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <Image
              src={"/images/logo.png"}
              width={100}
              height={50}
              alt="WPulls"
              className="invert"
            />
          </div>
        </div>

        {/* Mode Switcher */}
        <AnimatePresence mode="wait">
          {mode !== "forgot" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex rounded-xl bg-white/5 p-1 mb-6"
            >
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={`cursor-pointer flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                  mode === "login"
                    ? "bg-white/10 text-white shadow-lg"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className={`cursor-pointer flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                  mode === "signup"
                    ? "bg-white/10 text-white shadow-lg"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back button for forgot password */}
        {mode === "forgot" && (
          <button
            type="button"
            onClick={() => setMode("login")}
            className="cursor-pointer flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </button>
        )}

        {/* Title */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="mb-6"
          >
            <h1 className="text-2xl font-bold text-white">
              {mode === "login" && "Sign in to continue"}
              {mode === "signup" && "Create account"}
              {mode === "forgot" && "Reset password"}
            </h1>
            {/* <p className="text-white/60 mt-1">
              {mode === "login" && "Sign in to access your account"}
              {mode === "signup" && "Start your journey with us"}
              {mode === "forgot" && "We'll send you a reset link"}
            </p> */}
          </motion.div>
        </AnimatePresence>

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl || ""} />

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Name field (signup only) */}
              {mode === "signup" && (
                <div className="auth-input-group">
                  <User className="auth-input-icon" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full name"
                    required
                    className="auth-input"
                  />
                </div>
              )}

              {/* Email field */}
              <div className="auth-input-group">
                <Mail className="auth-input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  required
                  className="auth-input"
                />
              </div>

              {/* Password field (not for forgot) */}
              {mode !== "forgot" && (
                <div className="auth-input-group">
                  <Lock className="auth-input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    required
                    minLength={8}
                    className="auth-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-input-toggle"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              )}

              {/* Confirm Password (signup only) */}
              {mode === "signup" && (
                <div className="auth-input-group">
                  <Lock className="auth-input-icon" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm password"
                    required
                    minLength={8}
                    className="auth-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="auth-input-toggle"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              )}

              {/* Forgot Password Link */}
              {mode === "login" && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setError(null);
                    }}
                    className="cursor-pointer text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="auth-submit-btn"
              >
                {isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {mode === "login" && "Sign In"}
                    {mode === "signup" && "Create Account"}
                    {mode === "forgot" && "Send Reset Link"}
                  </>
                )}
              </button>
            </motion.div>
          </AnimatePresence>
        </form>

        {/* Divider */}
        {mode !== "forgot" && (
          <div className="relative my-6">
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-white/40 bg-transparent">
                or continue with
              </span>
            </div>
          </div>
        )}

        {/* Social Login */}
        {mode !== "forgot" && (
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="auth-social-btn"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>
        )}

        {/* Terms */}
        {mode === "signup" && (
          <p className="mt-6 text-center text-xs text-white/40">
            By creating an account, you agree to our{" "}
            <a href="/terms" className="text-purple-400 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-purple-400 hover:underline">
              Privacy Policy
            </a>
          </p>
        )}

        <Link
          href={"/packs"}
          className="text-gray-400 hover:text-gray-200 transition text-xs flex gap-1 justify-center items-center absolute top-4 right-4"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to site
        </Link>
      </div>
    </motion.div>
  );
}
