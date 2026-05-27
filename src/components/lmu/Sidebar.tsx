import { LayoutDashboard, ArrowLeftRight, Wallet, Receipt, Users, Settings, LifeBuoy, LogOut, ShieldCheck, UserCircle, GraduationCap, CreditCard, Target, QrCode, FileText, Bell, Sparkles } from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { useProfile } from "@/store/profile";
import { toast } from "sonner";
import { useRole, clearRole } from "@/store/role";

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/" },
  { label: "Transactions", icon: ArrowLeftRight, to: "/transactions" },
  { label: "Wallet", icon: Wallet, to: "/wallet" },
  { label: "Cards", icon: CreditCard, to: "/cards" },
  { label: "Tuition", icon: GraduationCap, to: "/tuition" },
  { label: "Savings", icon: Target, to: "/savings" },
  { label: "QR Pay", icon: QrCode, to: "/qr-pay" },
  { label: "Invoices", icon: Receipt, to: "/invoices" },
  { label: "Beneficiaries", icon: Users, to: "/beneficiaries" },
  { label: "Statements", icon: FileText, to: "/statements" },
  { label: "Notifications", icon: Bell, to: "/notifications" },
];

const footer = [
  { label: "Profile", icon: UserCircle, to: "/profile" },
  { label: "Settings", icon: Settings, to: "/settings" },
  { label: "Support", icon: LifeBuoy, to: "/support" },
];

const adminNav = [
  { label: "Admin Console", icon: ShieldCheck, to: "/admin" },
];

export const Sidebar = () => {
  const { user, signOut, isDemo } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const role = useRole();
  const isAdmin = role === "admin";
  const fullName = profile?.full_name || (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0] || "Account";
  const initials = fullName
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    clearRole();
    toast.success("Signed out");
    navigate("/login", { replace: true });
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-forest text-forest-foreground p-6">
      <Logo />

      <nav className="mt-10 flex flex-col gap-1">
        <div className="label-caps text-forest-muted px-3 mb-3">{isAdmin ? "Admin" : "Main"}</div>
        {(isAdmin ? adminNav : nav).map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            end={to === "/" || to === "/admin"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm transition-colors",
                isActive
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-forest-foreground/70 hover:text-forest-foreground hover:bg-white/5"
              )
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1">
        <div className="label-caps text-forest-muted px-3 mb-3">Account</div>
        {footer.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm transition-colors",
                isActive
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-forest-foreground/70 hover:text-forest-foreground hover:bg-white/5"
              )
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}

          <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3 px-2">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center font-display text-primary text-sm">{initials || "?"}</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <div className="text-sm font-medium truncate">{fullName}</div>
                {isDemo && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[9px] font-bold uppercase tracking-wider">
                    <Sparkles className="h-2.5 w-2.5" />
                    Demo
                  </span>
                )}
              </div>
              <div className="text-[11px] text-forest-muted truncate">{user?.email ?? "—"}</div>
            </div>
            <button onClick={handleSignOut} className="text-forest-muted hover:text-forest-foreground" aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
      </div>
    </aside>
  );
};