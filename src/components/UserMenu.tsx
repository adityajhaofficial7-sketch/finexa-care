import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { UserCircle2, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function UserMenu() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSignOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center border border-border bg-secondary text-primary hover:bg-accent hover:text-accent-foreground"
        aria-label="Account"
      >
        <UserCircle2 className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-56 border border-border bg-card shadow-lg">
          <div className="border-b border-border px-3 py-2">
            <div className="text-xs text-muted-foreground">Signed in as</div>
            <div className="truncate text-sm font-medium text-foreground">{email ?? "—"}</div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
