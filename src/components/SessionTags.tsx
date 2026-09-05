import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface SessionTagsProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  suggestedTags?: string[];
}

const DEFAULT_TAGS = ["Biology", "Chemistry", "Physics", "Math", "History", "Literature", "Review", "Important", "Quiz", "Exam"];

export function SessionTags({ tags, onTagsChange, suggestedTags = [] }: SessionTagsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTag, setNewTag] = useState("");

  const availableSuggestions = [...suggestedTags, ...DEFAULT_TAGS].filter(
    tag => !tags.includes(tag)
  );

  const addTag = (tag: string) => {
    if (!tags.includes(tag) && tag.trim()) {
      onTagsChange([...tags, tag.trim()]);
      setNewTag("");
      setIsAdding(false);
    }
  };

  const removeTag = (tag: string) => {
    onTagsChange(tags.filter(t => t !== tag));
  };

  return (
    <div className="space-y-3">
      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, idx) => (
          <motion.div
            key={tag}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="hover:bg-primary/20 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Add Tag Input */}
      {isAdding ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2"
        >
          <Input
            type="text"
            placeholder="Enter tag name..."
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") addTag(newTag);
              if (e.key === "Escape") setIsAdding(false);
            }}
            autoFocus
            className="text-sm"
          />
          <Button
            size="sm"
            onClick={() => addTag(newTag)}
            variant="default"
          >
            Add
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAdding(false)}
          >
            Cancel
          </Button>
        </motion.div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsAdding(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Tag
        </Button>
      )}

      {/* Suggested Tags */}
      {availableSuggestions.length > 0 && !isAdding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-2"
        >
          <p className="text-xs text-muted-foreground mb-2">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.slice(0, 5).map(tag => (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                className="px-2 py-1 text-xs rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}