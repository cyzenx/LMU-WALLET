import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppLayoutProps {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}

export const AppLayout = ({ title, eyebrow = "Overview", children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 p-6 md:p-10">
        <Topbar title={title} eyebrow={eyebrow} />
        <div className="space-y-6">{children}</div>
      </main>
    </div>
  );
};