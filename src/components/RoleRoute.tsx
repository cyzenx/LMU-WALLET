import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useRole } from "@/store/role";

export const RoleRoute = ({ allow, children }: { allow: "student" | "admin"; children: ReactNode }) => {
  const role = useRole();
  if (role !== allow) {
    return <Navigate to={role === "admin" ? "/admin" : "/"} replace />;
  }
  return <>{children}</>;
};