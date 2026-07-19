import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { BookOpen, Copy, Loader2, Sparkles, Trash2, History } from "lucide-react";
import { generateStudyMaterials } from "@/lib/study.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudyBuddy — AI Study Assistant" },
      { name: "description", content: "Paste your lecture notes and get summaries, flashcards, and quiz questions instantly." },
      { property: "og:title", content: "StudyBuddy — AI Study Assistant" },
      { property: "og:description", content: "Paste your lecture notes and get summaries, flashcards, and quiz questions instantly." },
    ],
  }),
  component: Index,
});

type Result = Awaited<ReturnType<typeof generateStudyMaterials>>;
type HistoryItem = { id: string; createdAt: number; notesPreview: string; result: Result };

const STORAGE_KEY = "studybuddy_history_v1";

function Index() {
  const generate = useServerFn(generateStudyMaterials);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (items: HistoryItem[]) => {
    setHistory(items);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  };

  const handleGenerate = async () => {
    if (notes.trim().length < 10) {
      toast.error("Please paste at least a few sentences of notes.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const r = await generate({ data: { notes } });
      setResult(r);
      const item: HistoryItem = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        notesPreview: notes.slice(0, 80),
        result: r,
      };
      persist([item, ...history].slice(0, 20));
      toast.success("Study materials ready!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied!`);
    } catch {
      toast.error("Copy failed");
    }
  };

  const clearHistory = () => persist([]);

  const formatFlashcards = (r: Result) =>
    r.flashcards.map((f, i) => `${i + 1}. Q: ${f.question}\n   A: ${f.answer}`).join("\n\n");
  const formatQuiz = (r: Result) =>
    r.quiz
      .map((q, i) => {
        const choices = q.choices
          .map((c, j) => `   ${String.fromCharCode(65 + j)}. ${c}${j === q.correctIndex ? " *" : ""}`)
          .join("\n");
        return `${i + 1}. ${q.question}\n${choices}`;
      })
      .join("\n\n");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <Toaster richColors position="top-center" />
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold leading-tight">StudyBuddy</h1>
            <p className="text-xs text-muted-foreground">AI study assistant</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <section className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Turn notes into <span className="text-primary">study gold</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Paste your lecture notes and get a summary, flashcards, and quiz questions in seconds.
          </p>
        </section>

        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle className="text-base">Your notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your lecture notes, textbook excerpt, or any study material here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[220px] text-sm resize-y"
              disabled={loading}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">{notes.length} characters</span>
              <Button size="lg" onClick={handleGenerate} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? "Generating..." : "Generate Study Materials"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <div className="grid gap-6 md:grid-cols-2">
            <SectionCard
              title="Summary"
              onCopy={() => copy(result.summary, "Summary")}
              className="md:col-span-2"
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.summary}</p>
            </SectionCard>

            <SectionCard title="Flashcards" onCopy={() => copy(formatFlashcards(result), "Flashcards")}>
              <ol className="space-y-3">
                {result.flashcards.map((f, i) => (
                  <li key={i} className="rounded-lg border p-3 bg-card">
                    <p className="text-sm font-medium">Q{i + 1}. {f.question}</p>
                    <p className="text-sm text-muted-foreground mt-1">A. {f.answer}</p>
                  </li>
                ))}
              </ol>
            </SectionCard>

            <SectionCard title="Quiz Questions" onCopy={() => copy(formatQuiz(result), "Quiz")}>
              <ol className="space-y-4">
                {result.quiz.map((q, i) => (
                  <li key={i}>
                    <p className="text-sm font-medium">{i + 1}. {q.question}</p>
                    <ul className="mt-2 space-y-1">
                      {q.choices.map((c, j) => (
                        <li
                          key={j}
                          className={`text-sm px-3 py-1.5 rounded-md border ${
                            j === q.correctIndex
                              ? "border-primary/40 bg-primary/10 text-foreground font-medium"
                              : "border-border/50"
                          }`}
                        >
                          {String.fromCharCode(65 + j)}. {c}
                          {j === q.correctIndex && <span className="ml-2 text-primary">✓</span>}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </SectionCard>

            <Card className="md:col-span-2 border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <p className="text-sm">
                  <span className="font-semibold text-primary">💡 Tip:</span> {result.tip}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {history.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="w-4 h-4" /> History
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={clearHistory} className="gap-1 text-muted-foreground">
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </Button>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {history.map((h) => (
                  <li key={h.id}>
                    <button
                      onClick={() => {
                        setResult(h.result);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="w-full text-left py-3 hover:bg-accent/50 px-2 rounded-md transition-colors"
                    >
                      <p className="text-sm font-medium truncate">{h.notesPreview}...</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(h.createdAt).toLocaleString()}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-8 text-center text-xs text-muted-foreground">
        Built with Lovable AI · Your notes stay in your browser
      </footer>
    </div>
  );
}

function SectionCard({
  title,
  onCopy,
  children,
  className = "",
}: {
  title: string;
  onCopy: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{title}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onCopy} className="gap-1.5">
          <Copy className="w-3.5 h-3.5" /> Copy
        </Button>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
