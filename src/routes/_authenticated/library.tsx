import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Library as LibraryIcon, Trash2, ChevronLeft, Loader2 } from "lucide-react";
import { listStudySessions, deleteStudySession, type StudyResult } from "@/lib/study.functions";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { StudyView } from "@/components/StudyView";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({ meta: [{ title: "Library — StudyBuddy" }] }),
  component: LibraryPage,
});

type Session = { id: string; title: string; notes_preview: string; result: StudyResult; created_at: string };

function LibraryPage() {
  const list = useServerFn(listStudySessions);
  const del = useServerFn(deleteStudySession);
  const qc = useQueryClient();
  const [open, setOpen] = useState<Session | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => list() as Promise<Session[]>,
  });

  const handleDelete = async (id: string) => {
    try {
      await del({ data: { id } });
      qc.setQueryData<Session[]>(["sessions"], (prev) => prev?.filter((s) => s.id !== id) ?? []);
      if (open?.id === id) setOpen(null);
      toast.success("Deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pb-20 md:pb-8">
      <Toaster richColors position="top-center" />
      <AppHeader />
      <main className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6">
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setOpen(null)} className="gap-1 min-h-11">
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <h2 className="text-lg font-semibold truncate">{open.title}</h2>
              </div>
              <StudyView result={open.result} />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-center gap-2">
                <LibraryIcon className="w-5 h-5 text-primary" />
                <h2 className="text-xl md:text-2xl font-bold">Your library</h2>
              </div>
              {isLoading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : !data?.length ? (
                <Card><CardContent className="py-16 text-center text-muted-foreground text-sm">
                  Nothing saved yet — generate some study materials to see them here.
                </CardContent></Card>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {data.map((s, i) => (
                    <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <Card className="hover:border-primary/40 transition-colors">
                        <CardContent className="p-4 flex flex-col gap-3">
                          <button onClick={() => setOpen(s)} className="text-left space-y-1.5 min-h-11">
                            <h3 className="font-medium leading-tight line-clamp-2">{s.title}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2">{s.notes_preview}</p>
                            <p className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</p>
                          </button>
                          <div className="flex items-center justify-between border-t pt-2 -mx-4 px-4">
                            <span className="text-xs text-muted-foreground">
                              {s.result.flashcards?.length ?? 0} cards · {s.result.quiz?.length ?? 0} quiz
                            </span>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)} className="text-muted-foreground hover:text-destructive gap-1 min-h-9">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}
