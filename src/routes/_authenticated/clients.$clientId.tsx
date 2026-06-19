import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppStore } from "@/store/app-store";
import { ArrowLeft, Building2, Mail, Phone, FileText, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/clients/$clientId")({
  head: () => ({
    meta: [
      { title: "Client — Adivin" },
      { name: "description", content: "Client overview, compliance timeline, and notes." },
    ],
  }),
  component: ClientDetailPage,
});

function ClientDetailPage() {
  const { clientId } = Route.useParams();
  const { clients, compliances } = useAppStore();
  const client = clients.find((c) => c.id === clientId);

  if (!client) {
    return (
      <div className="space-y-4">
        <Link to="/clients" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to clients
        </Link>
        <div className="border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Client not found.
        </div>
      </div>
    );
  }

  const clientCompliances = compliances.filter((r) => r.clientName === client.name);
  const overdue = clientCompliances.filter((r) => r.status === "OVERDUE").length;
  const dueSoon = clientCompliances.filter((r) => r.status === "Due Soon").length;

  return (
    <div className="space-y-6">
      <Link
        to="/clients"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to clients
      </Link>

      <div className="flex flex-col gap-4 border border-border bg-card p-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center bg-primary text-primary-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{client.name}</h1>
            <p className="text-xs text-muted-foreground">{client.businessType} · {client.status}</p>
            <div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground sm:flex-row sm:gap-4">
              <span className="font-mono">{client.gstin}</span>
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {client.phone}</span>
              <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {client.email}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Stat label="Overdue" value={overdue} tone="overdue" />
          <Stat label="Due Soon" value={dueSoon} tone="due" />
          <Stat label="Total Items" value={clientCompliances.length} tone="default" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-muted-foreground" /> Compliance Timeline
            </h2>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{clientCompliances.length} items</span>
          </div>
          {clientCompliances.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              No compliance items yet for {client.name}.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {clientCompliances.map((r) => (
                <li key={r.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <div className="text-sm font-medium text-foreground">{r.complianceType}</div>
                    <div className="text-xs text-muted-foreground">Due {r.dueDate}</div>
                  </div>
                  <StatusPill status={r.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-6">
          <div className="border border-border bg-card">
            <div className="border-b border-border px-5 py-3 text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" /> Assigned Compliances
            </div>
            <div className="flex flex-wrap gap-1.5 px-5 py-4">
              {client.compliances.map((t) => (
                <span key={t} className="border border-border bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <NotesPanel clientId={client.id} />
        </aside>
      </div>
    </div>
  );
}

function NotesPanel({ clientId }: { clientId: string }) {
  const key = `adivin:notes:${clientId}`;
  const [notes, setNotes] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setNotes(window.localStorage.getItem(key) ?? "");
  }, [key]);

  const save = () => {
    window.localStorage.setItem(key, notes);
    setSavedAt(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
  };

  return (
    <div className="border border-border bg-card">
      <div className="border-b border-border px-5 py-3 text-sm font-semibold text-foreground">Notes</div>
      <div className="p-5">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={6}
          placeholder="Add private notes for this client…"
          className="w-full border border-input bg-background p-3 text-sm focus:outline-none focus:border-accent"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">{savedAt ? `Saved at ${savedAt}` : "Saved locally in this browser"}</span>
          <button
            onClick={save}
            className="border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-accent hover:border-accent"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "default" | "overdue" | "due" }) {
  const cls = {
    default: "text-primary",
    overdue: "text-status-overdue",
    due: "text-status-due",
  }[tone];
  return (
    <div className="min-w-[80px] border border-border bg-background px-3 py-2 text-center">
      <div className={cn("text-xl font-semibold tabular-nums", cls)}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    OVERDUE: "bg-status-overdue text-primary-foreground",
    "Due Soon": "bg-status-due text-primary-foreground",
    Upcoming: "bg-secondary text-secondary-foreground",
    Filed: "bg-status-filed text-primary-foreground",
  };
  return (
    <span className={cn("px-2 py-1 text-[10px] font-semibold uppercase tracking-wider", map[status] ?? "bg-secondary")}>
      {status}
    </span>
  );
}
