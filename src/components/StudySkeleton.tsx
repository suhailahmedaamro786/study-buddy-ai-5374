import { motion } from "framer-motion";

export function StudySkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <SkelCard className="md:col-span-2" lines={4} title="Summary" />
      <SkelCard lines={5} title="Flashcards" />
      <SkelCard lines={5} title="Quiz" />
    </div>
  );
}

function SkelCard({ lines, title, className = "" }: { lines: number; title: string; className?: string }) {
  return (
    <div className={`rounded-xl border bg-card p-6 ${className}`}>
      <div className="text-sm font-medium mb-4">{title}</div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <motion.div key={i}
            className="h-3 rounded bg-muted"
            style={{ width: `${60 + Math.random() * 35}%` }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </div>
    </div>
  );
}
