import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useAdmin, formatNGN, timeAgo } from "@/store/admin";
import { toast } from "sonner";

export const FlaggedActivity = () => {
  const { txs, resolveFlag } = useAdmin();
  const flagged = txs.filter((t) => t.flagged).slice(0, 8);

  return (
    <div className="rounded-[14px] bg-card border border-border h-full">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div>
          <div className="label-caps text-muted-foreground">Risk</div>
          <h3 className="font-display text-lg font-semibold mt-1 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-debit" />
            Flagged activity
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">{flagged.length} open</span>
      </div>

      <div className="divide-y divide-border/60">
        {flagged.map((t) => (
          <div key={t.id} className="p-5 flex items-start gap-3">
            <span className="h-8 w-8 rounded-full bg-debit/10 text-debit flex items-center justify-center shrink-0">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium text-foreground truncate">{t.studentName}</div>
                <div className="num text-sm font-semibold text-debit shrink-0">
                  {t.type === "credit" ? "+" : "−"}
                  {formatNGN(t.amount)}
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {t.flagReason} · {t.category} · {timeAgo(t.ts)}
              </div>
              <button
                onClick={() => {
                  resolveFlag(t.id);
                  toast.success("Flag resolved");
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-[11px] font-medium bg-primary/10 text-primary hover:bg-primary/20"
              >
                <ShieldCheck className="h-3 w-3" />
                Mark resolved
              </button>
            </div>
          </div>
        ))}
        {!flagged.length && (
          <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-credit" />
            All clear — no flagged activity.
          </div>
        )}
      </div>
    </div>
  );
};