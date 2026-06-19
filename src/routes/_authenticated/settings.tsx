import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { AppStoreProvider } from "@/store/app-store";
import { supabase } from "@/integrations/supabase/client";

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

interface Prefs {
  email_enabled: boolean;
  days_before: number;
  daily_digest_enabled: boolean;
}

function SettingsPage() {
  const qc = useQueryClient();

  const profileQ = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const prefsQ = useQuery({
    queryKey: ["notification_preferences"],
    queryFn: async (): Promise<Prefs | null> => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("email_enabled, days_before, daily_digest_enabled")
        .eq("user_id", u.user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const updatePrefs = useMutation({
    mutationFn: async (patch: Partial<Prefs>) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("not signed in");
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({ user_id: u.user.id, ...prefsQ.data, ...patch });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notification_preferences"] }),
  });

  const prefs = prefsQ.data ?? { email_enabled: true, days_before: 7, daily_digest_enabled: false };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your firm details and preferences.</p>
      </div>

      <FirmProfile profile={profileQ.data} />

      <section className="border border-border bg-card">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-foreground">Email reminders</h2>
        </div>
        <div className="space-y-3 px-5 py-5 text-sm">
          <Toggle
            label="Email me before each deadline"
            checked={prefs.email_enabled}
            onChange={(v) => updatePrefs.mutate({ email_enabled: v })}
          />
          <label className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-foreground">Send reminder this many days before:</span>
            <select
              value={prefs.days_before}
              onChange={(e) => updatePrefs.mutate({ days_before: Number(e.target.value) })}
              disabled={!prefs.email_enabled}
              className="border border-border bg-background px-2 py-1 text-sm text-foreground disabled:opacity-50"
            >
              {[1, 3, 5, 7, 10, 14].map((d) => (
                <option key={d} value={d}>{d} day{d > 1 ? "s" : ""}</option>
              ))}
            </select>
          </label>
          <Toggle
            label="Daily digest of upcoming + overdue items at 9:00 AM"
            checked={prefs.daily_digest_enabled}
            onChange={(v) => updatePrefs.mutate({ daily_digest_enabled: v })}
          />
          <p className="pt-2 text-xs text-muted-foreground">
            Reminders are sent every morning to your account email. You can toggle this off any time.
          </p>
        </div>
      </section>
    </div>
  );
}

function FirmProfile({ profile }: { profile: { full_name?: string | null; firm_name?: string | null; email?: string | null } | null | undefined }) {
  const qc = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [firmName, setFirmName] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setFirmName(profile.firm_name ?? "");
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("not signed in");
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, firm_name: firmName })
        .eq("id", u.user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });

  return (
    <section className="border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h2 className="text-sm font-semibold text-foreground">Firm Profile</h2>
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="border border-border bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {save.isPending ? "Saving…" : "Save"}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2">
        <Field label="Your name" value={fullName} onChange={setFullName} />
        <Field label="Firm name" value={firmName} onChange={setFirmName} />
        <Field label="Email" value={profile?.email ?? ""} readOnly />
      </div>
    </section>
  );
}

function Field({ label, value, onChange, readOnly, full }: { label: string; value: string; onChange?: (v: string) => void; readOnly?: boolean; full?: boolean }) {
  return (
    <label className={full ? "sm:col-span-2" : ""}>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:border-accent disabled:opacity-60"
      />
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-foreground">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-accent" />
    </label>
  );
}
