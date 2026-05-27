import { Sidebar } from "@/components/lmu/Sidebar";
import { Topbar } from "@/components/lmu/Topbar";
import { StatsRow } from "@/components/lmu/StatsRow";
import { VirtualAccounts } from "@/components/lmu/VirtualAccounts";
import { Transactions } from "@/components/lmu/Transactions";

const Index = () => {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 p-6 md:p-10">
        <Topbar />
        <div className="space-y-6">
          <StatsRow />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <Transactions />
            </div>
            <div className="lg:col-span-2">
              <VirtualAccounts />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
