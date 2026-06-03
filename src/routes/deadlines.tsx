import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { AppStoreProvider, useAppStore } from "@/store/app-store";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComplianceRow, ComplianceStatus } from "@/data/clients";

export const Route = createFileRoute("/deadlines")({
  head: () => ({
    meta: [
      { title: "Deadlines — Finexa" },
      { name: "description", content: "Calendar of upcoming GST, TDS, ITR, and ROC deadlines." },
    ],
  }),
  component: () => (
    <AppStoreProvider>
      <AppLayout>
        <DeadlinesPage />
      </AppLayout>
    </AppStoreProvider>
  ),
});

const DOT_COLOR: Record<ComplianceStatus, string> = {
  OVERDUE: "bg-status-overdue",
  "Due Soon": "bg-status-due",
  Upcoming: "bg-accent",
  Filed: "bg-muted-foreground",
};

function DeadlinesPage() {
  const { compliances } = useAppStore();
  const [cursor, setCursor] = useState(() => new Date(2026, 5, 1)); // June 2026

  const monthLabel = cursor.toLocaleString("en-IN", { month: "long", year: "numeric" });
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const byDate = useMemo(() => {
    const map = new Map<string, ComplianceRow[]>();
    for (const c of compliances) {
      const arr = map.get(c.dueDateISO) ?? [];
      arr.push(c);
      map.set(c.dueDateISO, arr);
    }
    return map;
  }, [compliances]);

  const days = useMemo(() => {
    const first = new Date(year, month, 1);
    const startDay = first.getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: number; iso: string } | null> = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= lastDate; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ date: d, iso });
    }
    return cells;
  }, [year, month]);

  const upcoming = useMemo(
    () => [...compliances].sort((a, b) => a.dueDateISO.localeCompare(b.dueDateISO)),
    [compliances],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Deadlines</h1>
        <p className="text-sm text-muted-foreground">Track all statutory deadlines across clients.</p>
      </div>

      <div className="border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-base font-semibold text-foreground">{monthLabel}</h2>
          <div className="flex gap-1">
            <button
              onClick={() => setCursor(new Date(year, month - 1, 1))}
              className="border border-border bg-card p-1.5 hover:bg-secondary"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="border border-border bg-card p-1.5 hover:bg-secondary"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-border bg-secondary text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((cell, i) => {
            if (!cell) return <div key={i} className="min-h-24 border-r border-b border-border bg-secondary/30 last:border-r-0" />;
            const items = byDate.get(cell.iso) ?? [];
            return (
              <div
                key={i}
                className={cn(
                  "min-h-24 border-r border-b border-border p-2 last:border-r-0",
                  (i + 1) % 7 === 0 && "border-r-0",
                )}
              >
                <div className="text-xs font-semibold text-foreground">{cell.date}</div>
                <div className="mt-1 space-y-1">
                  {items.map((it) => (
                    <div key={it.id} className="flex items-start gap-1.5 text-[10px] leading-tight">
                      <span className={cn("mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full", DOT_COLOR[it.status])} />
                      <span className="truncate text-muted-foreground" title={`${it.clientName} — ${it.complianceType}`}>
                        {it.complianceType}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-base font-semibold text-foreground">Upcoming Deadlines</h2>
        <div className="border border-border bg-card divide-y divide-border">
          {upcoming.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-4 px-5 py-3">
              <div className="flex items-center gap-3">
                <span className={cn("h-2.5 w-2.5 rounded-full", DOT_COLOR[d.status])} />
                <div>
                  <div className="text-sm font-medium text-foreground">{d.clientName}</div>
                  <div className="text-xs text-muted-foreground">{d.complianceType}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold tabular-nums text-foreground">{d.dueDate}</div>
                <div className={cn(
                  "text-xs",
                  d.daysLeft < 0 ? "text-status-overdue" : d.daysLeft <= 7 ? "text-status-due" : "text-muted-foreground",
                )}>
                  {d.daysLeft < 0 ? `${Math.abs(d.daysLeft)} days overdue` : `${d.daysLeft} days left`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
