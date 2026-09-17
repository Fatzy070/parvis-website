import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CheckCircle2, Layers } from "lucide-react";
import EnrollmentSettings from "../components/EnrollmentSettings";
import { useLearning, useSession } from "../queries";
import {
  PageHeading,
  CourseCard,
  EmptyState,
  ErrorState,
  Skeleton,
  Progress,
  Button,
} from "../components/UI";
import SavedLearning from "../components/SavedLearning";
export default function MyLearning({ tutorials = false }) {
  const learning = useLearning();
  const session = useSession();
  const [filter, setFilter] = useState("all");
  const [manage, setManage] = useState(false);
  const items = learning.data?.pages.flatMap((page) => page.items) || [];
  const stats = learning.data?.pages[0].stats;
  const active = items.find((e) => !e.completed);
  const filtered = items.filter(
    (e) =>
      filter === "all" || (filter === "completed" ? e.completed : !e.completed),
  );
  return (
    <div className="container section">
      <PageHeading
        eyebrow={tutorials ? "YOUR LESSON WORKSPACE" : "KEEP YOUR MOMENTUM"}
        title={
          tutorials
            ? "A little practice. Real progress."
            : `Welcome back, ${session.data?.firstName || "learner"}.`
        }
        action={
          <Link className="button secondary" to="/courses">
            Explore courses <ArrowRight size={17} />
          </Link>
        }
      >
        {tutorials
          ? "Open an enrolled tutorial in the focused player and continue from your saved position."
          : "Your next step is right where you left it."}
      </PageHeading>
      {learning.isPending ? (
        <Skeleton cards={3} />
      ) : learning.isError ? (
        <ErrorState error={learning.error} retry={learning.refetch} />
      ) : (
        <>
          {!tutorials && (
            <div className="stats-grid">
              {[
                [BookOpen, stats.enrolled, "Courses in your library"],
                [Layers, stats.lessonsCompleted, "Lessons completed"],
                [CheckCircle2, stats.completed, "Courses completed"],
              ].map(([Icon, value, label]) => (
                <div className="stat" key={label}>
                  <Icon size={21} />
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          )}
          {active && (
            <section className="continue-panel">
              <div className="continue-copy">
                <p className="eyebrow">PICK UP WHERE YOU LEFT OFF</p>
                <h2>{active.course.title}</h2>
                <p className="muted">
                  {active.completedLessons.length} of {active.totalLessons}{" "}
                  lessons complete
                  {active.lastActivityAt &&
                    ` · Last opened ${new Date(active.lastActivityAt).toLocaleDateString()}`}
                </p>
                <Progress value={active.progress} />
                <Link
                  className="button"
                  to={`/learn/${active.courseId}?lesson=${active.lastLessonId || ""}`}
                >
                  Continue learning <ArrowRight size={18} />
                </Link>
              </div>
              {active.course.thumbnail && (
                <img
                  src={active.course.thumbnail}
                  alt=""
                  width="480"
                  height="270"
                />
              )}
            </section>
          )}
          <div className="section-heading">
            <div>
              <h2>
                {tutorials
                  ? "Your enrolled tutorials"
                  : "Your learning library"}
              </h2>
              {items.length > 0 && (
                <button
                  className="text-link manage-button"
                  onClick={() => setManage(!manage)}
                >
                  {manage ? "Done managing" : "Manage enrollments"}
                </button>
              )}
            </div>
            <div className="filters compact">
              {["all", "active", "completed"].map((value) => (
                <button
                  key={value}
                  className={`chip ${filter === value ? "selected" : ""}`}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {value[0].toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {manage && (
            <div className="enrollment-settings">
              {items.map((enrollment) => (
                <EnrollmentSettings
                  key={enrollment.id}
                  enrollment={enrollment}
                />
              ))}
            </div>
          )}
          {filtered.length ? (
            <div className="course-grid">
              {filtered.map((enrollment) => (
                <CourseCard
                  key={enrollment.id}
                  course={enrollment.course}
                  enrollment={enrollment}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title={
                items.length
                  ? `No ${filter} courses in this part of your library`
                  : "Your next chapter is waiting"
              }
              to="/courses"
            >
              {items.length
                ? "Keep learning, or load more of your library below."
                : "Find a course that sparks your curiosity. It will be waiting for you here."}
            </EmptyState>
          )}
          {learning.hasNextPage && (
            <div className="pagination">
              <Button
                className="secondary"
                pending={learning.isFetchingNextPage}
                onClick={() => learning.fetchNextPage()}
              >
                Load more courses
              </Button>
            </div>
          )}
          {!tutorials && <SavedLearning />}
        </>
      )}
    </div>
  );
}
