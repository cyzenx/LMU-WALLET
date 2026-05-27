import { useState } from "react";
import { Menu, LayoutDashboard, ArrowLeftRight, Wallet, Receipt, Users, Settings, LifeBuoy, LogOut, ShieldCheck, UserCircle, GraduationCap, CreditCard, Target, QrCode, FileText, Bell, Sparkles } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { useAuth } from "@/store/auth";
import { useRole, clearRole } from "@/store/role";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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

export const MobileSidebar = () => {
  const [open, setOpen] = useState(false);
  const { signOut, isDemo } = useAuth();
  const navigate = useNavigate();
  const role = useRole();
  const isAdmin = role === "admin";

  const handleSignOut = async () => {
    await signOut();
    clearRole();
    toast.success("Signed out");
    navigate("/login", { replace: true });
    setOpen(false);
  };

  const links = isAdmin ? adminNav : nav;

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="h-10 w-10 rounded-[10px] bg-card border border-border flex items-center justify-center" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] bg-forest text-forest-foreground p-6 border-none">
          <div className="flex items-center gap-2">
            <Logo />
            {isDemo && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[9px] font-bold uppercase tracking-wider">
                <Sparkles className="h-2.5 w-2.5" />
                Demo
              </span>
            )}
          </div>
          <nav className="mt-8 flex flex-col gap-1">
            {links.map(({ label, icon: Icon, to }) => (
              <NavLink
                key={label}
                to={to}
                end={to === "/" || to === "/admin"}
                onClick={() => setOpen(false)}
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
          <div className="mt-auto pt-6 flex flex-col gap-1">
            <div className="label-caps text-forest-muted px-3 mb-2">Account</div>
            {footer.map(({ label, icon: Icon, to }) => (
              <NavLink
                key={label}
                to={to}
                onClick={() => setOpen(false)}
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
            <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm text-forest-foreground/70 hover:text-forest-foreground hover:bg-white/5 mt-2">
              <LogOut className="h-[18px] w-[18px]" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
