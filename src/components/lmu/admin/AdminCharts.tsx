import { useMemo } from "react";
import { useAdmin } from "@/store/admin";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--debit))", "hsl(var(--forest))", "hsl(var(--muted-foreground))", "hsl(var(--credit))", "hsl(var(--foreground))"];

export const AdminCharts = () => {
  const { txs } = useAdmin();

  const series = useMemo(() => {
    const buckets: Record<string, { day: string; inflow: number; outflow: number }> = {};
    const now = Date.now();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400_000);
      const key = d.toLocaleDateString("en", { weekday: "short" });
      buckets[key] = { day: key, inflow: 0, outflow: 0 };
    }
    txs.forEach((t) => {
      const d = new Date(t.ts);
      const key = d.toLocaleDateString("en", { weekday: "short" });
      if (buckets[key] && now - t.ts < 7 * 86400_000) {
        if (t.type === "credit") buckets[key].inflow += t.amount;
        else buckets[key].outflow += t.amount;
      }
    });
    return Object.values(buckets);
  }, [txs]);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    txs.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [txs]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <div className="xl:col-span-2 rounded-[14px] p-6 bg-card border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="label-caps text-muted-foreground">Volume</div>
            <h3 className="font-display text-lg font-semibold mt-1">Inflow vs Outflow (7d)</h3>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="inflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="outflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--debit))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--debit))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 12 }}
                formatter={(v: number) => `₦${v.toLocaleString()}`}
              />
              <Area type="monotone" dataKey="inflow" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#inflow)" />
              <Area type="monotone" dataKey="outflow" stroke="hsl(var(--debit))" strokeWidth={2} fill="url(#outflow)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[14px] p-6 bg-card border border-border">
        <div className="label-caps text-muted-foreground">Spending</div>
        <h3 className="font-display text-lg font-semibold mt-1">By Category</h3>
        <div className="h-64 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                {byCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 12 }}
                formatter={(v: number) => `₦${v.toLocaleString()}`}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};