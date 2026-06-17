# Adivin — Proposed Feature Additions (Demo Build)

Since this is a demo with fake data and no backend yet, every feature below works with local React state + the existing in-memory data files. Nothing requires login or persistence. We can layer Lovable Cloud on later without rewriting UI.

I've grouped ideas by impact. Pick any combination and I'll build them.

## Tier 1 — High-impact, visually impressive in a demo

1. **Global Command Palette (Cmd/Ctrl+K)**
   Quick-jump to any client, deadline, or document. Shows recent items. One keystroke = "this app feels fast."

2. **AI Assistant Drawer ("Ask Adivin")**
   Floating button bottom-right. Opens a chat panel powered by Lovable AI Gateway. Pre-seeded prompts: "Summarise pending GST filings", "Draft reply to client X", "Explain Section 44AB". Uses the same client/deadline data as context.

3. **Client Detail Page** (`/clients/$clientId`)
   Click a client row → full page with: contact info, compliance timeline, documents generated for them, notes, upcoming deadlines filtered to that client. Currently clients are a flat list — this gives the app real depth.

4. **Dashboard Widgets Row**
   Add 3 small cards above the compliance table:
   - "This week" (deadlines in next 7 days)
   - "Overdue" (red count)
   - "Documents generated this month"

## Tier 2 — Useful workflow additions

5. **Deadlines: list view toggle + status checkboxes**
   Toggle between calendar and list. Mark a deadline "Filed" / "In progress" / "Pending" with colored chips. State held locally.

6. **Bulk actions on compliance table**
   Checkbox column → "Send reminder", "Mark filed", "Export selected to CSV".

7. **Document history panel**
   On the Documents page, a "Recently generated" sidebar showing the last 10 documents created in this session, with re-open / re-download.

8. **Notes per client**
   Free-text notes textarea on each client (saved to localStorage so it survives refresh during the demo).

## Tier 3 — Polish & delight

9. **Dark mode toggle** in Settings (navy theme already lends itself to it).
10. **Onboarding tour** — first visit shows 4-step tooltip walkthrough (react-joyride-style, built custom).
11. **Empty states with illustrations** for filtered views with no results.
12. **Keyboard shortcuts help modal** (press `?`).

## My recommendation for a strong demo

Build **#1 (Command Palette) + #2 (AI Assistant) + #3 (Client Detail Page) + #4 (Dashboard Widgets)**. Together that's ~1 focused build session and transforms Adivin from "static dashboard" into "AI-native CA workspace" — which is the story you'd want to tell when showing it to someone.

## Tell me

Which numbers do you want? Or just say "go with your recommendation" and I'll build #1–#4.
