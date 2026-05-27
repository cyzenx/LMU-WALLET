import { useEffect, useState } from "react";
import { AppLayout } from "@/components/lmu/AppLayout";
import { Plus, Search, Send, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/store/auth";
import { useWallet } from "@/store/wallet";
import { toast } from "sonner";

interface Beneficiary {
  id: string;
  user_id: string;
  nickname: string | null;
  full_name: string;
  bank: string;
  account_number: string;
}

const tones = [
  "from-[#1D9E75]/90 to-[#0d1f1a]/80",
  "from-[#b91c1c]/90 to-[#dc2626]/80",
  "from-[#5b21b6]/90 to-[#7c3aed]/80",
  "from-[#b45309]/90 to-[#d97706]/80",
  "from-[#0369a1]/90 to-[#0284c7]/80",
  "from-[#be185d]/90 to-[#db2777]/80",
];

export default function BeneficiariesPage() {
  const { user } = useAuth();
  const { send } = useWallet();
  const [list, setList] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nickname: "", full_name: "", bank: "", account_number: "" });
  const [sendOpen, setSendOpen] = useState<Beneficiary | null>(null);
  const [sendAmount, setSendAmount] = useState("");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("beneficiaries").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setList((data as Beneficiary[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const handleAdd = async () => {
    if (!user) return;
    if (!form.full_name.trim() || !form.bank.trim() || !form.account_number.trim()) return toast.error("Fill all required fields");
    const { error } = await supabase.from("beneficiaries").insert({
      user_id: user.id, nickname: form.nickname.trim() || null, full_name: form.full_name.trim(),
      bank: form.bank.trim(), account_number: form.account_number.trim(),
    });
    if (error) return toast.error(error.message);
    toast.success("Beneficiary added");
    setForm({ nickname: "", full_name: "", bank: "", account_number: "" });
    setOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("beneficiaries").delete().eq("id", id);
    toast.success("Removed");
    load();
  };

  const handleSend = () => {
    if (!sendOpen) return;
    const amt = parseFloat(sendAmount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");
    const ok = send(amt, sendOpen.account_number, sendOpen.bank);
    if (ok) {
      toast.success(`₦${amt.toLocaleString()} sent to ${sendOpen.full_name}`);
      setSendAmount(""); setSendOpen(null);
    } else toast.error("Insufficient balance");
  };

  const filtered = list.filter((b) =>
    !q || [b.full_name, b.nickname, b.bank, b.account_number].some((v) => v?.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <AppLayout title="Beneficiaries" eyebrow="Saved Recipients">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2 bg-card border border-border rounded-[12px] px-3.5 py-2.5 w-full md:w-80">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search beneficiaries…" className="bg-transparent text-sm flex-1 outline-none placeholder:text-muted-foreground" />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-[10px]"><Plus className="h-3.5 w-3.5 mr-1" /> Add Beneficiary</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add beneficiary</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Nickname (optional)</Label><Input value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} placeholder="Roommate" className="mt-1" /></div>
              <div><Label className="text-xs">Full name *</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Chidinma Eze" className="mt-1" /></div>
              <div><Label className="text-xs">Bank *</Label><Input value={form.bank} onChange={(e) => setForm({ ...form, bank: e.target.value })} placeholder="GTBank" className="mt-1" /></div>
              <div><Label className="text-xs">Account number *</Label><Input value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} placeholder="0123456789" className="mt-1" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : !filtered.length ? (
        <div className="rounded-[14px] bg-card border border-border p-12 text-center">
          <div className="text-muted-foreground text-sm">{list.length ? "No beneficiaries match your search." : "No beneficiaries yet. Add your first one to send money quickly."}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((b, i) => (
            <div key={b.id} className="rounded-[14px] bg-card border border-border p-5 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 shrink-0 rounded-[12px] bg-gradient-to-br ${tones[i % tones.length]} flex items-center justify-center font-display font-bold text-white`}>
                  {b.full_name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{b.nickname || b.full_name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{b.bank}</div>
                </div>
                <button onClick={() => handleDelete(b.id)} className="h-8 w-8 rounded-[8px] hover:bg-debit/10 flex items-center justify-center text-muted-foreground hover:text-debit" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <div className="num text-foreground font-semibold tracking-wider text-sm">{b.account_number}</div>
                  <span className="label-caps text-muted-foreground mt-1 inline-block">{b.full_name}</span>
                </div>
                <button onClick={() => setSendOpen(b)} className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/15 text-primary rounded-[8px] px-3 py-1.5 text-xs font-medium">
                  <Send className="h-3 w-3" /> Send
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!sendOpen} onOpenChange={(o) => !o && setSendOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Send to {sendOpen?.full_name}</DialogTitle></DialogHeader>
          <div className="text-xs text-muted-foreground">{sendOpen?.bank} · {sendOpen?.account_number}</div>
          <div className="mt-3">
            <Label className="text-xs">Amount (₦)</Label>
            <Input type="number" min="0" step="0.01" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} placeholder="0.00" className="mt-1" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendOpen(null)}>Cancel</Button>
            <Button onClick={handleSend}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
