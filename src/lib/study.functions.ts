import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SYSTEM_PROMPT = `You are a patient and encouraging study assistant. Your task is to help students understand complex topics simply. When given notes or text:

1. Create a 100-word summary that captures the 3 most important points
2. Generate 5 flashcards (each with a question and answer) that test understanding
3. Create 3 quiz questions (multiple choice) with the correct answer marked with an asterisk (*)
4. End with one short motivational tip

Rules:
- Keep explanations simple — like you're explaining to a friend
- Never give direct answers to homework, but always guide understanding
- Use clear formatting with headings for each section
- Keep the tone warm and encouraging

Respond ONLY with valid JSON matching this exact shape (no markdown code fences):
{
  "summary": "string (~100 words)",
  "flashcards": [{ "question": "string", "answer": "string" }],
  "quiz": [{ "question": "string", "choices": ["string", "string", "string", "string"], "correctIndex": 0 }],
  "tip": "string"
}
Provide exactly 5 flashcards and 3 quiz questions. correctIndex is 0-based.`;

const Input = z.object({ notes: z.string().min(10).max(20000) });

export const generateStudyMaterials = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "openai/gpt-5.5",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: data.notes },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
      throw new Error(`AI request failed: ${text}`);
    }

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content);
    return parsed as {
      summary: string;
      flashcards: { question: string; answer: string }[];
      quiz: { question: string; choices: string[]; correctIndex: number }[];
      tip: string;
    };
  });
