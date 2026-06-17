import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(4000),
});

const inputSchema = z.object({
  messages: z.array(messageSchema).min(1).max(20),
  context: z.string().max(8000).default(""),
});

export const askAdivin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { text: "", error: "AI service is not configured." };

    const systemPrompt = `You are Adivin, an AI assistant inside a Chartered Accountant practice management app for "Mehta & Associates" in India.
You help the CA with: summarising filings, drafting client emails/messages (formal Indian business tone), explaining sections of the GST Act, Income Tax Act, Companies Act, and answering quick practice questions.

Live practice context (read-only snapshot):
${data.context || "(no context provided)"}

Rules:
- Be concise. Prefer bullet points and short paragraphs.
- Use INR (₹) for money. Use Indian date format (DD MMM YYYY).
- If the user asks about a specific client, use details from the context above.
- If you draft an email/letter, format it cleanly, ready to copy.
- Never invent client data that isn't in the context.`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "system", content: systemPrompt }, ...data.messages],
        }),
      });

      if (!res.ok) {
        if (res.status === 429) return { text: "", error: "Rate limit hit. Try again shortly." };
        if (res.status === 402) return { text: "", error: "AI credits exhausted." };
        return { text: "", error: `AI service error (${res.status}).` };
      }
      const json = await res.json();
      const text: string = json?.choices?.[0]?.message?.content ?? "";
      return { text, error: null as string | null };
    } catch (e) {
      console.error("askAdivin failed:", e);
      return { text: "", error: "Failed to reach AI service." };
    }
  });
