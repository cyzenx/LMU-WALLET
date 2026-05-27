import { useRef, useState } from "react";
import { AppLayout } from "@/components/lmu/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/store/profile";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, update, uploadAvatar, loading } = useProfile();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Sync local state when profile loads
  useState(() => {
    if (profile) {
      setName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
  });

  // Re-sync when profile changes
  if (profile && !name && profile.full_name) setName(profile.full_name);
  if (profile && !phone && profile.phone) setPhone(profile.phone);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) return toast.error("Image must be under 2MB");
    setUploading(true);
    const { error } = await uploadAvatar(f);
    setUploading(false);
    if (error) toast.error(error);
    else toast.success("Avatar updated");
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await update({ full_name: name.trim() || null, phone: phone.trim() || null });
    setSaving(false);
    if (error) toast.error(error);
    else toast.success("Profile saved");
  };

  const initials = (profile?.full_name || user?.email || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <AppLayout title="Profile" eyebrow="Account">
      <div className="max-w-2xl">
        <div className="rounded-[14px] bg-card border border-border p-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-primary/15 text-primary flex items-center justify-center font-display text-2xl font-bold">
                  {initials}
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50"
                aria-label="Change avatar"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-xl font-semibold truncate">{profile?.full_name || "Add your name"}</div>
              <div className="text-sm text-muted-foreground truncate">{user?.email}</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="label-caps text-muted-foreground">Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Adaeze Okafor" className="mt-2 rounded-[10px]" />
            </div>
            <div>
              <Label className="label-caps text-muted-foreground">Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" className="mt-2 rounded-[10px]" />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={saving || loading} className="rounded-[10px]">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save changes
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
