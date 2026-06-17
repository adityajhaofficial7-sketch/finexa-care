import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Send, Sparkles, X } from "lucide-react";
import { askAdivin } from "@/lib/ask-adivin.functions";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const SEED_PROMPTS = [
  "Summarise pending GST filings",
  "Which clients are overdue this week?",
  "Draft a polite reminder email for a pending GSTR-3B",
  "Explain Section 44AB in simple terms",
];

export function AiAssistant({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { clients, compliances } = useAppStore();
  const run = useServerFn(askAdivin);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const context = (() => {
    const overdue = compliances.filter((c) => c.status === "OVERDUE");
    const dueSoon = compliances.filter((c) => c.status === "Due Soon");
    return [
      `Firm: Mehta & Associates`,
      `Total clients: ${clients.length}`,
      `Clients: ${clients.map((c) => `${c.name} (${c.businessType}, GSTIN ${c.gstin}, contact ${c.email})`).join("; ")}`,
      `Overdue filings: ${overdue.map((r) => `${r.clientName} – ${r.complianceType} (was due ${r.dueDate})`).join("; ") || "none"}`,
      `Due soon: ${dueSoon.map((r) => `${r.clientName} – ${r.complianceType} (${r.dueDate})`).join("; ") || "none"}`,
    ].join("\n");
  })();

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await run({ data: { messages: next, context } });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.error ? `⚠️ ${res.error}` : res.text || "(no response)" },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${e instanceof Error ? e.message : "Request failed."}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <aside
        className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center bg-primary text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Ask Adivin</div>
              <div className="text-[11px] text-muted-foreground">AI assistant · knows your clients & filings</div>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
          {messages.length === 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Hi — I'm Adivin. Ask anything about your practice, or pick a starter prompt.
              </p>
              <div className="grid gap-2">
                {SEED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="border border-border bg-background px-3 py-2 text-left text-[13px] text-foreground hover:border-accent hover:bg-secondary"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap px-3 py-2 text-[13px] leading-relaxed",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-background text-foreground",
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="border border-border bg-background px-3 py-2 text-[13px] text-muted-foreground">
                    Thinking…
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-border px-3 py-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a client, deadline, or draft…"
            className="h-9 flex-1 border border-input bg-background px-3 text-sm focus:outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-9 w-9 items-center justify-center border border-primary bg-primary text-primary-foreground hover:bg-accent hover:border-accent disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </aside>
    </div>
  );
}
