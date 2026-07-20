import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, Library, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudyBuddy — AI Study Assistant" },
      { name: "description", content: "Turn lecture notes into summaries, flashcards, and quizzes in seconds." },
      { property: "og:title", content: "StudyBuddy — AI Study Assistant" },
      { property: "og:description", content: "Turn lecture notes into summaries, flashcards, and quizzes in seconds." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/app" }); });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-semibold">StudyBuddy</span>
          <div className="ml-auto flex gap-2">
            <Button asChild variant="ghost"><Link to="/auth">Log in</Link></Button>
            <Button asChild><Link to="/auth">Get started</Link></Button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Turn notes into <span className="text-primary">study gold</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Paste, upload, or snap a photo of your notes. Get a summary, flashcards, and quiz questions instantly — saved to your personal library.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="h-12 px-6"><Link to="/auth">Start studying free</Link></Button>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3 mt-16 md:mt-24">
          <Feature icon={<Sparkles className="w-5 h-5" />} title="AI summaries" desc="Every session distilled to 100-word essentials." />
          <Feature icon={<Upload className="w-5 h-5" />} title="Upload anything" desc="PDFs, screenshots, or handwritten photos — we'll read them." />
          <Feature icon={<Library className="w-5 h-5" />} title="Personal library" desc="Every study set saved and searchable across devices." />
        </div>
      </main>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="rounded-xl border bg-card p-6">
      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary grid place-items-center">{icon}</div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{desc}</p>
    </motion.div>
  );
}
