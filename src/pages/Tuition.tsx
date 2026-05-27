import { useEffect, useState } from "react";
import { AppLayout } from "@/components/lmu/AppLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/store/auth";
import { useWallet } from "@/store/wallet";
import { toast } from "sonner";
import { CheckCircle2, Download, GraduationCap, Loader2 } from "lucide-react";
import jsPDF from "jspdf";

interface Fee { id: string; label: string; amount: number; semester: string; due_date: string | null; }
interface Payment { id: string; fee_id: string; amount: number; paid_at: string; }

const DEMO_FEES: Fee[] = [
  { id: "f1", label: "First Semester Tuition", amount: 250000, semester: "2025/2026 First", due_date: "2025-10-15" },
  { id: "f2", label: "Second Semester Tuition", amount: 250000, semester: "2025/2026 Second", due_date: "2026-03-15" },
  { id: "f3", label: "Hostel Accommodation", amount: 120000, semester: "2025/2026 Full", due_date: "2025-09-30" },
  { id: "f4", label: "Library Fee", amount: 15000, semester: "2025/2026 Full", due_date: null },
];

const DEMO_PAYMENTS: Payment[] = [
  { id: "p1", fee_id: "f3", amount: 120000, paid_at: new Date(Date.now() - 172800000).toISOString() },
];

const ngn = (n: number) => "₦" + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function TuitionPage() {
  const { user, isDemo } = useAuth();
  const { balance, payProduct } = useWallet();
  const [fees, setFees] = useState<Fee[]>([]);
  const [paid, setPaid] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    if (isDemo) {
      setFees(DEMO_FEES);
      setPaid(DEMO_PAYMENTS);
      setLoading(false);
      return;
    }
    const [f, p] = await Promise.all([
      supabase.from("tuition_fees").select("*").order("due_date"),
      supabase.from("tuition_payments").select("*").eq("user_id", user.id),
    ]);
    setFees((f.data as any) || []);
    setPaid((p.data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const isPaid = (id: string) => paid.some((p) => p.fee_id === id);

  const handlePay = async (fee: Fee) => {
    if (!user) return;
    if (balance < fee.amount) return toast.error("Insufficient wallet balance");
    setPaying(fee.id);
    const ok = payProduct(fee.amount, `Tuition: ${fee.label}`);
    if (!ok) { setPaying(null); return toast.error("Payment failed"); }
    if (!isDemo) {
      const { error } = await supabase.from("tuition_payments").insert({ user_id: user.id, fee_id: fee.id, amount: fee.amount });
      if (error) { setPaying(null); return toast.error(error.message); }
    } else {
      setPaid((prev) => [...prev, { id: `p${Date.now()}`, fee_id: fee.id, amount: fee.amount, paid_at: new Date().toISOString() }]);
    }
    setPaying(null);
    toast.success(`${fee.label} paid`);
    if (!isDemo) load();
  };

  const downloadReceipt = (fee: Fee, payment: Payment) => {
    const doc = new jsPDF();
    doc.setFontSize(20); doc.text("LMU Wallet — Payment Receipt", 20, 25);
    doc.setFontSize(10); doc.setTextColor(120);
    doc.text(`Receipt #${payment.id.slice(0, 8).toUpperCase()}`, 20, 33);
    doc.setTextColor(0);
    doc.line(20, 40, 190, 40);
    doc.setFontSize(11);
    let y = 55;
    const row = (k: string, v: string) => { doc.setTextColor(120); doc.text(k, 20, y); doc.setTextColor(0); doc.text(v, 90, y); y += 9; };
    row("Student", user?.email || "—");
    row("Item", fee.label);
    row("Semester", fee.semester);
    row("Amount", ngn(payment.amount));
    row("Paid at", new Date(payment.paid_at).toLocaleString());
    row("Status", "PAID");
    y += 8;
    doc.setFontSize(9); doc.setTextColor(120);
    doc.text("This is an electronic receipt. No signature required.", 20, y);
    doc.save(`receipt-${fee.label.replace(/\s+/g, "-")}.pdf`);
  };

  const total = fees.reduce((s, f) => s + Number(f.amount), 0);
  const totalPaid = paid.reduce((s, p) => s + Number(p.amount), 0);
  const outstanding = total - totalPaid;

  return (
    <AppLayout title="Tuition" eyebrow="Fees & Payments">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-[14px] p-5">
          <div className="text-sm text-muted-foreground">Total Fees</div>
          <div className="mt-1 font-display text-2xl font-bold">{ngn(total)}</div>
        </div>
        <div className="bg-card border border-border rounded-[14px] p-5">
          <div className="text-sm text-muted-foreground">Paid</div>
          <div className="mt-1 font-display text-2xl font-bold text-emerald-500">{ngn(totalPaid)}</div>
        </div>
        <div className="bg-card border border-border rounded-[14px] p-5">
          <div className="text-sm text-muted-foreground">Outstanding</div>
          <div className="mt-1 font-display text-2xl font-bold text-amber-500">{ngn(outstanding)}</div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-3">
          {fees.map((fee) => {
            const p = paid.find((x) => x.fee_id === fee.id);
            return (
              <div key={fee.id} className="bg-card border border-border rounded-[14px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-[10px] bg-primary/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{fee.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{fee.semester}{fee.due_date ? ` · Due ${new Date(fee.due_date).toLocaleDateString()}` : ""}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-display font-bold text-lg">{ngn(Number(fee.amount))}</div>
                  {p ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Paid
                      </span>
                      <Button size="sm" variant="outline" className="rounded-[10px]" onClick={() => downloadReceipt(fee, p)}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" className="rounded-[10px]" disabled={paying === fee.id || balance < fee.amount} onClick={() => handlePay(fee)}>
                      {paying === fee.id && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
                      Pay
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
