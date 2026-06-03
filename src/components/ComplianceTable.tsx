import { cn } from "@/lib/utils";
import type { ComplianceRow, ComplianceStatus } from "@/data/clients";

const ROW_BG: Record<ComplianceStatus, string> = {
  OVERDUE: "bg-status-overdue-bg",
  "Due Soon": "bg-status-due-bg",
  Upcoming: "bg-card",
  Filed: "bg-status-filed-bg text-muted-foreground",
};

const STATUS_PILL: Record<ComplianceStatus, string> = {
  OVERDUE: "bg-status-overdue text-primary-foreground",
  "Due Soon": "bg-status-due text-primary-foreground",
  Upcoming: "bg-secondary text-secondary-foreground border border-border",
  Filed: "bg-muted text-muted-foreground border border-border",
};

export function ComplianceTable({
  rows,
  onMarkFiled,
}: {
  rows: ComplianceRow[];
  onMarkFiled: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto border border-border bg-card">
      <table className="w-full min-w-[820px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3">Client Name</th>
            <th className="px-4 py-3">GSTIN</th>
            <th className="px-4 py-3">Compliance Type</th>
            <th className="px-4 py-3">Due Date</th>
            <th className="px-4 py-3">Days Left</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                No items in this view.
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr
              key={r.id}
              className={cn(
                "border-b border-border last:border-0 transition-colors",
                ROW_BG[r.status],
              )}
            >
              <td className="px-4 py-3 font-medium text-foreground">{r.clientName}</td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.gstin}</td>
              <td className="px-4 py-3">{r.complianceType}</td>
              <td className="px-4 py-3">{r.dueDate}</td>
              <td
                className={cn(
                  "px-4 py-3 font-semibold",
                  r.daysLeft < 0 && "text-status-overdue",
                  r.daysLeft >= 0 && r.daysLeft <= 7 && "text-status-due",
                )}
              >
                {r.daysLeft < 0 ? `${r.daysLeft}` : `${r.daysLeft}`} days
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-1 text-[11px] font-semibold uppercase tracking-wide",
                    STATUS_PILL[r.status],
                  )}
                >
                  {r.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                {r.status === "Filed" ? (
                  <span className="text-xs text-muted-foreground">Filed</span>
                ) : (
                  <button
                    onClick={() => onMarkFiled(r.id)}
                    className="border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-accent hover:border-accent"
                  >
                    Mark Filed
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
