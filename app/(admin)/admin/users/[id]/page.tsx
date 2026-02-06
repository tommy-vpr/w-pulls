// app/admin/users/[id]/page.tsx
import { notFound } from "next/navigation";
import { getUserById } from "@/lib/actions/admin-user.actions";
import { UserDetailView } from "./_components/user-detail-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getUserById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <UserDetailView user={result.data} />
    </div>
  );
}
