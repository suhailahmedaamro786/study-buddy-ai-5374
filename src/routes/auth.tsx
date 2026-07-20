import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Loader2, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — StudyBuddy" }, { name: "description", content: "Sign in to StudyBuddy to save your study materials." }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/app" }); });
  }, [navigate]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Account created! You're signed in.");
        navigate({ to: "/app" });
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/app" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset email sent!");
        setMode("login");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) throw result.error;
      if (result.redirected) return;
      navigate({ to: "/app" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-background to-primary/5">
      <Toaster richColors position="top-center" />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-semibold text-lg">StudyBuddy</span>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{mode === "forgot" ? "Reset password" : "Welcome"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode !== "forgot" && (
              <>
                <Button onClick={handleGoogle} disabled={loading} variant="outline" className="w-full h-11 gap-2">
                  <GoogleIcon /> Continue with Google
                </Button>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              </>
            )}
            <Tabs value={mode === "forgot" ? "login" : mode} onValueChange={(v) => setMode(v as "login" | "signup")}>
              {mode !== "forgot" && (
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="login">Log in</TabsTrigger>
                  <TabsTrigger value="signup">Sign up</TabsTrigger>
                </TabsList>
              )}
              <TabsContent value={mode === "forgot" ? "login" : mode} className="mt-4">
                <form onSubmit={handleEmail} className="space-y-3">
                  {mode === "signup" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="h-11" />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 pl-9" />
                    </div>
                  </div>
                  {mode !== "forgot" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-11 pl-9" />
                      </div>
                    </div>
                  )}
                  <Button type="submit" disabled={loading} className="w-full h-11">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                      mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset email" : "Log in"}
                  </Button>
                  {mode === "login" && (
                    <button type="button" onClick={() => setMode("forgot")} className="text-sm text-primary hover:underline w-full text-center">
                      Forgot password?
                    </button>
                  )}
                  {mode === "forgot" && (
                    <button type="button" onClick={() => setMode("login")} className="text-sm text-muted-foreground hover:underline w-full text-center">
                      Back to log in
                    </button>
                  )}
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2c-2 1.5-4.6 2.4-7.3 2.4-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.2 5.2C41.4 35.4 44 30.1 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
  );
}
