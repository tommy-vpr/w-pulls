// app/auth/reset-password/page.tsx
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ResetPasswordForm } from "./(components)/ResetPasswordForm";
import { auth } from "@/lib/auth";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  // Redirect if already signed in
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard/settings");
  }

  if (!token) {
    redirect("/auth/forgot-password?error=missing_token");
  }

  // Validate token exists and not expired
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    redirect("/auth/forgot-password?error=invalid_token");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 p-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-zinc-100 mb-2">
              Reset Your Password
            </h1>
            <p className="text-zinc-400 text-sm">
              Enter your new password below
            </p>
          </div>

          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useState, useTransition } from "react";
// import { useSearchParams } from "next/navigation";
// import { motion } from "framer-motion";
// import {
//   Lock,
//   Eye,
//   EyeOff,
//   Loader2,
//   CheckCircle,
//   Sparkles,
// } from "lucide-react";
// import { resetPasswordAction } from "@/lib/actions/auth.actions";
// import Link from "next/link";
// // import "../auth-form.css";

// export default function ResetPasswordPage() {
//   const searchParams = useSearchParams();
//   const token = searchParams.get("token");

//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState(false);
//   const [isPending, startTransition] = useTransition();

//   if (!token) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//         <div className="auth-glass rounded-3xl p-8 max-w-md mx-4 text-center">
//           <h1 className="text-xl font-bold text-white mb-4">Invalid Link</h1>
//           <p className="text-white/60 mb-6">
//             This password reset link is invalid or has expired.
//           </p>
//           <Link href="/auth" className="text-purple-400 hover:underline">
//             Back to login
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   const handleSubmit = async (formData: FormData) => {
//     setError(null);
//     formData.append("token", token);

//     startTransition(async () => {
//       const result = await resetPasswordAction(formData);
//       if (result?.error) {
//         setError(result.error);
//       } else if (result?.success) {
//         setSuccess(true);
//       }
//     });
//   };

//   if (success) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="auth-glass rounded-3xl p-8 max-w-md mx-4 text-center"
//         >
//           <div className="flex justify-center mb-4">
//             <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
//               <CheckCircle className="h-8 w-8 text-green-400" />
//             </div>
//           </div>
//           <h1 className="text-xl font-bold text-white mb-2">Password Reset!</h1>
//           <p className="text-white/60 mb-6">
//             Your password has been successfully reset.
//           </p>
//           <Link
//             href="/auth"
//             className="inline-block w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl text-white font-semibold"
//           >
//             Sign In
//           </Link>
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//       {/* Background elements */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
//       </div>

//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="auth-glass relative z-10 rounded-3xl p-8 max-w-md mx-4 w-full"
//       >
//         {/* Logo */}
//         <div className="flex justify-center mb-6">
//           <div className="flex items-center gap-2">
//             <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
//               <Sparkles className="h-5 w-5 text-white" />
//             </div>
//             <span className="text-2xl font-bold text-white">Pullrs</span>
//           </div>
//         </div>

//         <h1 className="text-2xl font-bold text-white mb-2">Set new password</h1>
//         <p className="text-white/60 mb-6">Enter your new password below.</p>

//         {error && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
//           >
//             {error}
//           </motion.div>
//         )}

//         <form action={handleSubmit} className="space-y-4">
//           <div className="auth-input-group">
//             <Lock className="auth-input-icon" />
//             <input
//               type={showPassword ? "text" : "password"}
//               name="password"
//               placeholder="New password"
//               required
//               minLength={8}
//               className="auth-input"
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="auth-input-toggle"
//             >
//               {showPassword ? (
//                 <EyeOff className="h-4 w-4" />
//               ) : (
//                 <Eye className="h-4 w-4" />
//               )}
//             </button>
//           </div>

//           <div className="auth-input-group">
//             <Lock className="auth-input-icon" />
//             <input
//               type={showConfirmPassword ? "text" : "password"}
//               name="confirmPassword"
//               placeholder="Confirm new password"
//               required
//               minLength={8}
//               className="auth-input"
//             />
//             <button
//               type="button"
//               onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//               className="auth-input-toggle"
//             >
//               {showConfirmPassword ? (
//                 <EyeOff className="h-4 w-4" />
//               ) : (
//                 <Eye className="h-4 w-4" />
//               )}
//             </button>
//           </div>

//           <button
//             type="submit"
//             disabled={isPending}
//             className="auth-submit-btn"
//           >
//             {isPending ? (
//               <Loader2 className="h-5 w-5 animate-spin" />
//             ) : (
//               "Reset Password"
//             )}
//           </button>
//         </form>

//         <p className="mt-6 text-center text-sm text-white/40">
//           Remember your password?{" "}
//           <Link href="/auth" className="text-purple-400 hover:underline">
//             Sign in
//           </Link>
//         </p>
//       </motion.div>
//     </div>
//   );
// }
