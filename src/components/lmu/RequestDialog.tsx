import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useWallet } from "@/store/wallet";

interface RequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RequestDialog = ({ open, onOpenChange }: RequestDialogProps) => {
  const [from, setFrom] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [copied, setCopied] = useState(false);
  const { request } = useWallet();

  const link = amount
    ? `lmu.pay/r/adaeze?amt=${amount}`
    : "lmu.pay/r/adaeze";

  const copyLink = () => {
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRequest = () => {
    if (!from.trim()) return toast.error("Enter who you're requesting from");
    if (!amount || Number(amount) <= 0) return toast.error("Enter a valid amount");
    request(Number(amount), from);
    toast.success(`Request for ₦${Number(amount).toLocaleString()} sent to ${from}`);
    setFrom(""); setAmount(""); setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] rounded-[14px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Request Money</DialogTitle>
          <DialogDescription>Ask someone to pay you with a shareable link.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="from" className="label-caps text-muted-foreground">From</Label>
            <Input
              id="from"
              placeholder="Name, phone or @username"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-2 rounded-[10px]"
            />
          </div>

          <div>
            <Label htmlFor="req-amount" className="label-caps text-muted-foreground">Amount (₦)</Label>
            <Input
              id="req-amount"
              type="number"
              inputMode="numeric"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-2 num text-lg font-semibold rounded-[10px]"
            />
          </div>

          <div>
            <Label htmlFor="reason" className="label-caps text-muted-foreground">Reason (optional)</Label>
            <Textarea
              id="reason"
              placeholder="What's this request for?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2 rounded-[10px] min-h-[72px]"
            />
          </div>

          <div className="rounded-[10px] bg-muted/50 border border-border p-3 flex items-center justify-between">
            <div>
              <div className="label-caps text-muted-foreground">Payment link</div>
              <div className="text-sm font-medium text-foreground mt-0.5">{link}</div>
            </div>
            <button
              onClick={copyLink}
              className="h-9 w-9 rounded-[10px] border border-border hover:bg-background flex items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Copy link"
            >
              {copied ? <Check className="h-4 w-4 text-credit" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-[10px]">Cancel</Button>
          <Button onClick={handleRequest} className="rounded-[10px]">Send Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};