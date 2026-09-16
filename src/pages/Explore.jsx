import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, ArrowLeft, ArrowRight } from "lucide-react";
import { useCourses } from "../queries";
import {
  PageHeading,
  CourseCard,
  Skeleton,
  ErrorState,
  EmptyState,
  Button,
} from "../components/UI";
export default function Explore() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const category = params.get("category") || "";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const [input, setInput] = useState(q);
  const courses = useCourses({ q, category, page });
  const change = (values) =>
    setParams(
      Object.fromEntries(
        Object.entries({ q, category, ...values }).filter(([, value]) => value),
      ),
    );
  return (
    <div className="container section">
      <PageHeading
        eyebrow="THE COURSE COLLECTION"
        title="Where will curiosity take you?"
      >
        A focused collection of programming courses. Pick a subject and take
        your next step.
      </PageHeading>
      <form
        className="search-form"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          change({ q: input.trim(), page: 1 });
        }}
      >
        <Search aria-hidden="true" size={20} />
        <label className="sr-only" htmlFor="course-search">
          Search courses
        </label>
        <input
          id="course-search"
          type="search"
          placeholder="Search a topic, course, or creator…"
          maxLength={120}
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <Button type="submit">Search</Button>
      </form>
      <div className="filters" aria-label="Filter by subject">
        {["", ...(courses.data?.categories || [])].map((item) => (
          <button
            key={item}
            className={category === item ? "chip selected" : "chip"}
            aria-pressed={category === item}
            onClick={() => change({ category: item, page: 1 })}
          >
            {item || "All subjects"}
          </button>
        ))}
      </div>
      {courses.isPending ? (
        <Skeleton cards={6} />
      ) : courses.isError ? (
        <ErrorState error={courses.error} retry={courses.refetch} />
      ) : (
        <>
          <div className="results-label" aria-live="polite">
            {courses.data.total}{" "}
            {courses.data.total === 1 ? "course" : "courses"}
            {q && ` for “${q}”`}
          </div>
          {courses.data.items.length ? (
            <div className="course-grid">
              {courses.data.items.map((course) => (
                <CourseCard course={course} key={course.id} />
              ))}
            </div>
          ) : (
            <EmptyState title="No courses found">
              Try another topic or choose a different subject.
            </EmptyState>
          )}
          <div className="pagination">
            {page > 1 && (
              <Button
                className="secondary"
                onClick={() => change({ page: page - 1 })}
              >
                <ArrowLeft size={16} />
                Previous
              </Button>
            )}
            {courses.data.hasMore && (
              <Button onClick={() => change({ page: page + 1 })}>
                Next page
                <ArrowRight size={16} />
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
