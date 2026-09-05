import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listStudySessions } from "@/lib/study.functions";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/app/search")({
  component: SearchPage,
});

function SearchPage() {
  const { data: sessions = [] } = useQuery({
    queryKey: ["study-sessions"],
    queryFn: () => listStudySessions(),
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");

  // Extract all unique tags from sessions
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    sessions.forEach(s => {
      if (s.result?.title) tags.add(s.result.title);
    });
    return Array.from(tags).sort();
  }, [sessions]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const matchesSearch =
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.notes_preview.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTags =
        selectedTags.length === 0 || selectedTags.includes(session.result?.title);

      const sessionDate = new Date(session.created_at);
      const now = new Date();
      let matchesDate = true;

      if (dateFilter === "today") {
        matchesDate =
          sessionDate.toDateString() === now.toDateString();
      } else if (dateFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = sessionDate >= weekAgo;
      } else if (dateFilter === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = sessionDate >= monthAgo;
      }

      return matchesSearch && matchesTags && matchesDate;
    });
  }, [sessions, searchQuery, selectedTags, dateFilter]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Search Your Study Materials</h1>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title or notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="space-y-4">
            {/* Date Filter */}
            <div>
              <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                <Filter className="w-4 h-4 inline mr-2" />
                Date Filter
              </label>
              <div className="flex gap-2 flex-wrap">
                {(["all", "today", "week", "month"] as const).map(filter => (
                  <Button
                    key={filter}
                    variant={dateFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateFilter(filter)}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                  Topics
                </label>
                <div className="flex gap-2 flex-wrap">
                  {allTags.map(tag => (
                    <Button
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTag(tag)}
                      className="rounded-full"
                    >
                      {tag}
                      {selectedTags.includes(tag) && (
                        <X className="w-3 h-3 ml-1" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm text-muted-foreground mb-4">
            Found {filteredSessions.length} result{filteredSessions.length !== 1 ? "s" : ""}
          </p>

          {filteredSessions.length > 0 ? (
            <div className="grid gap-4">
              {filteredSessions.map((session, idx) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">{session.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(session.created_at).toLocaleDateString()} at{" "}
                          {new Date(session.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      {session.result?.title && (
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          {session.result.title}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground line-clamp-2">
                      {session.notes_preview}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No study sessions found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search filters
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}