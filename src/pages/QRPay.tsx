import { useState } from "react";
import { AppLayout } from "@/components/lmu/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/store/auth";
import { useProfile } from "@/store/profile";
import { useWallet } from "@/store/wallet";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Scan } from "lucide-react";

export default function QRPayPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { balance, payProduct } = useWallet();
  const [requestAmt, setRequestAmt] = useState("");
  const [memo, setMemo] = useState("");
  const [scanInput, setScanInput] = useState("");

  const payload = JSON.stringify({
    type: "lmu-pay",
    to: user?.id || "demo",
    name: profile?.full_name || user?.email || "LMU Student",
    amount: parseFloat(requestAmt) || 0,
    memo: memo || undefined,
    ts: Date.now(),
  });

  const simulateScan = () => {
    try {
      const data = JSON.parse(scanInput);
      if (data.type !== "lmu-pay") return toast.error("Not an LMU Pay code");
      if (!data.amount || data.amount <= 0) return toast.error("No amount in code");
      if (balance < data.amount) return toast.error("Insufficient balance");
      const ok = payProduct(data.amount, `QR pay → ${data.name || "Unknown"}${data.memo ? ` (${data.memo})` : ""}`);
      if (ok) { toast.success(`Sent ₦${data.amount.toLocaleString()} to ${data.name}`); setScanInput(""); }
      else toast.error("Payment failed");
    } catch {
      toast.error("Invalid QR code data");
    }
  };

  return (
    <AppLayout title="QR Pay" eyebrow="Scan or generate">
      <Tabs defaultValue="receive" className="max-w-3xl">
        <TabsList className="grid grid-cols-2 w-full mb-4">
          <TabsTrigger value="receive"><QrCode className="h-4 w-4 mr-2" />Receive</TabsTrigger>
          <TabsTrigger value="pay"><Scan className="h-4 w-4 mr-2" />Pay</TabsTrigger>
        </TabsList>

        <TabsContent value="receive">
          <div className="rounded-[14px] bg-card border border-border p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Amount to request (₦) — optional</Label>
                <Input type="number" min="0" value={requestAmt} onChange={(e) => setRequestAmt(e.target.value)} placeholder="0.00" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Memo (optional)</Label>
                <Input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="Lunch · Cafeteria" className="mt-1" />
              </div>
              <p className="text-xs text-muted-foreground">Show this code to the payer. They can scan it from their LMU Wallet to pay you instantly.</p>
            </div>
            <div className="flex flex-col items-center justify-center bg-white rounded-[12px] p-6">
              <QRCodeSVG value={payload} size={200} level="M" includeMargin />
              <div className="mt-3 text-xs text-muted-foreground text-center">{profile?.full_name || user?.email}</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pay">
          <div className="rounded-[14px] bg-card border border-border p-6 space-y-4">
            <div className="text-sm text-muted-foreground">In a real app, your camera scans a QR. For this demo, paste the QR data below to simulate a scan.</div>
            <div>
              <Label className="text-xs">QR data</Label>
              <Input value={scanInput} onChange={(e) => setScanInput(e.target.value)} placeholder='{"type":"lmu-pay","amount":2500,...}' className="mt-1 font-mono text-xs" />
            </div>
            <Button onClick={simulateScan} className="w-full"><Scan className="h-4 w-4 mr-2" />Pay</Button>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
