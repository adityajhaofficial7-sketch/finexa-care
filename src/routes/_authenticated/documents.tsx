import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useRef, useState } from "react";
import { Clock, Copy, Download, FileText, RefreshCw, Sparkles, X } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { AppStoreProvider, useAppStore } from "@/store/app-store";
import { CATEGORIES, DOCUMENTS, type DocTemplate } from "@/data/documents";
import { generateDocument } from "@/lib/generate-document.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({
    meta: [
      { title: "Documents — Adivin" },
      { name: "description", content: "Generate CA documents in seconds." },
    ],
  }),
  component: () => (
    <AppStoreProvider>
      <AppLayout>
        <DocumentsPage />
      </AppLayout>
    </AppStoreProvider>
  ),
});

function DocumentsPage() {
  const [activeCat, setActiveCat] = useState<string>("All Documents");
  const [openDoc, setOpenDoc] = useState<DocTemplate | null>(null);

  const filtered = useMemo(
    () => (activeCat === "All Documents" ? DOCUMENTS : DOCUMENTS.filter((d) => d.category === activeCat)),
    [activeCat],
  );

  const catList = ["All Documents", ...CATEGORIES];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Documents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate professional CA documents instantly. Pre-filled with client details.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Category filter */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="border border-border bg-card">
            <div className="border-b border-border px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Categories
            </div>
            <nav className="flex flex-col">
              {catList.map((c) => {
                const active = activeCat === c;
                const count = c === "All Documents" ? DOCUMENTS.length : DOCUMENTS.filter((d) => d.category === c).length;
                return (
                  <button
                    key={c}
                    onClick={() => setActiveCat(c)}
                    className={cn(
                      "flex items-center justify-between border-l-2 px-4 py-2.5 text-left text-sm transition-colors",
                      active
                        ? "border-accent bg-secondary font-medium text-foreground"
                        : "border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <span>{c}</span>
                    <span className="text-[11px] text-muted-foreground">{count}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <article
              key={d.id}
              className="group flex flex-col border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
            >
              <div className="flex h-9 w-9 items-center justify-center border border-border bg-secondary text-primary">
                <FileText className="h-4 w-4" />
              </div>
              <h3 className="mt-4 text-[15px] font-semibold leading-snug text-foreground">{d.name}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground line-clamp-2">{d.description}</p>
              <div className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-[color:var(--status-filed)]">
                <Clock className="h-3.5 w-3.5" />
                Saves ~{d.savesMin} min
              </div>
              <button
                onClick={() => setOpenDoc(d)}
                className="mt-5 inline-flex items-center justify-center gap-2 border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent hover:border-accent"
              >
                <Sparkles className="h-4 w-4" />
                Generate
              </button>
            </article>
          ))}
        </div>
      </div>

      {openDoc && <GenerateModal doc={openDoc} onClose={() => setOpenDoc(null)} />}
    </div>
  );
}

function GenerateModal({ doc, onClose }: { doc: DocTemplate; onClose: () => void }) {
  const { clients } = useAppStore();
  const [clientId, setClientId] = useState<string>(clients[0]?.id ?? "");
  const client = clients.find((c) => c.id === clientId);
  const [address, setAddress] = useState("");
  const [extra, setExtra] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const run = useServerFn(generateDocument);

  const handleGenerate = async () => {
    if (!client) return;
    setLoading(true);
    setError(null);
    setOutput("");
    try {
      const res = await run({
        data: {
          documentType: doc.name,
          clientName: client.name,
          gstin: client.gstin,
          address,
          firmName: "Mehta & Associates",
          fields: extra,
        },
      });
      if (res.error) setError(res.error);
      else {
        setOutput(res.text);
        if (typeof window !== "undefined") {
          const key = `adivin:docs:${new Date().getFullYear()}-${new Date().getMonth() + 1}`;
          const cur = parseInt(window.localStorage.getItem(key) ?? "0", 10) || 0;
          window.localStorage.setItem(key, String(cur + 1));
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (output) navigator.clipboard.writeText(output);
  };

  const handlePrint = () => {
    if (!output) return;
    const w = window.open("", "_blank", "width=900,height=1000");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>${doc.name}</title>
<style>
  @page { margin: 1in; }
  body { font-family: 'Courier New', monospace; font-size: 12pt; line-height: 1.6; white-space: pre-wrap; color: #000; padding: 0; }
</style></head><body>${output.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="flex max-h-[92vh] w-full max-w-[80vw] flex-col border border-border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">{doc.name}</h2>
            <p className="text-xs text-muted-foreground">{doc.description}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-[360px_1fr]">
          {/* Form */}
          <div className="overflow-y-auto border-b border-border bg-card p-6 md:border-b-0 md:border-r">
            <div className="space-y-4">
              <Field label="Client">
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="h-9 w-full border border-input bg-background px-3 text-sm"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="Business Name">
                <input
                  readOnly
                  value={client?.name ?? ""}
                  className="h-9 w-full border border-input bg-secondary px-3 text-sm text-muted-foreground"
                />
              </Field>
              <Field label="GSTIN">
                <input
                  readOnly
                  value={client?.gstin ?? ""}
                  className="h-9 w-full border border-input bg-secondary px-3 text-sm text-muted-foreground"
                />
              </Field>
              <Field label="Address">
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  placeholder="Registered address"
                  className="w-full border border-input bg-background px-3 py-2 text-sm"
                />
              </Field>

              {doc.extraFields.map((f) => (
                <Field key={f.key} label={f.label}>
                  <input
                    type={f.type}
                    value={extra[f.label] ?? ""}
                    onChange={(e) => setExtra((p) => ({ ...p, [f.label]: e.target.value }))}
                    className="h-9 w-full border border-input bg-background px-3 text-sm"
                  />
                </Field>
              ))}

              <button
                onClick={handleGenerate}
                disabled={loading || !client}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 border border-primary bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-accent hover:border-accent disabled:opacity-60"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {output ? "Regenerate" : "Generate Document"}
              </button>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          </div>

          {/* Preview */}
          <div className="flex flex-1 flex-col overflow-hidden bg-secondary">
            <div className="flex items-center justify-between border-b border-border bg-card px-5 py-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Document Preview
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!output}
                  className="inline-flex items-center gap-1.5 border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-40"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy Text
                </button>
                <button
                  onClick={handlePrint}
                  disabled={!output}
                  className="inline-flex items-center gap-1.5 border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-40"
                >
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading || !output}
                  className="inline-flex items-center gap-1.5 border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-40"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} /> Regenerate
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div
                ref={printRef}
                className="mx-auto min-h-full max-w-3xl whitespace-pre-wrap border border-border bg-card p-10 font-mono text-[13px] leading-relaxed text-foreground shadow-sm"
              >
                {loading
                  ? "Generating document…"
                  : output || (
                      <span className="text-muted-foreground">
                        Fill in the form and click Generate to create the document.
                      </span>
                    )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
