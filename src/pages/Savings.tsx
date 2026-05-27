import { useEffect, useState } from "react";
import { AppLayout } from "@/components/lmu/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/store/auth";
import { useWallet } from "@/store/wallet";
import { toast } from "sonner";
import { Plus, Target, Loader2, Trash2 } from "lucide-react";

interface Goal { id: string; user_id: string; name: string; target_amount: number; current_amount: number; deadline: string | null; }

const ngn = (n: number) => "₦" + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 0 });

export default function SavingsPage() {
  const { user } = useAuth();
  const { balance, payProduct, topUp } = useWallet();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", target_amount: "", deadline: "" });
  const [contribOpen, setContribOpen] = useState<Goal | null>(null);
  const [contribAmt, setContribAmt] = useState("");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("savings_goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setGoals((data as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [user?.id]);

  const create = async () => {
    if (!user) return;
    const target = parseFloat(form.target_amount);
    if (!form.name.trim() || !target || target <= 0) return toast.error("Name and target required");
    const { error } = await supabase.from("savings_goals").insert({
      user_id: user.id, name: form.name.trim(), target_amount: target,
      deadline: form.deadline || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Goal created");
    setForm({ name: "", target_amount: "", deadline: "" });
    setOpen(false); load();
  };

  const contribute = async () => {
    if (!contribOpen) return;
    const amt = parseFloat(contribAmt);
    if (!amt || amt <= 0) return toast.error("Invalid amount");
    if (balance < amt) return toast.error("Insufficient balance");
    const ok = payProduct(amt, `Savings: ${contribOpen.name}`);
    if (!ok) return toast.error("Payment failed");
    await supabase.from("savings_goals").update({ current_amount: Number(contribOpen.current_amount) + amt }).eq("id", contribOpen.id);
    toast.success(`${ngn(amt)} added to ${contribOpen.name}`);
    setContribAmt(""); setContribOpen(null); load();
  };

  const withdraw = async (g: Goal) => {
    if (g.current_amount <= 0) return;
    topUp(Number(g.current_amount), `Savings withdrawal: ${g.name}`);
    await supabase.from("savings_goals").update({ current_amount: 0 }).eq("id", g.id);
    toast.success(`${ngn(Number(g.current_amount))} withdrawn from ${g.name}`);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("savings_goals").delete().eq("id", id);
    toast.success("Goal removed");
    load();
  };

  return (
    <AppLayout title="Savings Goals" eyebrow="Plan ahead">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Set targets, contribute from your wallet, and withdraw any time.</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="rounded-[10px]"><Plus className="h-4 w-4 mr-1" />New goal</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create savings goal</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Goal name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Textbook fund" className="mt-1" /></div>
              <div><Label className="text-xs">Target amount (₦)</Label><Input type="number" min="0" value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: e.target.value })} placeholder="50000" className="mt-1" /></div>
              <div><Label className="text-xs">Deadline (optional)</Label><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="mt-1" /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={create}>Create</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : !goals.length ? (
        <div className="rounded-[14px] bg-card border border-border p-12 text-center">
          <Target className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <div className="text-sm text-muted-foreground">No savings goals yet. Create one to start setting money aside.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => {
            const pct = Math.min(100, (Number(g.current_amount) / Number(g.target_amount)) * 100);
            return (
              <div key={g.id} className="rounded-[14px] bg-card border border-border p-5">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <div className="font-display font-semibold text-foreground truncate">{g.name}</div>
                    {g.deadline && <div className="text-xs text-muted-foreground">By {new Date(g.deadline).toLocaleDateString()}</div>}
                  </div>
                  <button onClick={() => remove(g.id)} className="text-muted-foreground hover:text-debit"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="num font-semibold text-foreground">{ngn(Number(g.current_amount))}</span>
                    <span className="text-muted-foreground">of <span className="num">{ngn(Number(g.target_amount))}</span></span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">{pct.toFixed(0)}% reached</div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => setContribOpen(g)}>Contribute</Button>
                  <Button size="sm" variant="outline" onClick={() => withdraw(g)} disabled={g.current_amount <= 0}>Withdraw</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!contribOpen} onOpenChange={(o) => !o && setContribOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add to {contribOpen?.name}</DialogTitle></DialogHeader>
          <div className="text-xs text-muted-foreground">Wallet balance: {ngn(balance)}</div>
          <div className="mt-3">
            <Label className="text-xs">Amount (₦)</Label>
            <Input type="number" min="0" value={contribAmt} onChange={(e) => setContribAmt(e.target.value)} placeholder="5000" className="mt-1" />
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setContribOpen(null)}>Cancel</Button><Button onClick={contribute}>Contribute</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
