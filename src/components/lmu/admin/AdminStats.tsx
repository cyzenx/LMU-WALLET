import { Users, TrendingUp, AlertTriangle, Activity } from "lucide-react";
import { useAdmin, formatNGN } from "@/store/admin";
import { useMemo } from "react";

export const AdminStats = () => {
  const { students, txs } = useAdmin();

  const { totalBalance, todayVolume, flaggedCount, activeNow } = useMemo(() => {
    const dayAgo = Date.now() - 24 * 3600_000;
    const recent = txs.filter((t) => t.ts >= dayAgo);
    return {
      totalBalance: students.reduce((a, s) => a + s.balance, 0),
      todayVolume: recent.reduce((a, t) => a + t.amount, 0),
      flaggedCount: txs.filter((t) => t.flagged).length,
      activeNow: students.filter((s) => Date.now() - s.lastActive < 30 * 60_000).length,
    };
  }, [students, txs]);

  const cards = [
    { label: "Students", value: students.length.toString(), sub: `${activeNow} active now`, icon: Users, tone: "text-primary bg-primary/10" },
    { label: "Total Balance", value: formatNGN(totalBalance), sub: "Across all wallets", icon: TrendingUp, tone: "text-credit bg-credit/10" },
    { label: "Volume (24h)", value: formatNGN(todayVolume), sub: `${txs.filter(t => t.ts >= Date.now() - 24*3600_000).length} transactions`, icon: Activity, tone: "text-foreground bg-muted" },
    { label: "Flagged", value: flaggedCount.toString(), sub: "Need review", icon: AlertTriangle, tone: "text-debit bg-debit/10" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {cards.map((c) => (
        <div key={c.label} className="rounded-[14px] p-6 bg-card border border-border">
          <div className="flex items-center justify-between">
            <span className="label-caps text-muted-foreground">{c.label}</span>
            <span className={`h-8 w-8 rounded-full flex items-center justify-center ${c.tone}`}>
              <c.icon className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-6 num text-[24px] font-bold leading-none tracking-tight text-foreground truncate">
            {c.value}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">{c.sub}</div>
        </div>
      ))}
    </div>
  );
};