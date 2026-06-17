import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CalendarClock, FileText, LayoutDashboard, Settings, Users } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useAppStore } from "@/store/app-store";
import { DOCUMENTS } from "@/data/documents";

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();
  const { clients, compliances } = useAppStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const go = (to: string, params?: Record<string, string>) => {
    onOpenChange(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigate({ to: to as any, params } as any);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search clients, deadlines, documents…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go("/")}> <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</CommandItem>
          <CommandItem onSelect={() => go("/clients")}> <Users className="mr-2 h-4 w-4" /> Clients</CommandItem>
          <CommandItem onSelect={() => go("/deadlines")}> <CalendarClock className="mr-2 h-4 w-4" /> Deadlines</CommandItem>
          <CommandItem onSelect={() => go("/documents")}> <FileText className="mr-2 h-4 w-4" /> Documents</CommandItem>
          <CommandItem onSelect={() => go("/settings")}> <Settings className="mr-2 h-4 w-4" /> Settings</CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Clients">
          {clients.map((c) => (
            <CommandItem
              key={c.id}
              value={`client ${c.name} ${c.gstin}`}
              onSelect={() => go("/clients/$clientId", { clientId: c.id })}
            >
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{c.name}</span>
              <span className="ml-2 font-mono text-[10px] text-muted-foreground">{c.gstin}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Deadlines">
          {compliances.slice(0, 10).map((r) => (
            <CommandItem
              key={r.id}
              value={`deadline ${r.clientName} ${r.complianceType}`}
              onSelect={() => go("/deadlines")}
            >
              <CalendarClock className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{r.complianceType} — {r.clientName}</span>
              <span className="ml-2 text-[11px] text-muted-foreground">{r.dueDate}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Documents">
          {DOCUMENTS.map((d) => (
            <CommandItem
              key={d.id}
              value={`document ${d.name} ${d.category}`}
              onSelect={() => go("/documents")}
            >
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{d.name}</span>
              <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground">{d.category}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
