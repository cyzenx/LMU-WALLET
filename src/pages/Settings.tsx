import { AppLayout } from "@/components/lmu/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/store/auth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { Bell, Shield, User, CreditCard, LogOut, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState((user?.user_metadata?.full_name as string) || "");
  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);
  const [twoFa, setTwoFa] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/login", { replace: true });
  };

  return (
    <AppLayout title="Settings" eyebrow="Account">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar nav */}
        <div className="lg:col-span-1">
          <div className="rounded-[14px] bg-card border border-border p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center font-display text-primary font-bold">
                {(name || user?.email || "?").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-foreground truncate">{name || "Account"}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
              </div>
            </div>
            <Separator className="my-5" />
            <nav className="flex flex-col gap-1 text-sm">
              {[
                { label: "Profile", icon: User },
                { label: "Notifications", icon: Bell },
                { label: "Security", icon: Shield },
                { label: "Payment Methods", icon: CreditCard },
              ].map(({ label, icon: Icon }) => (
                <a key={label} href={`#${label.toLowerCase().replace(" ", "-")}`} className="flex items-center gap-3 px-3 py-2 rounded-[10px] text-muted-foreground hover:text-foreground hover:bg-muted">
                  <Icon className="h-4 w-4" /> {label}
                </a>
              ))}
            </nav>
            <Separator className="my-5" />
            <Button variant="outline" onClick={handleLogout} className="w-full rounded-[10px] gap-2">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>

        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <section id="profile" className="rounded-[14px] bg-card border border-border p-6">
            <h3 className="font-display text-lg font-semibold text-foreground">Profile</h3>
            <p className="text-xs text-muted-foreground mt-1">Update your personal information.</p>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="label-caps text-muted-foreground">Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 rounded-[10px]" />
              </div>
              <div>
                <Label className="label-caps text-muted-foreground">Email</Label>
                <Input value={user?.email ?? ""} disabled className="mt-2 rounded-[10px]" />
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <Button onClick={() => toast.success("Profile saved")} className="rounded-[10px]">Save changes</Button>
            </div>
          </section>

          <section id="notifications" className="rounded-[14px] bg-card border border-border p-6">
            <h3 className="font-display text-lg font-semibold text-foreground">Notifications</h3>
            <p className="text-xs text-muted-foreground mt-1">Choose how you'd like to be notified.</p>
            <div className="mt-5 divide-y divide-border">
              {[
                { label: "Push notifications", desc: "Wallet activity and reminders.", value: notifPush, onChange: setNotifPush },
                { label: "Email notifications", desc: "Receipts, statements and security alerts.", value: notifEmail, onChange: setNotifEmail },
                { label: "Product updates", desc: "Occasional emails about new features.", value: notifMarketing, onChange: setNotifMarketing },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-4">
                  <div>
                    <div className="text-sm font-medium text-foreground">{row.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{row.desc}</div>
                  </div>
                  <Switch checked={row.value} onCheckedChange={row.onChange} />
                </div>
              ))}
            </div>
          </section>

          <section id="security" className="rounded-[14px] bg-card border border-border p-6">
            <div className="mb-6">
              <h3 className="font-display text-lg font-semibold text-foreground">Appearance</h3>
              <p className="text-xs text-muted-foreground mt-1">Choose your preferred theme.</p>
              <div className="mt-4 flex gap-3">
                {([
                  { value: "light" as const, label: "Light", icon: Sun },
                  { value: "dark" as const, label: "Dark", icon: Moon },
                  { value: "system" as const, label: "System", icon: Monitor },
                ]).map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-[10px] border text-sm font-medium transition-colors ${
                      theme === value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <Separator className="my-5" />
            <h3 className="font-display text-lg font-semibold text-foreground">Security</h3>
            <p className="text-xs text-muted-foreground mt-1">Protect your account.</p>
            <div className="mt-5 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">Two-factor authentication</div>
                <div className="text-xs text-muted-foreground mt-0.5">Require a code on every sign-in.</div>
              </div>
              <Switch checked={twoFa} onCheckedChange={(v) => { setTwoFa(v); toast.success(v ? "2FA enabled" : "2FA disabled"); }} />
            </div>
            <Separator className="my-5" />
            <Button variant="outline" onClick={() => toast.success("Password reset link sent")} className="rounded-[10px]">
              Change password
            </Button>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}