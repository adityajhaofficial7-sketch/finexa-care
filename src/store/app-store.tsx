import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Client, ComplianceRow, ComplianceStatus } from "@/data/clients";

interface AppStore {
  clients: Client[];
  compliances: ComplianceRow[];
  loading: boolean;
  addClient: (c: Omit<Client, "id" | "status">) => Promise<void>;
  markFiled: (id: string) => Promise<void>;
  addCompliance: (input: {
    client_id: string;
    title: string;
    compliance_type: string;
    due_date: string; // YYYY-MM-DD
  }) => Promise<void>;
}

const Ctx = createContext<AppStore | null>(null);

function formatDisplayDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function daysBetween(iso: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(iso + "T00:00:00");
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

function uiStatus(dbStatus: string, daysLeft: number): ComplianceStatus {
  if (dbStatus === "filed") return "Filed";
  if (daysLeft < 0) return "OVERDUE";
  if (daysLeft <= 7) return "Due Soon";
  return "Upcoming";
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();

  const clientsQ = useQuery({
    queryKey: ["clients"],
    queryFn: async (): Promise<Client[]> => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        gstin: r.gstin ?? "",
        phone: r.phone ?? "",
        email: r.email ?? "",
        businessType: (r.business_type ?? "Proprietorship") as Client["businessType"],
        compliances: r.compliances ?? [],
        status: (r.status ?? "Active") as Client["status"],
      }));
    },
  });

  const compliancesQ = useQuery({
    queryKey: ["compliances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compliances")
        .select("id, client_id, title, compliance_type, due_date, status, clients(name, gstin)")
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const compliances: ComplianceRow[] = useMemo(() => {
    const rows = compliancesQ.data ?? [];
    return rows.map((r: any) => {
      const daysLeft = daysBetween(r.due_date);
      return {
        id: r.id,
        clientName: r.clients?.name ?? "—",
        gstin: r.clients?.gstin ?? "",
        complianceType: r.compliance_type,
        dueDate: formatDisplayDate(r.due_date),
        dueDateISO: r.due_date,
        daysLeft,
        status: uiStatus(r.status, daysLeft),
      };
    });
  }, [compliancesQ.data]);

  const addClientMut = useMutation({
    mutationFn: async (c: Omit<Client, "id" | "status">) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error } = await supabase.from("clients").insert({
        user_id: u.user.id,
        name: c.name,
        gstin: c.gstin,
        phone: c.phone,
        email: c.email,
        business_type: c.businessType,
        compliances: c.compliances,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });

  const markFiledMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("compliances").update({ status: "filed" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["compliances"] }),
  });

  const addComplianceMut = useMutation({
    mutationFn: async (input: { client_id: string; title: string; compliance_type: string; due_date: string }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error } = await supabase.from("compliances").insert({
        user_id: u.user.id,
        ...input,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["compliances"] }),
  });

  const value: AppStore = {
    clients: clientsQ.data ?? [],
    compliances,
    loading: clientsQ.isLoading || compliancesQ.isLoading,
    addClient: (c) => addClientMut.mutateAsync(c),
    markFiled: (id) => markFiledMut.mutateAsync(id),
    addCompliance: (input) => addComplianceMut.mutateAsync(input),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
