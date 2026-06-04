import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  documentType: z.string().min(1).max(200),
  clientName: z.string().min(1).max(200),
  gstin: z.string().max(50).optional().default(""),
  address: z.string().max(500).optional().default(""),
  firmName: z.string().max(200).optional().default("Mehta & Associates"),
  fields: z.record(z.string(), z.string()).default({}),
});

export const generateDocument = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { text: "", error: "AI service is not configured." };
    }

    const fieldLines = Object.entries(data.fields)
      .filter(([, v]) => v && v.trim())
      .map(([k, v]) => `- ${k}: ${v}`)
      .join("\n");

    const userMessage = `Document Type: ${data.documentType}

CA Firm: ${data.firmName}
Client / Business Name: ${data.clientName}
GSTIN: ${data.gstin || "[BLANK]"}
Client Address: ${data.address || "[BLANK]"}

Document-specific details:
${fieldLines || "(none provided)"}

Today's date: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}

Generate the complete document now.`;

    const systemPrompt = `You are a senior Chartered Accountant in India with 20 years of experience.
Generate a professional, legally appropriate ${data.documentType} for an Indian CA firm.

Rules:
- Use formal Indian business letter format
- Include proper salutation, body, and closing
- Reference correct sections of relevant acts (GST Act, Income Tax Act, Companies Act) where applicable
- Auto-fill all provided client details
- Leave [BLANK] placeholders only where information was not provided
- Output the complete document text only. No explanations, no markdown code fences.`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        }),
      });

      if (!res.ok) {
        if (res.status === 429) return { text: "", error: "Rate limit hit. Please try again in a moment." };
        if (res.status === 402) return { text: "", error: "AI credits exhausted. Add credits to continue." };
        const t = await res.text();
        console.error("AI gateway error:", res.status, t);
        return { text: "", error: `AI service error (${res.status}).` };
      }

      const json = await res.json();
      const text: string = json?.choices?.[0]?.message?.content ?? "";
      return { text, error: null as string | null };
    } catch (e) {
      console.error("generateDocument failed:", e);
      return { text: "", error: "Failed to reach AI service." };
    }
  });
