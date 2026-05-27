import { Copy, Check } from "lucide-react";
import { useState } from "react";

const accounts = [
  {
    bank: "Wema Bank",
    number: "8829104573",
    name: "LMU/Adaeze Okafor",
    tone: "from-[#5b21b6]/90 to-[#7c3aed]/80",
  },
  {
    bank: "Sterling Bank",
    number: "0271459836",
    name: "LMU/Adaeze Okafor",
    tone: "from-[#b91c1c]/90 to-[#dc2626]/80",
  },
];

export const VirtualAccounts = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (n: string) => {
    navigator.clipboard?.writeText(n);
    setCopied(n);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="rounded-[14px] bg-card border border-border p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">Virtual Bank Accounts</h3>
          <p className="text-xs text-muted-foreground mt-1">Deposits to any number below land instantly in your wallet.</p>
        </div>
        <span className="label-caps text-muted-foreground">2 Active</span>
      </div>

      <div className="space-y-3">
        {accounts.map((a) => (
          <div key={a.bank} className="rounded-[12px] border border-border p-4 flex items-center gap-4 hover:border-primary/30 transition-colors">
            <div className={`h-11 w-11 shrink-0 rounded-[10px] bg-gradient-to-br ${a.tone} flex items-center justify-center font-display font-bold text-white text-sm`}>
              {a.bank.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{a.bank}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-credit/10 text-credit font-medium">ACTIVE</span>
              </div>
              <div className="num text-foreground font-semibold tracking-wider mt-0.5">{a.number}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{a.name}</div>
            </div>
            <button
              onClick={() => copy(a.number)}
              className="h-9 w-9 rounded-[10px] border border-border hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label={`Copy ${a.bank} number`}
            >
              {copied === a.number ? <Check className="h-4 w-4 text-credit" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};