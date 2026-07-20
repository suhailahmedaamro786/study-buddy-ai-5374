import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — StudyBuddy" }] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated!");
      navigate({ to: "/app" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-background to-primary/5">
      <Toaster richColors position="top-center" />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card>
          <CardHeader><CardTitle>Set a new password</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="pw">New password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 pl-9" />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
