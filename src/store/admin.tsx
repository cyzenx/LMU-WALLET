import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./auth";

export type StudentStatus = "active" | "frozen" | "flagged";
export type AdminTxType = "credit" | "debit";

export interface Student {
  id: string;
  name: string;
  matric: string;
  email: string;
  department: string;
  level: 100 | 200 | 300 | 400;
  balance: number;
  status: StudentStatus;
  lastActive: number;
}

export interface AdminTx {
  id: string;
  studentId: string;
  studentName: string;
  matric: string;
  type: AdminTxType;
  amount: number;
  category: string;
  channel: string;
  ts: number;
  flagged?: boolean;
  flagReason?: string;
  note?: string;
  refunded?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: "all" | "flagged" | "frozen";
  ts: number;
  recipients?: number;
}

export interface AuditEntry {
  id: string;
  action: string;
  target?: string;
  ts: number;
}

interface AdminCtx {
  students: Student[];
  txs: AdminTx[];
  loading: boolean;
  toggleFreeze: (id: string) => Promise<void>;
  resolveFlag: (txId: string) => Promise<void>;
  liveOn: boolean;
  setLiveOn: (v: boolean) => void;
  adjustBalance: (id: string, type: AdminTxType, amount: number, note?: string) => Promise<void>;
  setStatus: (id: string, status: StudentStatus) => Promise<void>;
  removeStudent: (id: string) => Promise<void>;
  freezeAllFlagged: () => Promise<number>;
  resetPin: (id: string) => Promise<void>;
  refundTx: (txId: string) => Promise<void>;
  bulkCredit: (rows: { matric: string; amount: number; note?: string }[]) => Promise<{ ok: number; fail: number }>;
  announcements: Announcement[];
  broadcast: (title: string, body: string, audience: Announcement["audience"]) => Promise<number>;
  audit: AuditEntry[];
}

const AdminContext = createContext<AdminCtx | null>(null);

const DEMO_STUDENTS: Student[] = [
  { id: "s1", name: "Chinonso Adeleke", matric: "20CG101234", email: "c.adeleke@lmu.edu.ng", department: "Computer Science", level: 300, balance: 45200, status: "active", lastActive: Date.now() - 120000 },
  { id: "s2", name: "Fatima Bello", matric: "21MN102456", email: "f.bello@lmu.edu.ng", department: "Medicine", level: 200, balance: 128500, status: "active", lastActive: Date.now() - 300000 },
  { id: "s3", name: "Emeka Okafor", matric: "19BL103789", email: "e.okafor@lmu.edu.ng", department: "Business Law", level: 400, balance: 8500, status: "flagged", lastActive: Date.now() - 600000 },
  { id: "s4", name: "Aisha Danladi", matric: "22MC104321", email: "a.danladi@lmu.edu.ng", department: "Mass Communication", level: 100, balance: 250000, status: "active", lastActive: Date.now() - 900000 },
  { id: "s5", name: "Olumide Bakare", matric: "20EN105654", email: "o.bakare@lmu.edu.ng", department: "Engineering", level: 300, balance: 0, status: "frozen", lastActive: Date.now() - 86400000 },
  { id: "s6", name: "Ngozi Eze", matric: "21EC106987", email: "n.eze@lmu.edu.ng", department: "Economics", level: 200, balance: 67500, status: "active", lastActive: Date.now() - 180000 },
  { id: "s7", name: "Ibrahim Musa", matric: "19PH107213", email: "i.musa@lmu.edu.ng", department: "Pharmacy", level: 400, balance: 156000, status: "active", lastActive: Date.now() - 450000 },
  { id: "s8", name: "Grace Adeyemi", matric: "22BA108546", email: "g.adeyemi@lmu.edu.ng", department: "Banking & Finance", level: 100, balance: 32000, status: "active", lastActive: Date.now() - 720000 },
];

