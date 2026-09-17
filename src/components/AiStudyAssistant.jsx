import { useEffect, useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { useAiExplain, useAiSummary } from "../queries";
import { Button, FormError } from "./UI";
import PremiumLearningTools from "./PremiumLearningTools";

const modes = [
  ["short", "Short summary"],
  ["detailed", "Detailed summary"],
  ["key_points", "Key points"],
  ["simple", "Explain simply"],
];

export default function AiStudyAssistant({ courseId, lessonId }) {
  const summary = useAiSummary(courseId, lessonId);
  const explain = useAiExplain(courseId, lessonId);
  const [result, setResult] = useState(null);
  const [question, setQuestion] = useState("");
  useEffect(() => {
    setResult(null);
    setQuestion("");
    summary.reset();
    explain.reset();
    // Mutation reset functions are stable; the lesson identity drives this reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, lessonId]);

  const requestSummary = (mode) => {
    summary.mutate(mode, { onSuccess: (data) => setResult(data) });
  };
  const ask = (event) => {
    event.preventDefault();
    explain.mutate(question, {
      onSuccess: (data) => {
        setResult({ ...data, mode: "question" });
        setQuestion("");
      },
    });
  };
  const pending = summary.isPending || explain.isPending;
  const error = summary.error || explain.error;
  return (
    <section className="ai-assistant" aria-labelledby="ai-assistant-title">
      <div className="ai-heading">
        <div>
          <p className="eyebrow">
            <Sparkles size={14} /> AI STUDY ASSISTANT
          </p>
          <h2 id="ai-assistant-title">Understand this lesson your way</h2>
        </div>
        <span className="ai-label">AI-generated</span>
      </div>
      <div className="ai-mode-grid" aria-label="Summary options">
        {modes.map(([mode, label]) => (
          <Button
            key={mode}
            className="secondary"
            disabled={pending}
            onClick={() => requestSummary(mode)}
          >
            {label}
          </Button>
        ))}
      </div>
      <form className="ai-question" onSubmit={ask}>
        <label htmlFor="lesson-ai-question">Ask about this lesson</label>
        <div>
          <textarea
            id="lesson-ai-question"
            value={question}
            minLength={5}
            maxLength={600}
            rows={3}
            placeholder="What would you like explained?"
            onChange={(event) => setQuestion(event.target.value)}
            disabled={pending}
          />
          <Button
            pending={explain.isPending}
            disabled={pending || question.trim().length < 5}
          >
            <Send size={16} /> Ask AI
          </Button>
        </div>
      </form>
      <FormError error={error} />
      {pending && (
        <div className="ai-loading" role="status">
          Generating a lesson-focused response…
        </div>
      )}
      {result && (
        <article className="ai-result" aria-live="polite">
          <div className="ai-result-meta">
            <strong>
              {result.mode === "question"
                ? "Lesson answer"
                : modes.find(([mode]) => mode === result.mode)?.[1]}
            </strong>
            {result.cached && <span>Saved result</span>}
          </div>
          <div className="ai-content">{result.content}</div>
        </article>
      )}
      <p className="ai-disclaimer">
        AI-generated explanations may occasionally contain mistakes. Check
        important details against the lesson.
      </p>
      <PremiumLearningTools courseId={courseId} lessonId={lessonId} />
    </section>
  );
}
