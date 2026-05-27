import { AppLayout } from "@/components/lmu/AppLayout";
import { VirtualAccounts } from "@/components/lmu/VirtualAccounts";
import { TopUpDialog } from "@/components/lmu/TopUpDialog";
import { SendDialog } from "@/components/lmu/SendDialog";
import { RequestDialog } from "@/components/lmu/RequestDialog";
import { CardsDialog } from "@/components/lmu/CardsDialog";
import { useState } from "react";
import { useWallet, formatNaira } from "@/store/wallet";
import { Eye, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, Wallet as WalletIcon } from "lucide-react";

export default function WalletPage() {
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [cardsOpen, setCardsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { balance, ledger } = useWallet();
  const { whole, dec } = formatNaira(balance);

  const actions = [
    { label: "Top Up", icon: Plus, onClick: () => setTopUpOpen(true) },
    { label: "Send", icon: ArrowUpRight, onClick: () => setSendOpen(true) },
    { label: "Request", icon: ArrowDownLeft, onClick: () => setRequestOpen(true) },
    { label: "Cards", icon: CreditCard, onClick: () => setCardsOpen(true) },
  ];

  return (
    <AppLayout title="Wallet" eyebrow="Balance & Funding">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 rounded-[14px] p-8 text-forest-foreground bg-gradient-balance relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="label-caps text-forest-foreground/60">Available Balance</span>
              {hidden ? (
                <div className="mt-4 num text-[44px] font-bold leading-none tracking-tight tracking-widest">
                  ••••••••
                </div>
              ) : (
                <div className="mt-4 num text-[44px] font-bold leading-none tracking-tight">
                  ₦{whole}<span className="text-forest-foreground/50 text-3xl">.{dec}</span>
                </div>
              )}
              <div className="mt-3 text-xs text-forest-foreground/70">
                Ledger balance: <span className="num text-forest-foreground">₦{ledger.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            <button onClick={() => setHidden((h) => !h)} className="text-forest-foreground/60 hover:text-forest-foreground" aria-label="Toggle visibility">
              <Eye className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-10 grid grid-cols-4 gap-2">
            {actions.map(({ label, icon: Icon, onClick }) => (
              <button key={label} onClick={onClick} className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur rounded-[10px] py-3 text-xs font-medium transition-colors">
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-[14px] bg-card border border-border p-6">
          <span className="label-caps text-muted-foreground">This Month</span>
          <div className="mt-4 space-y-4">
            <div>
              <div className="text-xs text-muted-foreground">Inflow</div>
              <div className="num text-2xl font-bold text-credit mt-1">+₦412,300.00</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Outflow</div>
              <div className="num text-2xl font-bold text-debit mt-1">−₦163,650.60</div>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground">Net Change</div>
              <div className="num text-2xl font-bold text-foreground mt-1">+₦248,649.40</div>
            </div>
          </div>
        </div>
      </div>

      <VirtualAccounts />

      <div className="rounded-[14px] bg-card border border-border p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <WalletIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Wallet Limits</h3>
            <p className="text-xs text-muted-foreground">Daily and monthly transaction caps.</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { label: "Daily Spend", used: 18900, cap: 200000 },
            { label: "Monthly Spend", used: 163650, cap: 1000000 },
          ].map((l) => {
            const pct = Math.round((l.used / l.cap) * 100);
            return (
              <div key={l.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{l.label}</span>
                  <span className="num text-foreground font-medium">₦{l.used.toLocaleString()} / ₦{l.cap.toLocaleString()}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TopUpDialog open={topUpOpen} onOpenChange={setTopUpOpen} />
      <SendDialog open={sendOpen} onOpenChange={setSendOpen} />
      <RequestDialog open={requestOpen} onOpenChange={setRequestOpen} />
      <CardsDialog open={cardsOpen} onOpenChange={setCardsOpen} />
    </AppLayout>
  );
}