const DEMO_TXS: any[] = [
  { id: "tx1", student_id: "s1", type: "credit", amount: 25000, category: "Top Up", channel: "Bank Transfer", created_at: new Date(Date.now() - 120000).toISOString(), flagged: false, flag_reason: null, note: null, refunded: false },
  { id: "tx2", student_id: "s2", type: "debit", amount: 4500, category: "Cafeteria", channel: "Card", created_at: new Date(Date.now() - 300000).toISOString(), flagged: false, flag_reason: null, note: null, refunded: false },
  { id: "tx3", student_id: "s3", type: "debit", amount: 75000, category: "Transfer", channel: "Wallet", created_at: new Date(Date.now() - 600000).toISOString(), flagged: true, flag_reason: "Unusually large amount", note: null, refunded: false },
  { id: "tx4", student_id: "s4", type: "credit", amount: 150000, category: "Top Up", channel: "Bank Transfer", created_at: new Date(Date.now() - 900000).toISOString(), flagged: false, flag_reason: null, note: null, refunded: false },
  { id: "tx5", student_id: "s1", type: "debit", amount: 3200, category: "Bookshop", channel: "Card", created_at: new Date(Date.now() - 1100000).toISOString(), flagged: false, flag_reason: null, note: null, refunded: false },
  { id: "tx6", student_id: "s6", type: "credit", amount: 50000, category: "Top Up", channel: "USSD", created_at: new Date(Date.now() - 1500000).toISOString(), flagged: false, flag_reason: null, note: null, refunded: false },
  { id: "tx7", student_id: "s7", type: "debit", amount: 12000, category: "Tuition", channel: "Wallet", created_at: new Date(Date.now() - 2000000).toISOString(), flagged: false, flag_reason: null, note: null, refunded: false },
  { id: "tx8", student_id: "s2", type: "debit", amount: 2500, category: "Cafeteria", channel: "Card", created_at: new Date(Date.now() - 2500000).toISOString(), flagged: false, flag_reason: null, note: null, refunded: true },
];

const DEMO_ANNOUNCEMENTS: Announcement[] = [
  { id: "a1", title: "Welcome to LMU Wallet", body: "All students can now top up, pay fees, and transfer securely.", audience: "all", ts: Date.now() - 86400000, recipients: 8 },
  { id: "a2", title: "Tuition Deadline", body: "Second semester tuition must be paid by June 30th.", audience: "all", ts: Date.now() - 172800000, recipients: 8 },
];

const DEMO_AUDIT: AuditEntry[] = [
  { id: "ad1", action: "Admin logged in", ts: Date.now() - 300000 },
  { id: "ad2", action: "Broadcast → all (8)", target: "Welcome to LMU Wallet", ts: Date.now() - 86400000 },
];

const mapStudent = (r: any): Student => ({
  id: r.id,
  name: r.name,
  matric: r.matric,
  email: r.email,
  department: r.department,
  level: r.level,
  balance: Number(r.balance),
  status: r.status,
  lastActive: new Date(r.last_active).getTime(),
});

const mapTx = (r: any, students: Student[]): AdminTx => {
  const s = students.find((x) => x.id === r.student_id);
  return {
    id: r.id,
    studentId: r.student_id,
    studentName: s?.name || "—",
    matric: s?.matric || "—",
    type: r.type,
    amount: Number(r.amount),
    category: r.category,
    channel: r.channel,
    ts: new Date(r.created_at).getTime(),
    flagged: r.flagged,
    flagReason: r.flag_reason || undefined,
    note: r.note || undefined,
    refunded: r.refunded,
  };
};

