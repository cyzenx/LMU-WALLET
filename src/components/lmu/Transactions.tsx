import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useWallet } from "@/store/wallet";

export const Transactions = () => {
  const { transactions: txs } = useWallet();
  return (
    <div className="rounded-[14px] bg-card border border-border p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">Recent Transactions</h3>
          <p className="text-xs text-muted-foreground mt-1">Your latest wallet activity.</p>
        </div>
        <button className="text-xs font-medium text-primary hover:underline">View all</button>
      </div>

      <div className="divide-y divide-border">
        {txs.map((tx) => {
          const isCredit = tx.type === "credit";
          return (
            <div key={tx.id} className="flex items-center gap-4 py-3.5">
              <div
                className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${
                  isCredit ? "bg-credit/10 text-credit" : "bg-debit/10 text-debit"
                }`}
              >
                {isCredit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{tx.title}</div>
                <div className="text-xs text-muted-foreground truncate">{tx.meta}</div>
              </div>
              <div className="text-right">
                <div className={`num text-sm font-semibold ${isCredit ? "text-credit" : "text-debit"}`}>
                  {isCredit ? "+" : "−"}₦{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{tx.time}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};