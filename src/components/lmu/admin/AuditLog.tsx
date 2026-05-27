import { useAdmin, timeAgo } from "@/store/admin";
import { History } from "lucide-react";

export const AuditLog = () => {
  const { audit } = useAdmin();
  return (
    <div className="rounded-[14px] bg-card border border-border overflow-hidden">
      <div className="p-5 border-b border-border flex items-center gap-2">
        <History className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-display text-lg font-semibold">Audit log</h3>
      </div>
      <div className="max-h-[320px] overflow-y-auto">
        {audit.length ? audit.map((a) => (
          <div key={a.id} className="px-5 py-3 border-b border-border/60 last:border-0 flex items-center justify-between text-sm">
            <div>
              <div className="font-medium text-foreground">{a.action}</div>
              {a.target && <div className="text-xs text-muted-foreground">{a.target}</div>}
            </div>
            <div className="text-xs text-muted-foreground">{timeAgo(a.ts)}</div>
          </div>
        )) : (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">No admin actions yet.</div>
        )}
      </div>
    </div>
  );
};
