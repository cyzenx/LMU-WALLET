import { useState } from "react";
import { AppLayout } from "@/components/lmu/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/store/wallet";
import { useAuth } from "@/store/auth";
import { useProfile } from "@/store/profile";
import { toast } from "sonner";
import { Download, FileText } from "lucide-react";
import jsPDF from "jspdf";

const ngn = (n: number) => "₦" + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function StatementsPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { transactions, balance } = useWallet();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = transactions; // wallet store doesn't store ISO dates; this exports current ledger

  const exportCSV = () => {
    const rows = [["Date", "Type", "Title", "Meta", "Amount"]];
    filtered.forEach((t) => rows.push([t.time, t.type, t.title, t.meta, String(t.amount)]));
    const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `statement-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Statement exported");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20); doc.text("LMU Wallet — Statement", 20, 25);
    doc.setFontSize(10); doc.setTextColor(120);
    doc.text(`${profile?.full_name || user?.email || ""}`, 20, 33);
    doc.text(`Generated ${new Date().toLocaleString()}`, 20, 39);
    doc.text(`Closing balance: ${ngn(balance)}`, 20, 45);
    doc.line(20, 50, 190, 50);
    doc.setTextColor(0); doc.setFontSize(10);
    let y = 58;
    doc.setFont("helvetica", "bold");
    doc.text("Date", 20, y); doc.text("Description", 65, y); doc.text("Amount", 165, y);
    doc.setFont("helvetica", "normal"); y += 5;
    doc.line(20, y, 190, y); y += 5;
    filtered.forEach((t) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setTextColor(120); doc.text(t.time, 20, y);
      doc.setTextColor(0); doc.text(t.title.slice(0, 50), 65, y);
      doc.setTextColor(t.type === "credit" ? 30 : 200, t.type === "credit" ? 130 : 30, 30);
      doc.text(`${t.type === "credit" ? "+" : "-"}${ngn(t.amount)}`, 165, y);
      doc.setTextColor(0); y += 5;
      doc.setTextColor(140); doc.setFontSize(8); doc.text(t.meta.slice(0, 60), 65, y); doc.setFontSize(10); doc.setTextColor(0);
      y += 6;
    });
    doc.save(`statement-${Date.now()}.pdf`);
    toast.success("PDF exported");
  };

  return (
    <AppLayout title="Statements" eyebrow="Export your activity">
      <div className="rounded-[14px] bg-card border border-border p-6 max-w-2xl">
        <FileText className="h-8 w-8 text-primary mb-3" />
        <h3 className="font-display text-lg font-semibold">Account statement</h3>
        <p className="text-sm text-muted-foreground mt-1">Download your wallet activity as a PDF or CSV file.</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div><Label className="text-xs">From (optional)</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1" /></div>
          <div><Label className="text-xs">To (optional)</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1" /></div>
        </div>

        <div className="mt-5 p-4 rounded-[10px] bg-muted text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Transactions</span><span className="font-medium">{filtered.length}</span></div>
          <div className="flex justify-between mt-1"><span className="text-muted-foreground">Closing balance</span><span className="num font-semibold">{ngn(balance)}</span></div>
        </div>

        <div className="mt-5 flex gap-2">
          <Button onClick={exportPDF} className="flex-1"><Download className="h-4 w-4 mr-2" />PDF</Button>
          <Button onClick={exportCSV} variant="outline" className="flex-1"><Download className="h-4 w-4 mr-2" />CSV</Button>
        </div>
      </div>
    </AppLayout>
  );
}
