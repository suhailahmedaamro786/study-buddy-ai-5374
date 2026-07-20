import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Sparkles, Upload, FileText, X } from "lucide-react";
import { generateStudyMaterials, extractTextFromUpload, saveStudySession, type StudyResult } from "@/lib/study.functions";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { StudyView } from "@/components/StudyView";
import { StudySkeleton } from "@/components/StudySkeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({ meta: [{ title: "Study — StudyBuddy" }] }),
  component: StudyApp,
});

function StudyApp() {
  const generate = useServerFn(generateStudyMaterials);
  const extract = useServerFn(extractTextFromUpload);
  const save = useServerFn(saveStudySession);
  const qc = useQueryClient();

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<StudyResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (notes.trim().length < 10) { toast.error("Please add at least a few sentences."); return; }
    setLoading(true); setResult(null);
    try {
      const r = await generate({ data: { notes } });
      setResult(r);
      try {
        await save({ data: { title: r.title || notes.slice(0, 40), notesPreview: notes.slice(0, 160), result: r } });
        qc.invalidateQueries({ queryKey: ["sessions"] });
      } catch { /* saving is best-effort */ }
      toast.success("Study materials ready!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally { setLoading(false); }
  };

  const handleFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { toast.error("File must be under 10 MB."); return; }
    setUploading(true); setUploadProgress(20);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onprogress = (e) => e.lengthComputable && setUploadProgress(20 + (e.loaded / e.total) * 30);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Read failed"));
        reader.readAsDataURL(file);
      });
      setUploadProgress(60);
      const { text } = await extract({ data: { dataUrl, mimeType: file.type } });
      setUploadProgress(100);
      setNotes(text);
      toast.success(`Extracted ${text.length.toLocaleString()} characters`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't read that file");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pb-20 md:pb-8">
      <Toaster richColors position="top-center" />
      <AppHeader />
      <main className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6">
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Turn notes into <span className="text-primary">study gold</span>
          </h2>
          <p className="text-sm text-muted-foreground">Paste text or upload a PDF/image of your notes.</p>
        </motion.section>

        <Card className="shadow-lg border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Your notes</CardTitle>
            <input
              ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
            />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading || loading} className="gap-1.5 min-h-9">
              <Upload className="w-3.5 h-3.5" /> Upload
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <AnimatePresence>
              {uploading && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="rounded-md border bg-muted/40 p-3">
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <FileText className="w-4 h-4 text-primary" /> Extracting text…
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </motion.div>
              )}
            </AnimatePresence>
            <Textarea
              placeholder="Paste your lecture notes, textbook excerpt, or any study material here..."
              value={notes} onChange={(e) => setNotes(e.target.value)}
              className="min-h-[200px] md:min-h-[220px] text-sm resize-y"
              disabled={loading || uploading}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">{notes.length.toLocaleString()} characters</span>
              <div className="flex gap-2 w-full sm:w-auto">
                {notes && (
                  <Button variant="ghost" size="lg" onClick={() => setNotes("")} disabled={loading} className="min-h-11">
                    <X className="w-4 h-4" />
                  </Button>
                )}
                <motion.div whileTap={{ scale: 0.97 }} className="flex-1 sm:flex-none">
                  <Button size="lg" onClick={handleGenerate} disabled={loading || uploading} className="gap-2 w-full min-h-11">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {loading ? "Generating..." : "Generate"}
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>

        <AnimatePresence mode="wait">
          {loading && <motion.div key="skel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><StudySkeleton /></motion.div>}
          {result && !loading && <StudyView key="result" result={result} />}
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}
