import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { AppStoreProvider, useAppStore } from "@/store/app-store";
import { BUSINESS_TYPES, COMPLIANCE_OPTIONS, type Client } from "@/data/clients";
import { Plus, X, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/clients")({
  head: () => ({
    meta: [
      { title: "Clients — Adivin" },
      { name: "description", content: "Manage your client roster, GSTINs, and compliance assignments." },
    ],
  }),
  component: () => (
    <AppStoreProvider>
      <AppLayout>
        <ClientsPage />
      </AppLayout>
    </AppStoreProvider>
  ),
});

function ClientsPage() {
  const { clients, addClient } = useAppStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground">{clients.length} active clients in your practice.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent hover:border-accent"
        >
          <Plus className="h-4 w-4" />
          Add Client
        </button>
      </div>

      <div className="overflow-x-auto border border-border bg-card">
        <table className="w-full min-w-[900px] border-collapse text-[14px]">
          <thead>
            <tr className="border-b border-border bg-secondary text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-4">Client Name</th>
              <th className="px-5 py-4">GSTIN</th>
              <th className="px-5 py-4">Phone</th>
              <th className="px-5 py-4">Business Type</th>
              <th className="px-5 py-4">Compliances</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {clients.map((c) => (
              <tr key={c.id} className="hover:bg-secondary/50">
                <td className="px-5 py-5 font-medium text-foreground">
                  <Link to="/clients/$clientId" params={{ clientId: c.id }} className="hover:text-accent hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="px-5 py-5 font-mono text-[12px] text-muted-foreground">{c.gstin}</td>
                <td className="px-5 py-5 text-muted-foreground">{c.phone}</td>
                <td className="px-5 py-5">{c.businessType}</td>
                <td className="px-5 py-5">
                  <div className="flex flex-wrap gap-1">
                    {c.compliances.map((t) => (
                      <span key={t} className="border border-border bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-5">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1.5 text-[11px] font-semibold uppercase",
                    c.status === "Active" ? "bg-status-filed text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}>
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-5 text-right">
                  <Link
                    to="/clients/$clientId"
                    params={{ clientId: c.id }}
                    className="inline-flex items-center gap-1 border border-border bg-card px-2.5 py-1 text-[12px] text-foreground hover:bg-secondary"
                  >
                    <Pencil className="h-3 w-3" />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && <AddClientModal onClose={() => setOpen(false)} onSave={addClient} />}
    </div>
  );
}

function AddClientModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (c: Omit<Client, "id" | "status">) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    gstin: "",
    phone: "",
    email: "",
    businessType: "Proprietorship" as Client["businessType"],
    compliances: [] as string[],
  });

  const toggleCompliance = (val: string) => {
    setForm((f) => ({
      ...f,
      compliances: f.compliances.includes(val)
        ? f.compliances.filter((c) => c !== val)
        : [...f.compliances, val],
    }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-base font-semibold text-foreground">Add New Client</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4 px-5 py-5">
          <Field label="Business Name" required>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:border-accent"
              required
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="GSTIN">
              <input
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
                className="w-full border border-input bg-background px-3 py-2 font-mono text-xs focus:outline-none focus:border-accent"
                maxLength={15}
              />
            </Field>
            <Field label="Phone">
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
            </Field>
          </div>
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </Field>
          <Field label="Business Type">
            <select
              value={form.businessType}
              onChange={(e) => setForm({ ...form, businessType: e.target.value as Client["businessType"] })}
              className="w-full border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              {BUSINESS_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Compliance Types">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {COMPLIANCE_OPTIONS.map((opt) => {
                const checked = form.compliances.includes(opt);
                return (
                  <label
                    key={opt}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 border px-2.5 py-2 text-xs",
                      checked ? "border-accent bg-accent/10 text-foreground" : "border-border bg-background",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCompliance(opt)}
                      className="h-3.5 w-3.5 accent-accent"
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          </Field>
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent hover:border-accent"
            >
              Save Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label} {required && <span className="text-status-overdue">*</span>}
      </span>
      {children}
    </label>
  );
}
