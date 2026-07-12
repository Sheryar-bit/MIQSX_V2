import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { OrgSwitcher } from "@/components/layout/OrgSwitcher";
import { InviteNotifications } from "@/components/layout/InviteNotifications";
import "./dashboard.css";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  return (
    <div data-ds-theme="light" style={{ minHeight: "100vh" }}>
      <div style={{ position: "relative", background: "var(--bg)", display: "flex", color: "var(--ink)", fontFamily: "'General Sans', system-ui, sans-serif", minHeight: "100vh", height: "100vh", overflow: "hidden", WebkitFontSmoothing: "antialiased" }}>
        <div className="ds-grain" aria-hidden="true" />
        <Sidebar />
        <main className="ds-scroll ds-main" style={{ position: "relative", zIndex: 10, flex: 1, height: "100vh", overflowY: "auto", paddingBottom: 80 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 24px 0" }}>
            <OrgSwitcher />
          </div>
          <div style={{ padding: "8px 24px 0" }}>
            <InviteNotifications />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
