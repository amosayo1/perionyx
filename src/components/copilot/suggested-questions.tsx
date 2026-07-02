"use client";

import { useState } from "react";
import { suggestedQuestions } from "./data";
import { PromptCard } from "./prompt-card";

export function SuggestedQuestions() {
  const [selected, setSelected] = useState<string | null>(null);

  const handleClick = (text: string) => {
    setSelected(text);
  };

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Suggested Questions</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Ask the Copilot about your enterprise operations</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {suggestedQuestions.map((q) => (
          <PromptCard key={q.id} text={q.text} onClick={() => handleClick(q.text)} />
        ))}
      </div>
    </div>
  );
}
