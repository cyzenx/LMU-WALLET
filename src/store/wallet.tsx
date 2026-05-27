import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type Tx = {
  id: string;
  type: "debit" | "credit";
  title: string;
  meta: string;
  amount: number;
  time: string;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

interface WalletContextValue {
  balance: number;
  ledger: number;
  transactions: Tx[];
  notifications: Notification[];
  unreadCount: number;
  topUp: (amount: number, source: string) => void;
  send: (amount: number, to: string, bank: string) => boolean;
  request: (amount: number, from: string) => void;
  payProduct: (amount: number, product: string) => boolean;
  markAllRead: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const initialTxs: Tx[] = [
  { id: "t1", type: "debit", title: "Pay for Product", meta: "LMU Bookshop · CSC301 Textbook", amount: 8500, time: "Today, 10:42" },
  { id: "t2", type: "credit", title: "Virtual Account Deposit", meta: "Wema Bank · 8829104573", amount: 25000, time: "Today, 09:15" },
  { id: "t3", type: "debit", title: "Pay for Product", meta: "Cafeteria · Lunch combo", amount: 2150, time: "Yesterday, 13:08" },
  { id: "t4", type: "credit", title: "Virtual Account Deposit", meta: "Sterling Bank · 0271459836", amount: 50000, time: "Yesterday, 11:30" },
  { id: "t5", type: "debit", title: "Pay for Product", meta: "Hostel Laundry · Weekly plan", amount: 3000, time: "23 Apr, 17:45" },
  { id: "t6", type: "credit", title: "Virtual Account Deposit", meta: "Wema Bank · 8829104573", amount: 15000, time: "22 Apr, 08:20" },
  { id: "t7", type: "debit", title: "Pay for Product", meta: "Print Centre · Project binding", amount: 1200, time: "21 Apr, 15:02" },
];

const initialNotifs: Notification[] = [
  { id: "n1", title: "Deposit received", body: "₦25,000 from Wema Bank · 8829104573", time: "9:15 AM", read: false },
  { id: "n2", title: "Wallet limit reminder", body: "You've used 8% of your monthly cap.", time: "Yesterday", read: false },
  { id: "n3", title: "New invoice", body: "Hostel fee invoice ₦45,000 is due Friday.", time: "2 days ago", read: false },
];

const nowLabel = () => {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = ((h + 11) % 12) + 1;
  return `Today, ${hh}:${m} ${ampm}`;
};

const timeOnly = () => {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${m} ${ampm}`;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [balance, setBalance] = useState(248650.4);
  const [ledger, setLedger] = useState(251000);
  const [transactions, setTransactions] = useState<Tx[]>(initialTxs);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifs);

  const pushTx = (tx: Tx) => setTransactions((prev) => [tx, ...prev]);
  const pushNotif = (n: Omit<Notification, "id" | "read" | "time">) =>
    setNotifications((prev) => [{ id: uid(), read: false, time: timeOnly(), ...n }, ...prev]);

  const topUp = useCallback((amount: number, source: string) => {
    setBalance((b) => b + amount);
    setLedger((l) => l + amount);
    pushTx({
      id: uid(),
      type: "credit",
      title: "Wallet Top Up",
      meta: source,
      amount,
      time: nowLabel(),
    });
    pushNotif({
      title: "Top up successful",
      body: `₦${amount.toLocaleString()} added via ${source}.`,
    });
  }, []);

  const send = useCallback((amount: number, to: string, bank: string) => {
    let ok = true;
    setBalance((b) => {
      if (b < amount) {
        ok = false;
        return b;
      }
      return b - amount;
    });
    if (!ok) return false;
    setLedger((l) => l - amount);
    pushTx({
      id: uid(),
      type: "debit",
      title: "Transfer Out",
      meta: `${bank} · ${to}`,
      amount,
      time: nowLabel(),
    });
    pushNotif({
      title: "Transfer sent",
      body: `₦${amount.toLocaleString()} sent to ${to} (${bank}).`,
    });
    return true;
  }, []);

  const request = useCallback((amount: number, from: string) => {
    pushNotif({
      title: "Payment request sent",
      body: `Requested ₦${amount.toLocaleString()} from ${from}.`,
    });
  }, []);

  const payProduct = useCallback((amount: number, product: string) => {
    let ok = true;
    setBalance((b) => {
      if (b < amount) {
        ok = false;
        return b;
      }
      return b - amount;
    });
    if (!ok) return false;
    setLedger((l) => l - amount);
    pushTx({
      id: uid(),
      type: "debit",
      title: "Pay for Product",
      meta: product,
      amount,
      time: nowLabel(),
    });
    pushNotif({
      title: "Payment successful",
      body: `Paid ₦${amount.toLocaleString()} for ${product}.`,
    });
    return true;
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <WalletContext.Provider
      value={{ balance, ledger, transactions, notifications, unreadCount, topUp, send, request, payProduct, markAllRead }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
};

export const formatNaira = (n: number) => {
  const [whole, dec = "00"] = n.toFixed(2).split(".");
  return { whole: Number(whole).toLocaleString(), dec };
};