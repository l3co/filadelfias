import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

const ADMIN_OFFICES = ["pastor", "presbitero", "diacono"];

export function AdminRoute() {
  const user = useAuthStore((state) => state.user);
  const churchId = useAuthStore((state) => state.currentChurchId);

  const church = user?.churches.find((item) => item.id === churchId);
  const office = church?.office?.toLowerCase() || "";
  const role = church?.role?.toLowerCase() || "";
  const hasAdminAccess = ADMIN_OFFICES.includes(office) || role === "admin";

  if (!hasAdminAccess) {
    return <Navigate to="/member" replace />;
  }

  return <Outlet />;
}
