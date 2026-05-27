import { AppLayout } from "@/components/lmu/AppLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Megaphone } from "lucide-react";
import { EmptyState } from "@/components/lmu/EmptyState";
import { CardSkeleton } from "@/components/lmu/LoadingSkeleton";
import { formatDistanceToNow } from "date-fns";

interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: string;
  created_at: string;
}

export default function NotificationsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("announcements")
        .select("id, title, body, audience, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) setAnnouncements(data);
      setLoading(false);
    })();
  }, []);

  return (
    <AppLayout title="Notifications" eyebrow="Updates">
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-6 w-6" />}
          title="No notifications yet"
          description="Announcements from the admin will appear here."
        />
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="rounded-[14px] bg-card border border-border p-5">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Megaphone className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold text-foreground">{a.title}</div>
                  <p className="text-sm text-muted-foreground mt-1">{a.body}</p>
                  <div className="text-[11px] text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}