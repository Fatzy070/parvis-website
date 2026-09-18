import { useState } from "react";
import {
  BookOpenText,
  BrainCircuit,
  Code2,
  Check,
  X,
  RotateCcw,
} from "lucide-react";
import {
  useGeneratePracticeQuiz,
  useGeneratePractical,
  useGenerateStudyNotes,
  usePracticeAttempt,
  usePracticalAttempt,
  useSaveStudyNote,
} from "../queries";
import { Button, FormError } from "./UI";

function Notes({ courseId, lessonId }) {
  const generate = useGenerateStudyNotes(courseId, lessonId);
  const save = useSaveStudyNote();
  const [draft, setDraft] = useState(null);
  const create = () => generate.mutate(undefined, { onSuccess: setDraft });
  return (
    <div className="premium-tool">
      <h3>AI Study Notes</h3>
      <p className="muted">
        Create structured revision notes, then edit them into your own study
        resource.
      </p>
      {!draft && (
        <Button pending={generate.isPending} onClick={create}>
          Generate Study Notes
        </Button>
      )}
      <FormError error={generate.error || save.error} />
      {generate.isPending && <p role="status">Creating your study notes…</p>}
      {draft && (
        <form
          className="form-stack"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate({
              courseId,
              lessonId,
              title: draft.title,
              content: draft.content,
              generatedByAI: true,
              aiModel: draft.aiModel,
              promptVersion: draft.promptVersion,
            });
          }}
        >
          <label>
            Note title
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </label>
          <label>
            Study notes
            <textarea
              className="note-editor"
              rows="18"
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            />
          </label>
          {save.isSuccess && (
            <p className="notice" role="status">
              Study note saved.
            </p>
          )}
          <Button pending={save.isPending}>Save to My Learning</Button>
        </form>
      )}
    </div>
  );
}
function Practice({ courseId, lessonId }) {
  const generate = useGeneratePracticeQuiz(courseId, lessonId);
  const grade = usePracticeAttempt();
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setCount] = useState(5);
  const [answers, setAnswers] = useState([]);
  const quiz = generate.data?.quiz;
  return (
    <div className="premium-tool">
      <h3>Personal Practice Quiz</h3>
      <p className="muted">
        Private AI practice. Results do not affect an official LearnHub grade.
      </p>
      {!quiz && (
        <div className="generation-controls">
          <label>
            Difficulty
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option>easy</option>
              <option>medium</option>
              <option>hard</option>
            </select>
          </label>
          <label>
            Questions
            <select
              value={questionCount}
              onChange={(e) => setCount(Number(e.target.value))}
            >
              <option>5</option>
              <option>10</option>
              <option>15</option>
            </select>
          </label>
          <Button
            pending={generate.isPending}
            onClick={() => generate.mutate({ difficulty, questionCount })}
          >
            Generate Quiz
          </Button>
        </div>
      )}
      <FormError error={generate.error || grade.error} />
      {generate.isPending && <p role="status">Building your practice quiz…</p>}
      {quiz && (
        <form
          className="practice-quiz"
          onSubmit={(e) => {
            e.preventDefault();
            grade.mutate({ id: quiz.id, answers });
          }}
        >
          <h4>{quiz.title}</h4>
          {quiz.questions.map((q, index) => (
            <fieldset key={q.prompt}>
              <legend>
                {index + 1}. {q.prompt}
              </legend>
              {grade.data ? (
                <div className="review-block stack">
                  <div
                    className={
                      grade.data.attempt.results[index].correct
                        ? "review-item correct"
                        : "review-item incorrect"
                    }
                  >
                    <p
                      className="eyebrow"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {grade.data.attempt.results[index].correct ? (
                        <>
                          <Check size={16} /> Correct
                        </>
                      ) : (
                        <>
                          <X size={16} /> Incorrect
                        </>
                      )}
                    </p>
                    <strong>Your answer:</strong>
                    <p>{q.options[answers[index]] || "Not answered"}</p>
                  </div>
                  {!grade.data.attempt.results[index].correct && (
                    <div className="notice" style={{ marginBottom: "10px" }}>
                      <p
                        className="eyebrow"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Check size={16} /> Correct answer
                      </p>
                      <p>
                        {
                          q.options[
                            grade.data.attempt.results[index].correctIndex
                          ]
                        }
                      </p>
                    </div>
                  )}
                  {grade.data.attempt.results[index].explanation && (
                    <div className="notice">
                      <p className="eyebrow">Explanation</p>
                      <p>{grade.data.attempt.results[index].explanation}</p>
                    </div>
                  )}
                </div>
              ) : (
                q.options.map((option, optionIndex) => (
                  <label key={option}>
                    <input
                      type="radio"
                      name={`practice-${index}`}
                      required
                      checked={answers[index] === optionIndex}
                      disabled={grade.isPending}
                      onChange={() => {
                        const next = [...answers];
                        next[index] = optionIndex;
                        setAnswers(next);
                      }}
                    />
                    {option}
                  </label>
                ))
              )}
            </fieldset>
          ))}
          <Button pending={grade.isPending}>Check my answers</Button>
          {grade.data && (
            <div className="practice-result" role="status">
              <strong>{grade.data.attempt.score}%</strong>
              <span>
                {grade.data.attempt.correct} of {grade.data.attempt.total}{" "}
                correct
              </span>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
function Practical({ courseId, lessonId }) {
  const generate = useGeneratePractical(courseId, lessonId);
  const review = usePracticalAttempt();
  const [difficulty, setDifficulty] = useState("medium");
  const [submission, setSubmission] = useState("");
  const exercise = generate.data?.exercise;
  return (
    <div className="premium-tool">
      <h3>Practical Exercise</h3>
      <p className="muted">
        Apply the lesson with a hands-on code or text response. LearnHub never
        executes submitted code.
      </p>
      {!exercise && (
        <div className="generation-controls">
          <label>
            Difficulty
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option>easy</option>
              <option>medium</option>
              <option>hard</option>
            </select>
          </label>
          <Button
            pending={generate.isPending}
            onClick={() => generate.mutate({ difficulty })}
          >
            Prepare Exercise
          </Button>
        </div>
      )}
      <FormError error={generate.error || review.error} />
      {generate.isPending && (
        <p role="status">Preparing a practical exercise…</p>
      )}
      {exercise && (
        <div className="practical-work">
          <h4>{exercise.title}</h4>
          <p>{exercise.task}</p>
          <ul>
            {exercise.requirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <label>
            Your solution
            <textarea
              className="code-submission"
              rows="14"
              minLength="10"
              maxLength="20000"
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
            />
          </label>
          <Button
            disabled={submission.trim().length < 10}
            pending={review.isPending}
            onClick={() =>
              review.mutate({
                id: exercise.id,
                submission,
                submissionType: "code",
              })
            }
          >
            Review my solution
          </Button>
          {review.isPending && <p role="status">Reviewing your solution…</p>}
          {review.data && (
            <div className="feedback-card" role="status">
              <strong>
                Practice score: {review.data.attempt.feedback.score}%
              </strong>
              <h5>What you did well</h5>
              <ul>
                {review.data.attempt.feedback.strengths.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <h5>Next step</h5>
              <p>{review.data.attempt.feedback.nextStep}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default function PremiumLearningTools({ courseId, lessonId }) {
  const [tool, setTool] = useState("notes");
  return (
    <section className="premium-learning">
      <div className="premium-tabs" role="tablist" aria-label="Learning tools">
        {[
          ["notes", "Study Notes", BookOpenText],
          ["quiz", "Practice Quiz", BrainCircuit],
          ["practical", "Practical", Code2],
        ].map(([value, label, Icon]) => (
          <button
            key={value}
            role="tab"
            aria-selected={tool === value}
            onClick={() => setTool(value)}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </div>
      {tool === "notes" ? (
        <Notes courseId={courseId} lessonId={lessonId} />
      ) : tool === "quiz" ? (
        <Practice courseId={courseId} lessonId={lessonId} />
      ) : (
        <Practical courseId={courseId} lessonId={lessonId} />
      )}
    </section>
  );
}
