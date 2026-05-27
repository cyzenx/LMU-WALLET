import { useEffect, useState } from "react";

export type Role = "student" | "admin";
const KEY = "lmu.role";

export const getRole = (): Role => {
  if (typeof window === "undefined") return "student";
  return (localStorage.getItem(KEY) as Role) || "student";
};

export const setRole = (role: Role) => {
  localStorage.setItem(KEY, role);
  window.dispatchEvent(new CustomEvent("lmu-role-change", { detail: role }));
};

export const clearRole = () => {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("lmu-role-change", { detail: "student" }));
};

export const useRole = (): Role => {
  const [role, setLocal] = useState<Role>(getRole);
  useEffect(() => {
    const handler = (e: Event) => setLocal((e as CustomEvent).detail as Role);
    const storage = () => setLocal(getRole());
    window.addEventListener("lmu-role-change", handler);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener("lmu-role-change", handler);
      window.removeEventListener("storage", storage);
    };
  }, []);
  return role;
};