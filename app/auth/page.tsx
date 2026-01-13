import { AuthForm } from "@/components/auth/auth-form";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden
                    bg-gradient-to-br from-black via-slate-950 to-neutral-900"
    >
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Cold blue */}
        <div
          className="absolute -top-40 -right-40 w-96 h-96 
                        bg-sky-900/40 rounded-full mix-blend-screen 
                        blur-3xl opacity-30 animate-blob"
        />

        {/* Steel cyan */}
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 
                        bg-cyan-900/40 rounded-full mix-blend-screen 
                        blur-3xl opacity-25 animate-blob animation-delay-2000"
        />

        {/* Neutral graphite */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                        w-96 h-96 bg-neutral-800/40 rounded-full 
                        mix-blend-screen blur-3xl opacity-20 
                        animate-blob animation-delay-4000"
        />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Slight vignette */}
      <div
        className="pointer-events-none absolute inset-0
                      bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.65)_70%)]"
      />

      <AuthForm />
    </div>
  );
}
