import { Eye, EyeOff, TrendingUp, TrendingDown, Plus, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { TopUpDialog } from "./TopUpDialog";
import { SendDialog } from "./SendDialog";
import { useWallet, formatNaira } from "@/store/wallet";

export const StatsRow = () => {
  const [hidden, setHidden] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const { balance } = useWallet();
  const { whole, dec } = formatNaira(balance);
  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Wallet balance — gradient */}
      <div className="md:col-span-1 rounded-[14px] p-6 text-forest-foreground bg-gradient-balance relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="label-caps text-forest-foreground/60">Wallet Balance</span>
          <button
            onClick={() => setHidden((h) => !h)}
            className="text-forest-foreground/60 hover:text-forest-foreground"
            aria-label={hidden ? "Show balance" : "Hide balance"}
          >
            {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {hidden ? (
          <div className="mt-6 num text-[34px] font-bold leading-none tracking-tight tracking-widest">
            ••••••••
          </div>
        ) : (
          <div className="mt-6 num text-[34px] font-bold leading-none tracking-tight">
            ₦{whole}<span className="text-forest-foreground/50 text-2xl">.{dec}</span>
          </div>
        )}
        <div className="mt-2 flex items-center gap-2 text-xs text-forest-foreground/70">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          <span className="num text-primary font-medium">+12.4%</span>
          <span>vs last month</span>
        </div>

        <div className="mt-7 flex gap-2">
          <button onClick={() => setTopUpOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur rounded-[10px] py-2.5 text-xs font-medium">
            <Plus className="h-3.5 w-3.5" /> Top Up
          </button>
          <button onClick={() => setSendOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[10px] py-2.5 text-xs font-medium">
            <ArrowUpRight className="h-3.5 w-3.5" /> Send
          </button>
        </div>
      </div>

      {/* Inflow */}
      <div className="rounded-[14px] p-6 bg-card border border-border">
        <div className="flex items-center justify-between">
          <span className="label-caps text-muted-foreground">Total Inflow</span>
          <span className="h-8 w-8 rounded-full bg-credit/10 text-credit flex items-center justify-center">
            <TrendingUp className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-6 num text-[28px] font-bold leading-none tracking-tight text-foreground">₦412,300<span className="text-muted-foreground text-xl">.00</span></div>
        <div className="mt-2 text-xs text-muted-foreground">
          <span className="num text-credit font-medium">+₦52,400</span> this week
        </div>
        <div className="mt-7 h-10 flex items-end gap-1.5">
          {[40, 65, 35, 80, 55, 90, 70].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm bg-credit/20" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>

      {/* Outflow */}
      <div className="rounded-[14px] p-6 bg-card border border-border">
        <div className="flex items-center justify-between">
          <span className="label-caps text-muted-foreground">Total Outflow</span>
          <span className="h-8 w-8 rounded-full bg-debit/10 text-debit flex items-center justify-center">
            <TrendingDown className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-6 num text-[28px] font-bold leading-none tracking-tight text-foreground">₦163,650<span className="text-muted-foreground text-xl">.60</span></div>
        <div className="mt-2 text-xs text-muted-foreground">
          <span className="num text-debit font-medium">−₦18,900</span> this week
        </div>
        <div className="mt-7 h-10 flex items-end gap-1.5">
          {[55, 30, 70, 45, 60, 35, 50].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm bg-debit/20" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
    <TopUpDialog open={topUpOpen} onOpenChange={setTopUpOpen} />
    <SendDialog open={sendOpen} onOpenChange={setSendOpen} />
    </>
  );
};