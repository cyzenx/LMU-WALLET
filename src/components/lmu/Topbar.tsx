import { Bell, Search, Check, Sun, Moon, Sparkles } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useWallet } from "@/store/wallet";
import { MobileSidebar } from "./MobileSidebar";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/store/auth";

interface TopbarProps {
  title?: string;
  eyebrow?: string;
}

export const Topbar = ({ title = "Welcome back, Adaeze", eyebrow = "Overview" }: TopbarProps) => {
  const { notifications, unreadCount, markAllRead } = useWallet();
  const { resolved, setTheme } = useTheme();
  const { isDemo } = useAuth();
  return (
  <header className="flex items-center justify-between gap-4 mb-8">
    <div>
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <div>
      <div className="label-caps text-muted-foreground mb-1">{eyebrow}</div>
      <h1 className="font-display text-[26px] font-bold text-foreground tracking-tight">
        {title}
      </h1>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="hidden md:flex items-center gap-2 bg-card border border-border rounded-[12px] px-3.5 py-2.5 w-72">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search transactions, products…"
          className="bg-transparent text-sm flex-1 outline-none placeholder:text-muted-foreground"
        />
      </div>
      {isDemo && (
        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-400/10 text-amber-500 border border-amber-400/20 text-[10px] font-bold uppercase tracking-wider">
          <Sparkles className="h-3 w-3" />
          Demo Mode
        </span>
      )}
      <button
        onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
        className="h-11 w-11 rounded-[12px] bg-card border border-border flex items-center justify-center text-foreground hover:border-primary/40 transition-colors"
        aria-label="Toggle theme"
      >
        {resolved === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <Popover>
        <PopoverTrigger asChild>
          <button className="relative h-11 w-11 rounded-[12px] bg-card border border-border flex items-center justify-center text-foreground hover:border-primary/40 transition-colors" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center num">
                {unreadCount}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[340px] p-0 rounded-[14px]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <div className="font-display text-sm font-semibold text-foreground">Notifications</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{unreadCount} unread</div>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
                <Check className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">No notifications yet.</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`px-4 py-3 border-b border-border last:border-0 ${!n.read ? "bg-primary/5" : ""}`}>
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{n.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{n.time}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  </header>
  );
};