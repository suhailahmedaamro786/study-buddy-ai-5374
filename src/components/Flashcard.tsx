import { useState } from "react";
import { motion } from "framer-motion";

export function Flashcard({ index, question, answer }: { index: number; question: string; answer: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="relative w-full h-40 [perspective:1000px]">
      <motion.button
        onClick={() => setFlipped((f) => !f)}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 w-full h-full [transform-style:preserve-3d] cursor-pointer text-left"
        aria-label="Flip card"
      >
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-lg border-2 border-primary/20 bg-card p-4 flex flex-col shadow-sm">
          <span className="text-xs text-muted-foreground">Question {index + 1} · tap to flip</span>
          <p className="mt-2 text-sm font-medium flex-1">{question}</p>
        </div>
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-lg border-2 border-primary bg-primary/10 p-4 flex flex-col shadow-sm">
          <span className="text-xs text-primary font-medium">Answer</span>
          <p className="mt-2 text-sm flex-1">{answer}</p>
        </div>
      </motion.button>
    </div>
  );
}
