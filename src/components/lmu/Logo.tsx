import { cn } from "@/lib/utils";

export const StackedLayersIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={cn("h-7 w-7", className)} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M16 3L29 9.5L16 16L3 9.5L16 3Z" fill="currentColor" />
    <path d="M3 16L16 22.5L29 16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" opacity="0.7" />
    <path d="M3 22.5L16 29L29 22.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" opacity="0.4" />
  </svg>
);

export const Logo = ({ collapsed = false }: { collapsed?: boolean }) => (
  <div className="flex items-center gap-3">
    <span className="text-primary"><StackedLayersIcon /></span>
    {!collapsed && (
      <div className="leading-tight">
        <div className="font-display text-[17px] font-bold text-forest-foreground">LMU Wallet</div>
        <div className="label-caps text-forest-muted text-[9px]">Campus Payments</div>
      </div>
    )}
  </div>
);