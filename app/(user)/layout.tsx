import { requireAuth } from "@/lib/auth-utils";
import { UserSidebar } from "@/components/dashboard/user-sidebar";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <div className="flex min-h-screen">
      <UserSidebar user={session.user} />
      <main className="flex-1 lg:pl-64 w-full mx-auto">
        <div className="p-6 lg:p-12">{children}</div>
      </main>
    </div>
  );
}
