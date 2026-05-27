import { AppLayout } from "@/components/lmu/AppLayout";
import { Transactions as TxList } from "@/components/lmu/Transactions";
import { Search, Filter, Download } from "lucide-react";

const summary = [
  { label: "Total Transactions", value: "247", hint: "This month", tone: "text-foreground" },
  { label: "Total Inflow", value: "₦412,300.00", hint: "+₦52,400 this week", tone: "text-credit" },
  { label: "Total Outflow", value: "₦163,650.60", hint: "−₦18,900 this week", tone: "text-debit" },
];

export default function TransactionsPage() {
  return (
    <AppLayout title="Transactions" eyebrow="Activity">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {summary.map((s) => (
          <div key={s.label} className="rounded-[14px] bg-card border border-border p-6">
            <span className="label-caps text-muted-foreground">{s.label}</span>
            <div className={`mt-4 num text-[26px] font-bold tracking-tight ${s.tone}`}>{s.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.hint}</div>
          </div>
        ))}
      </div>

      <div className="rounded-[14px] bg-card border border-border p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">All Transactions</h3>
            <p className="text-xs text-muted-foreground mt-1">Search and filter your full activity history.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-background border border-border rounded-[10px] px-3 py-2 w-64">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input placeholder="Search transactions" className="bg-transparent text-sm flex-1 outline-none placeholder:text-muted-foreground" />
            </div>
            <button className="h-9 w-9 rounded-[10px] border border-border flex items-center justify-center text-muted-foreground hover:text-foreground" aria-label="Filter">
              <Filter className="h-4 w-4" />
            </button>
            <button className="h-9 px-3 rounded-[10px] border border-border flex items-center gap-2 text-xs font-medium text-foreground hover:bg-muted">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          {["All", "Credits", "Debits", "This Week"].map((t, i) => (
            <button
              key={t}
              className={`px-3 py-1.5 rounded-[8px] text-xs font-medium ${
                i === 0 ? "bg-primary/15 text-primary border border-primary/20" : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <TxList />
    </AppLayout>
  );
}