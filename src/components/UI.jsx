import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  RefreshCw,
  AlertCircle,
  Check,
  LoaderCircle,
} from "lucide-react";
export function Button({
  children,
  pending,
  className = "",
  disabled,
  ...props
}) {
  return (
    <button
      className={`button ${className}`}
      disabled={disabled || pending}
      {...props}
    >
      {pending && (
        <LoaderCircle size={17} className="spin" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
export function EmptyState({ title, children, action, to }) {
  return (
    <div className="empty-state">
      <BookOpen size={30} aria-hidden="true" />
      <h3>{title}</h3>
      <p>{children}</p>
      {to && (
        <Link className="button" to={to}>
          {action || "Explore courses"}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
export function ErrorState({ error, retry }) {
  return (
    <div className="error-state" role="alert">
      <AlertCircle size={22} aria-hidden="true" />
      <div>
        <h3>We couldn’t load this</h3>
        <p>{error?.message || "Please try again in a moment."}</p>
        {retry && (
          <Button className="secondary" onClick={retry}>
            <RefreshCw size={15} />
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
export function FormError({ error }) {
  return error ? (
    <div className="form-error" role="alert">
      {error.message}
      {error.fields && (
        <ul>
          {Object.entries(error.fields).map(([key, message]) => (
            <li key={key}>
              {key}: {message}
            </li>
          ))}
        </ul>
      )}
    </div>
  ) : null;
}
export function Skeleton({ cards = 3 }) {
  return (
    <div className="course-grid" role="status" aria-label="Loading content">
      {Array.from({ length: cards }, (_, index) => (
        <div className="skeleton-card" aria-hidden="true" key={index}>
          <div className="skeleton picture" />
          <div className="skeleton line" />
          <div className="skeleton line short" />
          <div className="skeleton line" />
        </div>
      ))}
    </div>
  );
}
export function PageSkeleton() {
  return (
    <div className="container section">
      <div className="skeleton title-skeleton" />
      <Skeleton />
    </div>
  );
}
export function Progress({ value, label = "Course progress" }) {
  return (
    <div className="progress-group">
      <div className="row-between">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <progress value={value} max="100" aria-label={label} />
    </div>
  );
}
export function CourseCard({ course, enrollment }) {
  const to = enrollment
    ? `/learn/${course.id}${enrollment.lastLessonId ? `?lesson=${enrollment.lastLessonId}` : ""}`
    : `/courses/${course.id}`;
  return (
    <article className="course-card">
      <Link to={to} className="course-image" tabIndex={-1} aria-hidden="true">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt=""
            loading="lazy"
            width="480"
            height="270"
          />
        ) : (
          <div className="image-empty">
            <BookOpen size={36} />
          </div>
        )}
        <span className="source-tag">
          YouTube {course.source === "video" ? "tutorial" : "course"}
        </span>
      </Link>
      <div className="course-body">
        <div className="eyebrow">{course.category}</div>
        <h3>
          <Link to={to}>{course.title}</Link>
        </h3>
        <p className="muted">{course.author}</p>
        {enrollment ? (
          <>
            <Progress value={enrollment.progress} />
            <div className="card-bottom">
              <span>
                {enrollment.completedLessons.length} of{" "}
                {enrollment.totalLessons} lessons
              </span>
              <Link to={to} aria-label={`Continue ${course.title}`}>
                {enrollment.completed ? (
                  <Check size={18} />
                ) : (
                  <ArrowRight size={18} />
                )}
              </Link>
            </div>
          </>
        ) : (
          <div className="card-bottom">
            <span>{course.videoCount} lessons</span>
            <Link to={to} aria-label={`View ${course.title}`}>
              <ArrowRight size={19} />
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
export function PageHeading({ eyebrow, title, children, action }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {children && <p className="muted">{children}</p>}
      </div>
      {action}
    </div>
  );
}
