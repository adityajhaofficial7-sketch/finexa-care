import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { AppStoreProvider } from "@/store/app-store";
import { FileText, UploadCloud } from "lucide-react";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Documents — Finexa" },
      { name: "description", content: "Client document vault — coming soon." },
    ],
  }),
  component: () => (
    <AppStoreProvider>
      <AppLayout>
        <div className="mx-auto max-w-xl border border-dashed border-border bg-card px-8 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center border border-border bg-secondary">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-foreground">Documents</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Securely store client PAN, GST certificates, Form 16s, and filed returns in one place.
          </p>
          <button className="mt-6 inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent hover:border-accent">
            <UploadCloud className="h-4 w-4" />
            Coming Soon
          </button>
        </div>
      </AppLayout>
    </AppStoreProvider>
  ),
});
