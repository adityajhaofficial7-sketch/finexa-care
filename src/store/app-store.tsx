import { createContext, useContext, useState, type ReactNode } from "react";
import {
  initialClients,
  initialCompliances,
  type Client,
  type ComplianceRow,
} from "@/data/clients";

interface AppStore {
  clients: Client[];
  compliances: ComplianceRow[];
  addClient: (c: Omit<Client, "id" | "status">) => void;
  markFiled: (id: string) => void;
}

const Ctx = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [compliances, setCompliances] = useState<ComplianceRow[]>(initialCompliances);

  const addClient: AppStore["addClient"] = (c) => {
    setClients((prev) => [
      ...prev,
      { ...c, id: String(Date.now()), status: "Active" },
    ]);
  };

  const markFiled = (id: string) => {
    setCompliances((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Filed" } : r)),
    );
  };

  return (
    <Ctx.Provider value={{ clients, compliances, addClient, markFiled }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
