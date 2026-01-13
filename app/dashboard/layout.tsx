import { Metadata } from "next";
import "../globals.css";
import { Sidebar } from "@/components/dashboard/sidebar";
import { requireAuth } from "@/lib/auth-utils";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "WPulls",
  description: "W every pull",
  icons: {
    icon: "/images/logo-icon.png", // 32x32 or 48x48
    shortcut: "/images/logo-icon.png", // optional alias
    apple: "/images/logo-icon.png", // for iOS home screen
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect to /auth if not logged in
  const session = await requireAuth();

  return (
    <div className="flex min-h-screen">
      <Sidebar user={session.user} />
      <main className="flex-1 lg:pl-64 w-full max-w-7xl mx-auto">
        <div className="p-6">
          <SessionProvider>{children}</SessionProvider>
        </div>
      </main>
    </div>
  );
}
