import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Building2, CreditCard, Banknote } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useWallet } from "@/store/wallet";

interface TopUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const methods = [
  { id: "transfer", label: "Bank Transfer", desc: "Free · Instant", icon: Building2 },
  { id: "card", label: "Debit Card", desc: "1.5% fee", icon: CreditCard },
  { id: "cash", label: "Cash Deposit", desc: "At LMU bursary", icon: Banknote },
];

const presets = [1000, 5000, 10000, 25000, 50000];

export const TopUpDialog = ({ open, onOpenChange }: TopUpDialogProps) => {
  const [method, setMethod] = useState("transfer");
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const { topUp } = useWallet();

  const accountNumber = "8829104573";

  const copyAccount = () => {
    navigator.clipboard?.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    const label = method === "transfer" ? "Bank Transfer" : method === "card" ? "Debit Card" : "Cash Deposit";
    topUp(Number(amount), label);
    toast.success(`₦${Number(amount).toLocaleString()} added to your wallet`);
    setAmount("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] rounded-[14px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Top Up Wallet</DialogTitle>
          <DialogDescription>
            Add funds to your LMU wallet instantly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div>
            <Label className="label-caps text-muted-foreground">Method</Label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {methods.map(({ id, label, desc, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setMethod(id)}
                  className={`rounded-[10px] border p-3 text-left transition-colors ${
                    method === id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <Icon className={`h-4 w-4 mb-2 ${method === id ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="text-xs font-medium text-foreground">{label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="amount" className="label-caps text-muted-foreground">Amount (₦)</Label>
            <Input
              id="amount"
              type="number"
              inputMode="numeric"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-2 num text-lg font-semibold rounded-[10px]"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => setAmount(String(p))}
                  className="text-[11px] num font-medium px-2.5 py-1 rounded-[8px] border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                >
                  ₦{p.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {method === "transfer" && (
            <div className="rounded-[10px] bg-muted/50 border border-border p-4">
              <div className="label-caps text-muted-foreground mb-2">Transfer to</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">Wema Bank</div>
                  <div className="num text-foreground font-semibold tracking-wider mt-0.5">{accountNumber}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">LMU/Adaeze Okafor</div>
                </div>
                <button
                  onClick={copyAccount}
                  className="h-9 w-9 rounded-[10px] border border-border hover:bg-background flex items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label="Copy account number"
                >
                  {copied ? <Check className="h-4 w-4 text-credit" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-[10px]">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="rounded-[10px]">
            {method === "transfer" ? "I've Sent It" : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};