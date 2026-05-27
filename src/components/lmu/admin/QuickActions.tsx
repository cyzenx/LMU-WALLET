import { useState } from "react";
import { Megaphone, Snowflake, Download, Pause, Play } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdmin, Announcement } from "@/store/admin";
import { toast } from "sonner";

export const QuickActions = () => {
  const { freezeAllFlagged, students, txs, broadcast, liveOn, setLiveOn } = useAdmin();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<Announcement["audience"]>("all");

  const handleFreezeAll = async () => {
    const n = await freezeAllFlagged();
    n ? toast.success(`Froze ${n} flagged wallet${n > 1 ? "s" : ""}`) : toast.info("No flagged wallets");
  };

  const handleExport = () => {
    const rows = [
      ["id", "name", "matric", "email", "dept", "level", "balance", "status"],
      ...students.map((s) => [s.id, s.name, s.matric, s.email, s.department, s.level, s.balance, s.status]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `lmu-students-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${students.length} students`);
  };

  const handleBroadcast = async () => {
    if (!title.trim() || !body.trim()) return toast.error("Title and body required");
    const n = await broadcast(title.trim(), body.trim(), audience);
    toast.success(`Sent to ${n} student${n === 1 ? "" : "s"}`);
    setTitle(""); setBody(""); setAudience("all"); setOpen(false);
  };

  return (
    <div className="rounded-[14px] bg-card border border-border p-4 flex flex-wrap items-center gap-2">
      <div className="flex-1 min-w-[200px]">
        <div className="label-caps text-muted-foreground">Quick actions</div>
        <div className="text-sm text-foreground mt-0.5">{students.length} students · {txs.length} transactions</div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm"><Megaphone className="h-4 w-4 mr-1" />Broadcast</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Send announcement</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="aud" className="text-xs">Audience</Label>
              <Select value={audience} onValueChange={(v) => setAudience(v as Announcement["audience"])}>
                <SelectTrigger id="aud" className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All students</SelectItem>
                  <SelectItem value="flagged">Flagged only</SelectItem>
                  <SelectItem value="frozen">Frozen only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="t" className="text-xs">Title</Label>
              <Input id="t" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Maintenance window" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="b" className="text-xs">Message</Label>
              <Textarea id="b" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Wallet will be unavailable from 2–3am…" className="mt-1 min-h-[100px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleBroadcast}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button size="sm" variant="outline" onClick={handleFreezeAll}>
        <Snowflake className="h-4 w-4 mr-1" />Freeze all flagged
      </Button>
      <Button size="sm" variant="outline" onClick={handleExport}>
        <Download className="h-4 w-4 mr-1" />Export CSV
      </Button>
      <Button size="sm" variant="outline" onClick={() => setLiveOn(!liveOn)}>
        {liveOn ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
        {liveOn ? "Pause feed" : "Resume feed"}
      </Button>
    </div>
  );
};
