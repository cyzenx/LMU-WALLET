import { useEffect, useState } from "react";
import { AppLayout } from "@/components/lmu/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/store/auth";
import { useProfile } from "@/store/profile";
import { toast } from "sonner";
import { CreditCard, Eye, EyeOff, Snowflake, Loader2, Plus } from "lucide-react";

interface Card {
  id: string; user_id: string; card_number: string; cvv: string; expiry: string;
  cardholder_name: string; frozen: boolean; monthly_limit: number;
}

const fakeCardNumber = () => Array.from({ length: 4 }, () => Math.floor(1000 + Math.random() * 9000)).join(" ");
const fakeCvv = () => Math.floor(100 + Math.random() * 900).toString();
const fakeExpiry = () => { const d = new Date(); d.setFullYear(d.getFullYear() + 3); return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear().toString().slice(2)}`; };

export default function CardsPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [editLimit, setEditLimit] = useState<string | null>(null);
  const [limitVal, setLimitVal] = useState("");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("virtual_cards").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setCards((data as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [user?.id]);

  const issueCard = async () => {
    if (!user) return;
    const name = (profile?.full_name || user.email?.split("@")[0] || "LMU Student").toUpperCase();
    const { error } = await supabase.from("virtual_cards").insert({
      user_id: user.id, card_number: fakeCardNumber(), cvv: fakeCvv(), expiry: fakeExpiry(),
      cardholder_name: name, frozen: false, monthly_limit: 100000,
    });
    if (error) return toast.error(error.message);
    toast.success("Virtual card issued");
    load();
  };

  const toggleFreeze = async (c: Card) => {
    await supabase.from("virtual_cards").update({ frozen: !c.frozen }).eq("id", c.id);
    toast.success(c.frozen ? "Card unfrozen" : "Card frozen");
    load();
  };

  const updateLimit = async (id: string) => {
    const v = parseFloat(limitVal);
    if (!v || v < 0) return toast.error("Invalid limit");
    await supabase.from("virtual_cards").update({ monthly_limit: v }).eq("id", id);
    toast.success("Limit updated");
    setEditLimit(null); setLimitVal(""); load();
  };

  const deleteCard = async (id: string) => {
    await supabase.from("virtual_cards").delete().eq("id", id);
    toast.success("Card removed");
    load();
  };

  return (
    <AppLayout title="Cards" eyebrow="Virtual Debit">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Your virtual debit cards work everywhere LMU Wallet is accepted.</p>
        <Button onClick={issueCard} className="rounded-[10px]"><Plus className="h-4 w-4 mr-1" />Issue card</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : !cards.length ? (
        <div className="rounded-[14px] bg-card border border-border p-12 text-center">
          <CreditCard className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <div className="text-sm text-muted-foreground">No cards yet. Issue your first virtual card.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {cards.map((c) => {
            const shown = reveal[c.id];
            return (
              <div key={c.id} className="rounded-[16px] overflow-hidden bg-card border border-border">
                <div className={`relative p-6 bg-gradient-to-br ${c.frozen ? "from-slate-700 to-slate-900" : "from-forest to-[#0d1f1a]"} text-white min-h-[200px] flex flex-col justify-between`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-white/60">LMU Wallet</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{c.frozen ? "FROZEN" : "ACTIVE"}</div>
                    </div>
                    <CreditCard className="h-7 w-7 text-white/60" />
                  </div>
                  <div>
                    <div className="num text-xl tracking-[0.2em] font-mono">
                      {shown ? c.card_number : "•••• •••• •••• " + c.card_number.slice(-4)}
                    </div>
                    <div className="flex justify-between mt-4 text-xs">
                      <div>
                        <div className="text-white/40 uppercase tracking-wider text-[9px]">Cardholder</div>
                        <div className="font-medium tracking-wide">{c.cardholder_name}</div>
                      </div>
                      <div>
                        <div className="text-white/40 uppercase tracking-wider text-[9px]">Expires</div>
                        <div className="font-medium num">{c.expiry}</div>
                      </div>
                      <div>
                        <div className="text-white/40 uppercase tracking-wider text-[9px]">CVV</div>
                        <div className="font-medium num">{shown ? c.cvv : "•••"}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setReveal({ ...reveal, [c.id]: !shown })}>
                      {shown ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
                      {shown ? "Hide" : "Reveal"}
                    </Button>
                    <Button size="sm" variant={c.frozen ? "default" : "outline"} onClick={() => toggleFreeze(c)}>
                      <Snowflake className="h-3.5 w-3.5 mr-1" />{c.frozen ? "Unfreeze" : "Freeze"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteCard(c.id)} className="text-debit hover:text-debit ml-auto">
                      Remove
                    </Button>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Monthly limit</span>
                      {editLimit === c.id ? (
                        <div className="flex gap-1">
                          <Input value={limitVal} onChange={(e) => setLimitVal(e.target.value)} className="h-7 w-28 text-xs" placeholder="Amount" />
                          <Button size="sm" className="h-7" onClick={() => updateLimit(c.id)}>Save</Button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditLimit(c.id); setLimitVal(String(c.monthly_limit)); }} className="font-medium text-foreground hover:text-primary">
                          ₦{Number(c.monthly_limit).toLocaleString()} · Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
