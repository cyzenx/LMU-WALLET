import { useMemo, useState } from "react";
import { Search, Lock, Unlock, Settings2 } from "lucide-react";
import { useAdmin, formatNGN, timeAgo, Student } from "@/store/admin";
import { toast } from "sonner";
import { StudentDetailDrawer } from "./StudentDetailDrawer";

const StatusPill = ({ status }: { status: Student["status"] }) => {
  const map = {
    active: "bg-credit/10 text-credit",
    frozen: "bg-muted text-muted-foreground",
    flagged: "bg-debit/10 text-debit",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${map[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
};

export const StudentsTable = () => {
  const { students, toggleFreeze } = useAdmin();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | Student["status"]>("all");
  const [selected, setSelected] = useState<Student | null>(null);

  const filtered = useMemo(() => {
    return students
      .filter((s) => (filter === "all" ? true : s.status === filter))
      .filter((s) =>
        q
          ? [s.name, s.matric, s.email, s.department].some((v) =>
              v.toLowerCase().includes(q.toLowerCase()),
            )
          : true,
      )
      .sort((a, b) => b.lastActive - a.lastActive);
  }, [students, q, filter]);

  const handleFreeze = (s: Student) => {
    toggleFreeze(s.id);
    toast.success(s.status === "frozen" ? `${s.name}'s wallet unfrozen` : `${s.name}'s wallet frozen`);
  };

  return (
    <>
    <div className="rounded-[14px] bg-card border border-border overflow-hidden">
      <div className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-border">
        <div>
          <div className="label-caps text-muted-foreground">Directory</div>
          <h3 className="font-display text-lg font-semibold mt-1">Students ({filtered.length})</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, matric, dept…"
              className="pl-9 pr-3 py-2 rounded-[10px] bg-muted text-sm border border-transparent focus:border-primary outline-none w-64"
            />
          </div>
          <div className="flex items-center bg-muted rounded-[10px] p-1 text-xs">
            {(["all", "active", "flagged", "frozen"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-[8px] capitalize transition-colors ${
                  filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left label-caps text-muted-foreground border-b border-border">
              <th className="px-5 py-3 font-medium">Student</th>
              <th className="px-5 py-3 font-medium">Matric</th>
              <th className="px-5 py-3 font-medium">Department</th>
              <th className="px-5 py-3 font-medium text-right">Balance</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Last active</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const initials = s.name
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("");
              return (
                <tr key={s.id} className="border-b border-border/60 hover:bg-muted/40 transition-colors">
                  <td className="px-5 py-3 cursor-pointer" onClick={() => setSelected(s)}>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-display text-xs font-semibold">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate">{s.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 num text-foreground">{s.matric}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {s.department} · {s.level}L
                  </td>
                  <td className="px-5 py-3 num text-right font-medium text-foreground">{formatNGN(s.balance)}</td>
                  <td className="px-5 py-3">
                    <StatusPill status={s.status} />
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{timeAgo(s.lastActive)}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleFreeze(s)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-xs font-medium transition-colors ${
                          s.status === "frozen"
                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                            : "bg-muted text-foreground hover:bg-muted/70"
                        }`}
                      >
                        {s.status === "frozen" ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                        {s.status === "frozen" ? "Unfreeze" : "Freeze"}
                      </button>
                      <button
                        onClick={() => setSelected(s)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                        Manage
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!filtered.length && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No students match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    <StudentDetailDrawer student={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </>
  );
};