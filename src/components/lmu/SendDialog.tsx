import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { useWallet } from "@/store/wallet";

interface SendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const banks = ["Wema Bank", "Sterling Bank", "GTBank", "Access Bank", "Zenith Bank", "UBA", "First Bank", "Opay", "Kuda"];

export const SendDialog = ({ open, onOpenChange }: SendDialogProps) => {
  const [bank, setBank] = useState("");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const { send, balance } = useWallet();

  const reset = () => {
    setBank(""); setAccount(""); setAmount(""); setNote("");
  };

  const handleSend = () => {
    if (!bank) return toast.error("Select a bank");
    if (account.length !== 10) return toast.error("Enter a valid 10-digit account number");
    if (!amount || Number(amount) <= 0) return toast.error("Enter a valid amount");
    if (Number(amount) > balance) return toast.error("Insufficient balance");
    const ok = send(Number(amount), account, bank);
    if (!ok) return toast.error("Insufficient balance");
    toast.success(`₦${Number(amount).toLocaleString()} sent to ${account} • ${bank}`);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] rounded-[14px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Send Money</DialogTitle>
          <DialogDescription>Transfer to any Nigerian bank account.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="label-caps text-muted-foreground">Bank</Label>
            <Select value={bank} onValueChange={setBank}>
              <SelectTrigger className="mt-2 rounded-[10px]">
                <SelectValue placeholder="Select a bank" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="account" className="label-caps text-muted-foreground">Account Number</Label>
            <Input
              id="account"
              inputMode="numeric"
              maxLength={10}
              placeholder="0123456789"
              value={account}
              onChange={(e) => setAccount(e.target.value.replace(/\D/g, ""))}
              className="mt-2 num tracking-wider rounded-[10px]"
            />
          </div>

          <div>
            <Label htmlFor="send-amount" className="label-caps text-muted-foreground">Amount (₦)</Label>
            <Input
              id="send-amount"
              type="number"
              inputMode="numeric"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-2 num text-lg font-semibold rounded-[10px]"
            />
          </div>

          <div>
            <Label htmlFor="note" className="label-caps text-muted-foreground">Narration (optional)</Label>
            <Input
              id="note"
              placeholder="What's it for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-2 rounded-[10px]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-[10px]">Cancel</Button>
          <Button onClick={handleSend} className="rounded-[10px]">Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};