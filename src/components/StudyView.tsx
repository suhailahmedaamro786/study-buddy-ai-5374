import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Copy, Trophy } from "lucide-react";
import { toast } from "sonner";
import type { StudyResult } from "@/lib/study.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flashcard } from "./Flashcard";

export function StudyView({ result }: { result: StudyResult }) {
  const copy = async (text: string, label: string) => {
    try { await navigator.clipboard.writeText(text); toast.success(`${label} copied!`); }
    catch { toast.error("Copy failed"); }
  };
  const formatFlashcards = () => result.flashcards.map((f, i) => `${i + 1}. Q: ${f.question}\n   A: ${f.answer}`).join("\n\n");
  const formatQuiz = () => result.quiz.map((q, i) => {
    const choices = q.choices.map((c, j) => `   ${String.fromCharCode(65 + j)}. ${c}${j === q.correctIndex ? " *" : ""}`).join("\n");
    return `${i + 1}. ${q.question}\n${choices}`;
  }).join("\n\n");

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 md:grid-cols-2">
      <Section title="Summary" onCopy={() => copy(result.summary, "Summary")} className="md:col-span-2">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.summary}</p>
      </Section>

      <Section title="Flashcards" onCopy={() => copy(formatFlashcards(), "Flashcards")}>
        <div className="grid gap-3">
          {result.flashcards.map((f, i) => <Flashcard key={i} index={i} question={f.question} answer={f.answer} />)}
        </div>
      </Section>

      <Section title="Quiz" onCopy={() => copy(formatQuiz(), "Quiz")}>
        <Quiz quiz={result.quiz} />
      </Section>

      <Card className="md:col-span-2 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-sm"><span className="font-semibold text-primary">💡 Tip:</span> {result.tip}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Section({ title, onCopy, children, className = "" }: { title: string; onCopy: () => void; children: React.ReactNode; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{title}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onCopy} className="gap-1.5 min-h-9">
          <Copy className="w-3.5 h-3.5" /> Copy
        </Button>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Quiz({ quiz }: { quiz: StudyResult["quiz"] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const submit = () => {
    let s = 0;
    quiz.forEach((q, i) => { if (answers[i] === q.correctIndex) s++; });
    setScore(s);
    setSubmitted(true);
    if (s === quiz.length) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="space-y-4">
      <ol className="space-y-4">
        {quiz.map((q, i) => (
          <li key={i}>
            <p className="text-sm font-medium">{i + 1}. {q.question}</p>
            <ul className="mt-2 space-y-1.5">
              {q.choices.map((c, j) => {
                const chosen = answers[i] === j;
                const correct = submitted && j === q.correctIndex;
                const wrong = submitted && chosen && j !== q.correctIndex;
                return (
                  <li key={j}>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => !submitted && setAnswers({ ...answers, [i]: j })}
                      disabled={submitted}
                      className={`w-full text-left text-sm px-3 py-2.5 min-h-11 rounded-md border transition-colors ${
                        correct ? "border-green-500 bg-green-500/10" :
                        wrong ? "border-red-500 bg-red-500/10" :
                        chosen ? "border-primary bg-primary/10" : "border-border hover:bg-accent"
                      }`}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + j)}.</span>{c}
                      {correct && <span className="ml-2 text-green-600">✓</span>}
                    </motion.button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div key="submit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button onClick={submit} disabled={Object.keys(answers).length < quiz.length} className="w-full">
              Check answers
            </Button>
          </motion.div>
        ) : (
          <motion.div key="score" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-center">
            <Trophy className="w-6 h-6 text-primary mx-auto" />
            <p className="mt-2 text-sm font-semibold">
              You scored {score} / {quiz.length}
            </p>
            <p className="text-xs text-muted-foreground">
              {score === quiz.length ? "🎉 Perfect!" : "Great effort — try again to improve!"}
            </p>
            <Button size="sm" variant="ghost" onClick={() => { setAnswers({}); setSubmitted(false); }} className="mt-2">
              Try again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
