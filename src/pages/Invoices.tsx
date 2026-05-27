import { AppLayout } from "@/components/lmu/AppLayout";
import { Plus, Download, FileText } from "lucide-react";

type Status = "Paid" | "Pending" | "Overdue";

const invoices: { id: string; title: string; due: string; amount: string; status: Status }[] = [
  { id: "INV-2041", title: "Tuition – Second Semester", due: "30 Apr 2025", amount: "185,000.00", status: "Pending" },
  { id: "INV-2038", title: "Hostel Accommodation Fee", due: "22 Apr 2025", amount: "120,000.00", status: "Paid" },
  { id: "INV-2034", title: "Library Membership", due: "15 Apr 2025", amount: "5,500.00", status: "Paid" },
  { id: "INV-2029", title: "Department Levy – CSC", due: "08 Apr 2025", amount: "12,000.00", status: "Overdue" },
  { id: "INV-2025", title: "Sports Pavilion Access", due: "01 Apr 2025", amount: "3,500.00", status: "Paid" },
  { id: "INV-2019", title: "ID Card Replacement", due: "25 Mar 2025", amount: "2,000.00", status: "Paid" },
];

const statusStyles: Record<Status, string> = {
  Paid: "bg-credit/10 text-credit",
  Pending: "bg-primary/10 text-primary",
  Overdue: "bg-debit/10 text-debit",
};

const stats = [
  { label: "Outstanding", value: "₦197,000.00", tone: "text-debit" },
  { label: "Paid This Year", value: "₦261,000.00", tone: "text-credit" },
  { label: "Total Invoices", value: "14", tone: "text-foreground" },
];

export default function InvoicesPage() {
  return (
    <AppLayout title="Invoices" eyebrow="Billing">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[14px] bg-card border border-border p-6">
            <span className="label-caps text-muted-foreground">{s.label}</span>
            <div className={`mt-4 num text-[26px] font-bold tracking-tight ${s.tone}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-[14px] bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">All Invoices</h3>
            <p className="text-xs text-muted-foreground mt-1">Tuition, hostel and faculty bills issued to your account.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[10px] px-3.5 py-2 text-xs font-medium">
            <Plus className="h-3.5 w-3.5" /> New Invoice
          </button>
        </div>

        <div className="divide-y divide-border">
          <div className="grid grid-cols-12 gap-4 py-3 label-caps text-muted-foreground">
            <div className="col-span-2">Invoice</div>
            <div className="col-span-4">Description</div>
            <div className="col-span-2">Due Date</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2 text-right">Status</div>
          </div>
          {invoices.map((inv) => (
            <div key={inv.id} className="grid grid-cols-12 gap-4 py-4 items-center">
              <div className="col-span-2 flex items-center gap-2">
                <div className="h-8 w-8 rounded-[8px] bg-muted flex items-center justify-center text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <span className="num text-xs text-foreground font-medium">{inv.id}</span>
              </div>
              <div className="col-span-4 text-sm text-foreground truncate">{inv.title}</div>
              <div className="col-span-2 text-xs text-muted-foreground">{inv.due}</div>
              <div className="col-span-2 text-right num text-sm font-semibold text-foreground">₦{inv.amount}</div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                <span className={`text-[10px] px-2 py-1 rounded font-medium ${statusStyles[inv.status]}`}>{inv.status.toUpperCase()}</span>
                <button className="h-8 w-8 rounded-[8px] border border-border flex items-center justify-center text-muted-foreground hover:text-foreground" aria-label="Download">
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}