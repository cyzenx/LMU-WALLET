import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowDownLeft, ArrowUpRight, KeyRound, Trash2, Mail } from "lucide-react";
import { Student, useAdmin, formatNGN, timeAgo } from "@/store/admin";
import { toast } from "sonner";

interface Props {
  student: Student | null;
  onOpenChange: (open: boolean) => void;
}

export const StudentDetailDrawer = ({ student, onOpenChange }: Props) => {
  const { adjustBalance, setStatus, removeStudent, resetPin, txs } = useAdmin();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  if (!student) return null;

  const studentTxs = txs.filter((t) => t.studentId === student.id).slice(0, 8);

  const submit = (type: "credit" | "debit") => {
    const n = parseFloat(amount);
    if (!n || n <= 0) return toast.error("Enter a valid amount");
    adjustBalance(student.id, type, n, note || undefined);
    toast.success(`${type === "credit" ? "Credited" : "Debited"} ${formatNGN(n)} to ${student.name}`);
    setAmount("");
    setNote("");
  };

  return (
    <Sheet open={!!student} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display">{student.name}</SheetTitle>
          <div className="text-xs text-muted-foreground">{student.matric} · {student.department} · {student.level}L</div>
        </SheetHeader>

        <div className="mt-6 p-4 rounded-[12px] bg-muted">
          <div className="label-caps text-muted-foreground">Wallet balance</div>
          <div className="font-display text-2xl font-semibold mt-1 num">{formatNGN(student.balance)}</div>
          <div className="text-xs text-muted-foreground mt-1">Last active {timeAgo(student.lastActive)}</div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="label-caps text-muted-foreground">Adjust balance</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="amt" className="text-xs">Amount (₦)</Label>
              <Input id="amt" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="status" className="text-xs">Status</Label>
              <Select value={student.status} onValueChange={(v) => { setStatus(student.id, v as Student["status"]); toast.success(`Status set to ${v}`); }}>
                <SelectTrigger id="status" className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="frozen">Frozen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="note" className="text-xs">Note (optional)</Label>
            <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for adjustment…" className="mt-1 min-h-[60px]" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => submit("credit")} className="bg-credit hover:bg-credit/90 text-white"><ArrowDownLeft className="h-4 w-4 mr-1" />Credit</Button>
            <Button onClick={() => submit("debit")} variant="outline"><ArrowUpRight className="h-4 w-4 mr-1" />Debit</Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => { resetPin(student.id); toast.success("PIN reset link sent"); }}>
            <KeyRound className="h-4 w-4 mr-1" />Reset PIN
          </Button>
          <Button variant="outline" onClick={() => toast.success(`Email sent to ${student.email}`)}>
            <Mail className="h-4 w-4 mr-1" />Email student
          </Button>
        </div>

        <div className="mt-6">
          <div className="label-caps text-muted-foreground mb-2">Recent activity</div>
          <div className="space-y-2">
            {studentTxs.length ? studentTxs.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-2.5 rounded-[8px] bg-muted/50 text-xs">
                <div>
                  <div className="font-medium text-foreground">{t.category}</div>
                  <div className="text-muted-foreground">{timeAgo(t.ts)} · {t.channel}</div>
                </div>
                <div className={`num font-medium ${t.type === "credit" ? "text-credit" : "text-debit"}`}>
                  {t.type === "credit" ? "+" : "−"}{formatNGN(t.amount)}
                </div>
              </div>
            )) : <div className="text-xs text-muted-foreground">No transactions yet.</div>}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-border">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full text-debit border-debit/30 hover:bg-debit/10 hover:text-debit">
                <Trash2 className="h-4 w-4 mr-1" />Remove student
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove {student.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This deletes the wallet from the directory. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-debit hover:bg-debit/90"
                  onClick={() => { removeStudent(student.id); toast.success("Student removed"); onOpenChange(false); }}
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SheetContent>
    </Sheet>
  );
};
