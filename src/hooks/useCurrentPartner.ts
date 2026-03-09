import { useState, useCallback } from "react";
import { partnerStore, Partner, PartnerPermissions, DEFAULT_FULL_PERMISSIONS } from "@/lib/partnerStore";

// Simulates the currently logged-in admin/partner user.
// Replace with real auth (Supabase session) when migrating to Lovable Cloud.
const CURRENT_USER_EMAIL = "carlos@email.com";

export function useCurrentPartner() {
  const [partner, setPartner] = useState<Partner | null>(() => {
    const all = partnerStore.getPartners();
    return all.find((p) => p.email === CURRENT_USER_EMAIL) || null;
  });

  const refresh = useCallback(() => {
    const all = partnerStore.getPartners();
    setPartner(all.find((p) => p.email === CURRENT_USER_EMAIL) || null);
  }, []);

  const permissions: PartnerPermissions = partner?.permissions ?? DEFAULT_FULL_PERMISSIONS;
  const isAdmin = partner?.role === "admin";

  const hasPermission = (key: keyof PartnerPermissions) => isAdmin || permissions[key];

  return { partner, permissions, isAdmin, hasPermission, refresh };
}
