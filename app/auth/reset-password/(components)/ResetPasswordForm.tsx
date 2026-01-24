// app/auth/reset-password/ResetPasswordForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, CheckCircle, Loader2 } from "lucide-react";
import { resetPasswordAction } from "@/lib/actions/auth.actions";
import "@/components/auth/auth-form.css";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("token", token);

    const result = await resetPasswordAction(formData);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/auth?message=password_reset");
    }, 2000);
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-semibold text-zinc-100 mb-2">
          Password Reset!
        </h2>
        <p className="text-zinc-400 text-sm">Redirecting you to sign in...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* New Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-zinc-300 mb-2"
        >
          New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-10 pr-10 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-zinc-500 mt-1">Minimum 8 characters</p>
      </div>

      {/* Confirm Password */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-zinc-300 mb-2"
        >
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            required
            minLength={8}
            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-10 pr-10 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showConfirm ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button type="submit" disabled={isLoading} className="auth-submit-btn">
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Resetting...
          </>
        ) : (
          "Reset Password"
        )}
      </button>

      {/* Back to Sign In */}
      <p className="text-center text-sm text-zinc-500">
        Remember your password?{" "}
        <a
          href="/auth"
          className="text-violet-400 hover:text-violet-500 transition-colors"
        >
          Sign in
        </a>
      </p>
    </form>
  );
}
