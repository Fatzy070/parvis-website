import { useState } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { useQuiz, useQuizAttempt } from "../queries";
import { Button, EmptyState, ErrorState, FormError, Skeleton } from "./UI";



function QuizForm({ quiz, attempts, courseId, lessonId, reload }) {
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const submit = useQuizAttempt(courseId, lessonId);
  const result = submit.data?.result;
  return (
    <section className="quiz">
      <p className="eyebrow">CHECK YOUR UNDERSTANDING</p>
      <h2>{quiz.title}</h2>
      <p className="muted">
        {quiz.questions.length} questions · {quiz.passingPercent}% to pass ·
        Take your time.
      </p>
      {result ? (
        <div className="quiz-result" role="status">
          <CheckCircle2 size={34} />
          <strong>{result.score}%</strong>
          <h3>
            {result.passed
              ? "Nicely done. Keep building on it."
              : "Every attempt is a step forward."}
          </h3>
          <p>
            {result.correct} of {result.total} correct.{" "}
            {result.passed
              ? "You passed this quiz."
              : "Revisit the lessons and try again when you’re ready."}
          </p>
          <Button
            className="secondary"
            onClick={() => {
              submit.reset();
              setAnswers({});
              setRequestId(crypto.randomUUID());
              setStarted(false);
            }}
          >
            <RotateCcw size={16} />
            Try again
          </Button>
        </div>
      ) : !started ? (
        <Button
          onClick={() => setStarted(true)}
          disabled={!quiz.questions.length}
        >
          Start quiz
        </Button>
      ) : (
        <form
          className="form-stack"
          onSubmit={(event) => {
            event.preventDefault();
            submit.mutate({
              quizId: quiz.id,
              revision: quiz.revision,
              requestId,
              answers: quiz.questions.map((_, index) => answers[index]),
            });
          }}
        >
          {quiz.questions.map((question, index) => (
            <fieldset className="question" key={question.id}>
              <legend>
                {index + 1}. {question.prompt}
              </legend>
              {question.options.map((option, optionIndex) => (
                <label
                  className={`answer-option ${answers[index] === optionIndex ? "chosen" : ""}`}
                  key={optionIndex}
                >
                  <input
                    required
                    type="radio"
                    name={`question-${question.id}`}
                    value={optionIndex}
                    checked={answers[index] === optionIndex}
                    onChange={() =>
                      setAnswers({ ...answers, [index]: optionIndex })
                    }
                    disabled={submit.isPending}
                  />
                  {option}
                </label>
              ))}
            </fieldset>
          ))}
          <FormError error={submit.error} />
          {submit.error?.code === "QUIZ_UPDATED" && (
            <Button className="secondary" type="button" onClick={reload}>
              Reload quiz
            </Button>
          )}
          <Button
            type="submit"
            pending={submit.isPending}
            disabled={Object.keys(answers).length !== quiz.questions.length}
          >
            Submit answers
          </Button>
        </form>
      )}
      {attempts.length > 0 && (
        <div className="attempt-history">
          <h3>Your recent attempts</h3>
          {attempts.map((attempt) => (
            <div className="row-between" key={attempt._id}>
              <time dateTime={attempt.createdAt}>
                {new Date(attempt.createdAt).toLocaleString()}
              </time>
              <span>
                {attempt.score}% ·{" "}
                {attempt.passed ? "Passed" : "Keep practicing"}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
export default function Quiz({ courseId, lessonId }) {
  const query = useQuiz(courseId, lessonId);
  if (query.isPending) return <Skeleton cards={1} />;
  if (query.isError)
    return <ErrorState error={query.error} retry={query.refetch} />;
  if (!query.data.quiz)
    return (
      <EmptyState title="No quiz here yet">
        There isn’t a published quiz for this {lessonId ? "lesson" : "course"}.
        You can keep learning and join the discussion.
      </EmptyState>
    );
  return (
    <QuizForm
      key={`${query.data.quiz.id}-${query.data.quiz.revision}`}
      quiz={query.data.quiz}
      attempts={query.data.attempts}
      courseId={courseId}
      lessonId={lessonId}
      reload={query.refetch}
    />
  );
}
