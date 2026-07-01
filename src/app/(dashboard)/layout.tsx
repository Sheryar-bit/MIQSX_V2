import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { OrgSwitcher } from "@/components/layout/OrgSwitcher";
import { InviteNotifications } from "@/components/layout/InviteNotifications";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">
        <div className="flex justify-end px-6 md:px-8 pt-4">
          <OrgSwitcher />
        </div>
        <div className="px-6 md:px-8 pt-2">
          <InviteNotifications />
        </div>
        {children}
      </main>
    </div>
  );
}
