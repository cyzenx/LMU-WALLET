import { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/lmu/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";
import { Loader2, GraduationCap, ShieldCheck } from "lucide-react";
import { setRole, type Role } from "@/store/role";
import { cn } from "@/lib/utils";
import loginHero from "@/assets/login-hero.jpg";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [role, setRoleTab] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { signIn, signUp, user, demoSignIn, isDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromState = (location.state as { from?: { pathname?: string } })?.from?.pathname;
  const destination = fromState || (role === "admin" ? "/admin" : "/");

  useEffect(() => {
    if (user) navigate(fromState || (role === "admin" ? "/admin" : "/"), { replace: true });
  }, [user, navigate, fromState, role]);

  const handleDemoLogin = (demoRole: "admin" | "student") => {
    setRole(demoRole);
    setRoleTab(demoRole);
    demoSignIn(demoRole);
    toast.success(`Logged in as Demo ${demoRole === "admin" ? "Admin" : "Student"}`);
    navigate(demoRole === "admin" ? "/admin" : "/", { replace: true });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setRole(role);
    if (mode === "signin") {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error);
      } else {
        toast.success(role === "admin" ? "Welcome, Admin" : "Welcome back");
        navigate(destination, { replace: true });
      }
    } else {
      if (!fullName.trim()) {
        toast.error("Enter your full name");
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Account created");
        navigate(destination, { replace: true });
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex relative overflow-hidden flex-col justify-between w-[44%] bg-forest text-forest-foreground p-10">
        <img
          src={loginHero}
          alt="LMU student using the wallet app on campus"
          width={896}
          height={1408}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest/70 via-forest/50 to-forest/95" />
        <div className="relative z-10"><Logo /></div>
        <div className="relative z-10">
          <h2 className="font-display text-4xl font-bold leading-tight tracking-tight">
            Your campus wallet,<br />all in one place.
          </h2>
          <p className="mt-4 text-forest-foreground/70 max-w-sm text-sm">
            Pay fees, top up, send and receive — built for LMU students and staff.
          </p>
          <div className="mt-10 flex gap-6 text-xs text-forest-foreground/50">
            <span>Instant transfers</span>
            <span>·</span>
            <span>Virtual accounts</span>
            <span>·</span>
            <span>AI support</span>
          </div>
        </div>
        <div className="relative z-10 text-[11px] text-forest-foreground/60">© LMU Wallet</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden mb-8"><Logo /></div>
          <div className="label-caps text-muted-foreground mb-1">{mode === "signin" ? "Sign in" : "Create account"}</div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            {mode === "signin" ? "Welcome back" : "Get started"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {role === "admin"
              ? "Sign in to the LMU Wallet admin console."
              : mode === "signin"
              ? "Sign in to your LMU Wallet account."
              : "Create your LMU Wallet account."}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2 p-1 bg-muted rounded-[12px]">
            {([
              { id: "student", label: "Student", icon: GraduationCap },
              { id: "admin", label: "Admin", icon: ShieldCheck },
            ] as const).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setRoleTab(t.id)}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-sm font-medium transition-colors",
                  role === t.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {mode === "signup" && role === "student" && (
              <div>
                <Label htmlFor="name" className="label-caps text-muted-foreground">Full Name</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Adaeze Okafor" className="mt-2 rounded-[10px]" required />
              </div>
            )}
            <div>
              <Label htmlFor="email" className="label-caps text-muted-foreground">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={role === "admin" ? "admin@lmu.edu.ng" : "you@lmu.edu.ng"} className="mt-2 rounded-[10px]" required />
            </div>
            <div>
              <Label htmlFor="password" className="label-caps text-muted-foreground">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-2 rounded-[10px]" required minLength={6} />
            </div>

            <Button type="submit" disabled={submitting} className="w-full rounded-[10px] h-11">
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {mode === "signin" ? `Sign In as ${role === "admin" ? "Admin" : "Student"}` : "Create Account"}
            </Button>
          </form>

          {role === "student" && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="text-primary font-medium hover:underline"
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </div>
          )}
          {role === "admin" && (
            <div className="mt-6 text-center text-xs text-muted-foreground">
              Admin access is restricted. Contact IT to request credentials.
            </div>
          )}

          {/* Demo Login Section */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Quick Demo
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <p className="text-xs text-muted-foreground text-center mb-4">
              Skip sign-up and instantly preview the app with sample data.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin("student")}
                className="flex flex-col items-center gap-2 p-4 rounded-[12px] border border-border bg-card hover:bg-accent hover:border-primary/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-foreground">Student</div>
                  <div className="text-[11px] text-muted-foreground">Full wallet access</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("admin")}
                className="flex flex-col items-center gap-2 p-4 rounded-[12px] border border-border bg-card hover:bg-accent hover:border-primary/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-foreground">Admin</div>
                  <div className="text-[11px] text-muted-foreground">Console access</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}