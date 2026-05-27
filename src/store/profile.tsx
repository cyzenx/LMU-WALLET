import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
}

interface ProfileCtx {
  profile: Profile | null;
  loading: boolean;
  refresh: () => Promise<void>;
  update: (patch: Partial<Pick<Profile, "full_name" | "phone" | "avatar_url">>) => Promise<{ error: string | null }>;
  uploadAvatar: (file: File) => Promise<{ url: string | null; error: string | null }>;
}

const ProfileContext = createContext<ProfileCtx | null>(null);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user, isDemo } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setProfile(null); setLoading(false); return; }
    if (isDemo) {
      setProfile({
        id: user.id,
        user_id: user.id,
        full_name: (user.user_metadata?.full_name as string) || (user.email === "admin@lmu.edu.ng" ? "Demo Admin" : "Demo Student"),
        avatar_url: null,
        phone: null,
      });
      setLoading(false);
      return;
    }
    const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
    setProfile(data as Profile | null);
    setLoading(false);
  }, [user, isDemo]);

  useEffect(() => { refresh(); }, [refresh]);

  const update: ProfileCtx["update"] = async (patch) => {
    if (!user) return { error: "Not signed in" };
    if (isDemo) {
      setProfile((prev) => prev ? { ...prev, ...patch } : prev);
      return { error: null };
    }
    const { error } = await supabase.from("profiles").update(patch).eq("user_id", user.id);
    if (!error) await refresh();
    return { error: error?.message ?? null };
  };

  const uploadAvatar: ProfileCtx["uploadAvatar"] = async (file) => {
    if (!user) return { url: null, error: "Not signed in" };
    if (isDemo) return { url: null, error: "Avatar upload not available in demo mode" };
    const ext = file.name.split(".").pop() || "png";
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) return { url: null, error: upErr.message };
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${data.publicUrl}?v=${Date.now()}`;
    await update({ avatar_url: url });
    return { url, error: null };
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, refresh, update, uploadAvatar }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
};
