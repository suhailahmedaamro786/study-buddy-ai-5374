import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
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
  "title": "string (short 3-6 word topic label)",
  "summary": "string (~100 words)",
  "flashcards": [{ "question": "string", "answer": "string" }],
  "quiz": [{ "question": "string", "choices": ["string", "string", "string", "string"], "correctIndex": 0 }],
  "tip": "string"
}
Provide exactly 5 flashcards and 3 quiz questions. correctIndex is 0-based.`;

export type StudyResult = {
  title: string;
  summary: string;
  flashcards: { question: string; answer: string }[];
  quiz: { question: string; choices: string[]; correctIndex: number }[];
  tip: string;
};

async function callGateway(body: unknown) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
    throw new Error(`AI request failed: ${text}`);
  }
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "";
}

export const generateStudyMaterials = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ notes: z.string().min(10).max(20000) }).parse(data))
  .handler(async ({ data }) => {
    const content = await callGateway({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: data.notes },
      ],
      response_format: { type: "json_object" },
    });
    return JSON.parse(content) as StudyResult;
  });

export const extractTextFromUpload = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({
      dataUrl: z.string().startsWith("data:").max(15_000_000),
      mimeType: z.string(),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const isPdf = data.mimeType === "application/pdf";
    const userContent = isPdf
      ? [
          { type: "text", text: "Extract ALL readable text from this document. Return plain text only, no commentary." },
          { type: "file", file: { filename: "upload.pdf", file_data: data.dataUrl } },
        ]
      : [
          { type: "text", text: "Extract ALL readable text from this image (OCR). Return plain text only, no commentary." },
          { type: "image_url", image_url: { url: data.dataUrl } },
        ];
    const content = await callGateway({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: userContent }],
    });
    const text = typeof content === "string" ? content : "";
    if (text.trim().length < 10) throw new Error("Couldn't extract enough text from that file.");
    return { text };
  });

export const saveStudySession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      title: z.string().min(1).max(120),
      notesPreview: z.string().max(300),
      result: z.any(),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("study_sessions")
      .insert({ user_id: context.userId, title: data.title, notes_preview: data.notesPreview, result: data.result })
      .select("id, created_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listStudySessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("study_sessions")
      .select("id, title, notes_preview, result, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deleteStudySession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("study_sessions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
