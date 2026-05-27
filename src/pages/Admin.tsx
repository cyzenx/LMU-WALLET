import { AppLayout } from "@/components/lmu/AppLayout";
import { AdminProvider } from "@/store/admin";
import { AdminStats } from "@/components/lmu/admin/AdminStats";
import { AdminCharts } from "@/components/lmu/admin/AdminCharts";
import { StudentsTable } from "@/components/lmu/admin/StudentsTable";
import { LiveFeed } from "@/components/lmu/admin/LiveFeed";
import { FlaggedActivity } from "@/components/lmu/admin/FlaggedActivity";
import { QuickActions } from "@/components/lmu/admin/QuickActions";
import { AuditLog } from "@/components/lmu/admin/AuditLog";

const AdminPage = () => {
  return (
    <AdminProvider>
      <AppLayout title="Admin Console" eyebrow="Monitoring">
        <QuickActions />
        <AdminStats />
        <AdminCharts />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2">
            <LiveFeed />
          </div>
          <FlaggedActivity />
        </div>
        <StudentsTable />
        <AuditLog />
      </AppLayout>
    </AdminProvider>
  );
};

export default AdminPage;