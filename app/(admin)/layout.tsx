import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { requireAdmin, requireAuth } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar user={session.user} />
      <main className="flex-1 lg:pl-64 w-full mx-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
