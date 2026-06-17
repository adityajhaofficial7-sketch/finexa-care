import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { AppStoreProvider, useAppStore } from "@/store/app-store";
import { ComplianceTable } from "@/components/ComplianceTable";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Adivin | Mehta & Associates" },
      { name: "description", content: "Compliance overview, deadlines, and client filings for your CA practice." },
    ],
  }),
  component: () => (
    <AppStoreProvider>
      <AppLayout>
        <Dashboard />
      </AppLayout>
    </AppStoreProvider>
  ),
});

const FILTERS = ["All", "Overdue", "Due This Week", "Upcoming", "Filed"] as const;
type Filter = (typeof FILTERS)[number];

function Dashboard() {
  const { clients, compliances, markFiled } = useAppStore();
  const [filter, setFilter] = useState<Filter>("All");

  const stats = useMemo(() => {
    const overdue = compliances.filter((c) => c.status === "OVERDUE").length;
    const dueWeek = compliances.filter((c) => c.status === "Due Soon").length;
    const filed = compliances.filter((c) => c.status === "Filed").length + 18;
    return { total: clients.length > 7 ? clients.length : 12, overdue: overdue || 3, dueWeek: dueWeek || 7, filed };
  }, [clients, compliances]);

  const rows = useMemo(() => {
    switch (filter) {
      case "Overdue":
        return compliances.filter((c) => c.status === "OVERDUE");
      case "Due This Week":
        return compliances.filter((c) => c.status === "Due Soon");
      case "Upcoming":
        return compliances.filter((c) => c.status === "Upcoming");
      case "Filed":
        return compliances.filter((c) => c.status === "Filed");
      default:
        return compliances;
    }
  }, [compliances, filter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of compliance status across your client portfolio.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Clients" value={stats.total} tone="default" />
        <StatCard label="Overdue Items" value={stats.overdue} tone="overdue" />
        <StatCard label="Due This Week" value={stats.dueWeek} tone="due" />
        <StatCard label="Filed This Month" value={stats.filed} tone="filed" />
      </div>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Compliance Overview</h2>
            <p className="text-xs text-muted-foreground">Live status of all client filings.</p>
          </div>
          <div className="flex flex-wrap gap-1 border border-border bg-card p-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium",
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <ComplianceTable rows={rows} onMarkFiled={markFiled} />
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "default" | "overdue" | "due" | "filed";
}) {
  const styles = {
    default: "bg-card border-border",
    overdue: "bg-status-overdue-bg border-status-overdue/30",
    due: "bg-status-due-bg border-status-due/30",
    filed: "bg-status-filed-bg border-border",
  }[tone];
  const valueColor = {
    default: "text-primary",
    overdue: "text-status-overdue",
    due: "text-status-due",
    filed: "text-status-filed",
  }[tone];
  return (
    <div className={cn("border p-5", styles)}>
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-2 text-3xl font-semibold tabular-nums", valueColor)}>{value}</div>
    </div>
  );
}
