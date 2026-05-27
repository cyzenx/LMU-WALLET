import { ArrowDownLeft, ArrowUpRight, Radio, Pause, Play } from "lucide-react";
import { useAdmin, formatNGN, timeAgo } from "@/store/admin";

export const LiveFeed = () => {
  const { txs, liveOn, setLiveOn } = useAdmin();
  const recent = txs.slice(0, 12);

  return (
    <div className="rounded-[14px] bg-card border border-border h-full flex flex-col">
      <div className="p-5 flex items-center justify-between border-b border-border">
        <div>
          <div className="label-caps text-muted-foreground flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${liveOn ? "bg-credit animate-pulse" : "bg-muted-foreground"}`} />
            Live feed
          </div>
          <h3 className="font-display text-lg font-semibold mt-1">Activity stream</h3>
        </div>
        <button
          onClick={() => setLiveOn(!liveOn)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-xs font-medium bg-muted hover:bg-muted/70 text-foreground"
        >
          {liveOn ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {liveOn ? "Pause" : "Resume"}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-border/60 max-h-[440px]">
        {recent.map((t) => {
          const Icon = t.type === "credit" ? ArrowDownLeft : ArrowUpRight;
          const tone = t.type === "credit" ? "text-credit bg-credit/10" : "text-debit bg-debit/10";
          return (
            <div key={t.id} className="px-5 py-3 flex items-center gap-3 hover:bg-muted/40 transition-colors">
              <span className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${tone}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground truncate">
                  {t.studentName}
                  {t.flagged && (
                    <span className="ml-2 text-[10px] uppercase tracking-wider text-debit bg-debit/10 px-1.5 py-0.5 rounded">
                      flag
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {t.category} · {t.channel} · {t.matric}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className={`num text-sm font-semibold ${t.type === "credit" ? "text-credit" : "text-debit"}`}>
                  {t.type === "credit" ? "+" : "−"}
                  {formatNGN(t.amount)}
                </div>
                <div className="text-[11px] text-muted-foreground">{timeAgo(t.ts)}</div>
              </div>
            </div>
          );
        })}
        {!recent.length && (
          <div className="p-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <Radio className="h-5 w-5" />
            Waiting for activity…
          </div>
        )}
      </div>
    </div>
  );
};