let demoTxId = 100;

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { isDemo } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [rawTxs, setRawTxs] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveOn, setLiveOn] = useState(true);

  const txs = useMemo(() => rawTxs.map((r) => mapTx(r, students)), [rawTxs, students]);

  const log = useCallback(async (action: string, target?: string) => {
    if (isDemo) {
      setAudit((a) => [{ id: `ad${Date.now()}`, action, target, ts: Date.now() }, ...a].slice(0, 100));
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("audit_log")
      .insert({ action, target, actor: userData.user?.id })
      .select()
      .single();
    if (!error && data) {
      setAudit((a) => [{ id: data.id, action, target, ts: new Date(data.created_at).getTime() }, ...a].slice(0, 100));
    }
  }, [isDemo]);

  // Initial load
  useEffect(() => {
    if (isDemo) {
      setStudents(DEMO_STUDENTS);
      setRawTxs(DEMO_TXS);
      setAnnouncements(DEMO_ANNOUNCEMENTS);
      setAudit(DEMO_AUDIT);
      setLoading(false);
      return;
    }
    (async () => {
      const [stuRes, txRes, annRes, audRes] = await Promise.all([
        supabase.from("students").select("*").order("last_active", { ascending: false }),
        supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(200),
        supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(50),
      ]);
      if (stuRes.data) setStudents(stuRes.data.map(mapStudent));
      if (txRes.data) setRawTxs(txRes.data);
      if (annRes.data)
        setAnnouncements(
          annRes.data.map((a) => ({
            id: a.id, title: a.title, body: a.body, audience: a.audience as Announcement["audience"],
            ts: new Date(a.created_at).getTime(), recipients: a.recipients_count,
          })),
        );
      if (audRes.data)
        setAudit(audRes.data.map((a) => ({ id: a.id, action: a.action, target: a.target || undefined, ts: new Date(a.created_at).getTime() })));
      setLoading(false);
    })();
  }, [isDemo]);

  // Realtime
  useEffect(() => {
    if (isDemo) return;
    const ch = supabase
      .channel("admin-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "students" }, (p) => {
        if (p.eventType === "INSERT") setStudents((prev) => [mapStudent(p.new), ...prev]);
        else if (p.eventType === "UPDATE") setStudents((prev) => prev.map((s) => (s.id === (p.new as any).id ? mapStudent(p.new) : s)));
        else if (p.eventType === "DELETE") setStudents((prev) => prev.filter((s) => s.id !== (p.old as any).id));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, (p) => {
        if (p.eventType === "INSERT") setRawTxs((prev) => [p.new, ...prev].slice(0, 200));
        else if (p.eventType === "UPDATE") setRawTxs((prev) => prev.map((t) => (t.id === (p.new as any).id ? p.new : t)));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [isDemo]);

  // Live demo feed (random tx every 6s when on)
  useEffect(() => {
    if (!liveOn || !students.length) return;
    const id = setInterval(async () => {
      const active = students.filter((s) => s.status !== "frozen");
      if (!active.length) return;
      const s = active[Math.floor(Math.random() * active.length)];
      const type: AdminTxType = Math.random() < 0.55 ? "debit" : "credit";
      const amount = Math.round((Math.random() * 50000 + 500) * 100) / 100;
      const flagged = amount > 40000 || Math.random() < 0.05;
      const cats = ["Top Up", "Transfer", "Cafeteria", "Bookshop", "Tuition", "Other"];
      const chans = ["Card", "Bank", "Wallet", "USSD"];

      if (isDemo) {
        demoTxId++;
        const txId = `dtx${demoTxId}`;
        const now = new Date().toISOString();
        setRawTxs((prev) => [{ id: txId, student_id: s.id, type, amount, category: cats[Math.floor(Math.random() * cats.length)], channel: chans[Math.floor(Math.random() * chans.length)], created_at: now, flagged, flag_reason: flagged ? (amount > 40000 ? "Unusually large amount" : "Rapid activity") : null, note: null, refunded: false }, ...prev].slice(0, 200));
        setStudents((prev) => prev.map((st) => st.id === s.id ? { ...st, balance: Math.max(0, st.balance + (type === "credit" ? amount : -amount)), lastActive: Date.now(), status: flagged && st.status === "active" ? "flagged" : st.status } : st));
        return;
      }

      await supabase.from("transactions").insert({
        student_id: s.id, type, amount, category: cats[Math.floor(Math.random() * cats.length)],
        channel: chans[Math.floor(Math.random() * chans.length)], flagged,
        flag_reason: flagged ? (amount > 40000 ? "Unusually large amount" : "Rapid activity") : null,
      });
      const newBal = Math.max(0, s.balance + (type === "credit" ? amount : -amount));
      await supabase.from("students").update({
        balance: newBal, last_active: new Date().toISOString(),
        status: flagged && s.status === "active" ? "flagged" : s.status,
      }).eq("id", s.id);
    }, 6000);
    return () => clearInterval(id);
  }, [liveOn, students, isDemo]);

  const toggleFreeze: AdminCtx["toggleFreeze"] = async (id) => {
    const s = students.find((x) => x.id === id);
    if (!s) return;
    const next: StudentStatus = s.status === "frozen" ? "active" : "frozen";
    if (isDemo) {
      setStudents((prev) => prev.map((st) => st.id === id ? { ...st, status: next } : st));
      log(next === "frozen" ? "Froze wallet" : "Unfroze wallet", s.name);
      return;
    }
    await supabase.from("students").update({ status: next }).eq("id", id);
    log(next === "frozen" ? "Froze wallet" : "Unfroze wallet", s.name);
  };

  const resolveFlag: AdminCtx["resolveFlag"] = async (txId) => {
    const t = txs.find((x) => x.id === txId);
    if (isDemo) {
      setRawTxs((prev) => prev.map((tx) => tx.id === txId ? { ...tx, flagged: false, flag_reason: null } : tx));
      if (t) log("Resolved flag", t.studentName);
      return;
    }
    await supabase.from("transactions").update({ flagged: false, flag_reason: null }).eq("id", txId);
    if (t) log("Resolved flag", t.studentName);
  };

  const adjustBalance: AdminCtx["adjustBalance"] = async (id, type, amount, note) => {
    if (!amount || amount <= 0) return;
    const s = students.find((x) => x.id === id);
    if (!s) return;
    if (isDemo) {
      demoTxId++;
      const txId = `dtx${demoTxId}`;
      setRawTxs((prev) => [{ id: txId, student_id: id, type, amount, category: type === "credit" ? "Top Up" : "Other", channel: "Wallet", created_at: new Date().toISOString(), flagged: false, flag_reason: null, note: note || "Admin adjustment", refunded: false }, ...prev]);
      setStudents((prev) => prev.map((st) => st.id === id ? { ...st, balance: Math.max(0, st.balance + (type === "credit" ? amount : -amount)), lastActive: Date.now() } : st));
      log(`${type === "credit" ? "Credited" : "Debited"} ${formatNGN(amount)}`, s.name);
      return;
    }
    await supabase.from("transactions").insert({
      student_id: id, type, amount, category: type === "credit" ? "Top Up" : "Other",
      channel: "Wallet", note: note || "Admin adjustment",
    });
    await supabase.from("students").update({
      balance: Math.max(0, s.balance + (type === "credit" ? amount : -amount)),
      last_active: new Date().toISOString(),
    }).eq("id", id);
    log(`${type === "credit" ? "Credited" : "Debited"} ${formatNGN(amount)}`, s.name);
  };

  const setStatus: AdminCtx["setStatus"] = async (id, status) => {
    const s = students.find((x) => x.id === id);
    if (isDemo) {
      setStudents((prev) => prev.map((st) => st.id === id ? { ...st, status } : st));
      if (s) log(`Set status → ${status}`, s.name);
      return;
    }
    await supabase.from("students").update({ status }).eq("id", id);
    if (s) log(`Set status → ${status}`, s.name);
  };

  const removeStudent: AdminCtx["removeStudent"] = async (id) => {
    const s = students.find((x) => x.id === id);
    if (isDemo) {
      setStudents((prev) => prev.filter((st) => st.id !== id));
      if (s) log("Removed student", s.name);
      return;
    }
    await supabase.from("students").delete().eq("id", id);
    if (s) log("Removed student", s.name);
  };

  const freezeAllFlagged: AdminCtx["freezeAllFlagged"] = async () => {
    const targets = students.filter((s) => s.status === "flagged");
    if (!targets.length) return 0;
    if (isDemo) {
      setStudents((prev) => prev.map((st) => st.status === "flagged" ? { ...st, status: "frozen" } : st));
      log(`Froze ${targets.length} flagged wallets`);
      return targets.length;
    }
    await supabase.from("students").update({ status: "frozen" }).in("id", targets.map((t) => t.id));
    log(`Froze ${targets.length} flagged wallets`);
    return targets.length;
  };

  const resetPin: AdminCtx["resetPin"] = async (id) => {
    const s = students.find((x) => x.id === id);
    if (s) log("Reset wallet PIN", s.name);
  };

  const refundTx: AdminCtx["refundTx"] = async (txId) => {
    const t = txs.find((x) => x.id === txId);
    if (!t || t.refunded) return;
    const s = students.find((x) => x.id === t.studentId);
    if (!s) return;
    const delta = t.type === "debit" ? t.amount : -t.amount;
    if (isDemo) {
      setStudents((prev) => prev.map((st) => st.id === s.id ? { ...st, balance: Math.max(0, st.balance + delta), lastActive: Date.now() } : st));
      setRawTxs((prev) => prev.map((tx) => tx.id === txId ? { ...tx, refunded: true } : tx));
      demoTxId++;
      const refundId = `dtx${demoTxId}`;
      setRawTxs((prev) => [{ id: refundId, student_id: s.id, type: t.type === "debit" ? "credit" : "debit", amount: t.amount, category: "Refund", channel: "Wallet", created_at: new Date().toISOString(), flagged: false, flag_reason: null, note: `Refund of ${t.category} (${formatNGN(t.amount)})`, refunded: false }, ...prev]);
      log(`Refunded ${formatNGN(t.amount)}`, t.studentName);
      return;
    }
    await supabase.from("students").update({ balance: Math.max(0, s.balance + delta), last_active: new Date().toISOString() }).eq("id", s.id);
    await supabase.from("transactions").update({ refunded: true }).eq("id", txId);
    await supabase.from("transactions").insert({
      student_id: s.id, type: t.type === "debit" ? "credit" : "debit", amount: t.amount,
      category: "Refund", channel: "Wallet", note: `Refund of ${t.category} (${formatNGN(t.amount)})`,
    });
    log(`Refunded ${formatNGN(t.amount)}`, t.studentName);
  };

  const bulkCredit: AdminCtx["bulkCredit"] = async (rows) => {
    let ok = 0, fail = 0;
    for (const r of rows) {
      const s = students.find((x) => x.matric === r.matric);
      if (!s || !r.amount || r.amount <= 0) { fail++; continue; }
      if (isDemo) {
        demoTxId++;
        const txId = `dtx${demoTxId}`;
        setRawTxs((prev) => [{ id: txId, student_id: s.id, type: "credit", amount: r.amount, category: "Top Up", channel: "Wallet", created_at: new Date().toISOString(), flagged: false, flag_reason: null, note: r.note || "Bulk credit", refunded: false }, ...prev]);
        setStudents((prev) => prev.map((st) => st.id === s.id ? { ...st, balance: st.balance + r.amount, lastActive: Date.now() } : st));
        ok++;
        continue;
      }
      const { error: txErr } = await supabase.from("transactions").insert({
        student_id: s.id, type: "credit", amount: r.amount, category: "Top Up",
        channel: "Wallet", note: r.note || "Bulk credit",
      });
      if (txErr) { fail++; continue; }
      await supabase.from("students").update({
        balance: s.balance + r.amount, last_active: new Date().toISOString(),
      }).eq("id", s.id);
      ok++;
    }
    log(`Bulk credit: ${ok} ok, ${fail} failed`);
    return { ok, fail };
  };

  const broadcast: AdminCtx["broadcast"] = async (title, body, audience) => {
    const recipients = audience === "all" ? students.length : students.filter((s) => s.status === audience).length;
    if (isDemo) {
      const id = `a${Date.now()}`;
      setAnnouncements((prev) => [{ id, title, body, audience, ts: Date.now(), recipients }, ...prev].slice(0, 20));
      log(`Broadcast → ${audience} (${recipients})`, title);
      return recipients;
    }
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("announcements")
      .insert({ title, body, audience, recipients_count: recipients, created_by: userData.user?.id })
      .select().single();
    if (!error && data) {
      setAnnouncements((a) => [{ id: data.id, title, body, audience, ts: new Date(data.created_at).getTime(), recipients }, ...a].slice(0, 20));
    }
    log(`Broadcast → ${audience} (${recipients})`, title);
    return recipients;
  };

  const value = useMemo(
    () => ({
      students, txs, loading, toggleFreeze, resolveFlag, liveOn, setLiveOn,
      adjustBalance, setStatus, removeStudent, freezeAllFlagged, resetPin,
      refundTx, bulkCredit, announcements, broadcast, audit,
    }),
    [students, txs, loading, liveOn, announcements, audit],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
};

export const formatNGN = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const timeAgo = (ts: number) => {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};
