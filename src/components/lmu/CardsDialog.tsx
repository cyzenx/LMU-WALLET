import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wifi, Lock, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CardsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialCards = [
  {
    id: "1",
    type: "Virtual",
    last4: "4421",
    expiry: "08/27",
    holder: "Adaeze Okafor",
    frozen: false,
  },
  {
    id: "2",
    type: "Physical",
    last4: "9087",
    expiry: "11/26",
    holder: "Adaeze Okafor",
    frozen: false,
  },
];

export const CardsDialog = ({ open, onOpenChange }: CardsDialogProps) => {
  const [cards, setCards] = useState(initialCards);

  const toggleFreeze = (id: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, frozen: !c.frozen } : c))
    );
    const card = cards.find((c) => c.id === id);
    toast.success(card?.frozen ? "Card unfrozen" : "Card frozen");
  };

  const requestCard = () => {
    toast.success("New virtual card requested");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-[14px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Your Cards</DialogTitle>
          <DialogDescription>Manage your virtual and physical cards.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`relative rounded-[14px] p-5 text-forest-foreground bg-gradient-balance overflow-hidden transition-opacity ${
                card.frozen ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="label-caps text-forest-foreground/60">{card.type} Card</span>
                <Wifi className="h-4 w-4 text-forest-foreground/60 rotate-90" />
              </div>
              <div className="mt-6 num text-lg tracking-[0.2em] font-semibold">
                •••• •••• •••• {card.last4}
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-[10px] text-forest-foreground/50 uppercase">Holder</div>
                  <div className="text-sm font-medium">{card.holder}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-forest-foreground/50 uppercase">Expires</div>
                  <div className="num text-sm font-medium">{card.expiry}</div>
                </div>
              </div>
              <button
                onClick={() => toggleFreeze(card.id)}
                className="absolute top-4 right-12 flex items-center gap-1 text-[10px] font-medium bg-white/10 hover:bg-white/20 backdrop-blur rounded-full px-2 py-1"
              >
                <Lock className="h-3 w-3" />
                {card.frozen ? "Unfreeze" : "Freeze"}
              </button>
            </div>
          ))}

          <button
            onClick={requestCard}
            className="w-full rounded-[14px] border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 p-4 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="h-4 w-4" /> Request new card
          </button>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="rounded-[10px]">Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};