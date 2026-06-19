import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { AppStoreProvider } from "@/store/app-store";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Adivin" },
      { name: "description", content: "Firm profile, notifications, and preferences." },
    ],
  }),
  component: () => (
    <AppStoreProvider>
      <AppLayout>
        <SettingsPage />
      </AppLayout>
    </AppStoreProvider>
  ),
});

function SettingsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your firm details and preferences.</p>
      </div>

      <section className="border border-border bg-card">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-foreground">Firm Profile</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2">
          <Field label="Firm Name" value="Mehta & Associates" />
          <Field label="Membership No." value="ICAI-123456" />
          <Field label="Contact Email" value="contact@mehta-ca.in" />
          <Field label="Phone" value="+91 98100 11223" />
          <Field label="Address" value="201 Connaught Place, New Delhi 110001" full />
        </div>
      </section>

      <section className="border border-border bg-card">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
        </div>
        <div className="space-y-3 px-5 py-5 text-sm">
          <Toggle label="Email me 7 days before each deadline" defaultChecked />
          <Toggle label="WhatsApp reminders to clients" defaultChecked />
          <Toggle label="Daily compliance digest at 9:00 AM" />
        </div>
      </section>
    </div>
  );
}

function Field({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <label className={full ? "sm:col-span-2" : ""}>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        defaultValue={value}
        className="w-full border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:border-accent"
      />
    </label>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-foreground">{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} className="h-4 w-4 accent-accent" />
    </label>
  );
}
