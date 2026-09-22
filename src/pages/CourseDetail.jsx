import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ListVideo,
  Play,
  Check,
  Youtube,
} from "lucide-react";
import { useCourse, useSession, useEnrollment, useEnroll } from "../queries";
import {
  Button,
  EmptyState,
  ErrorState,
  FormError,
  PageSkeleton,
  Progress,
} from "../components/UI";
import { SEO } from "../components/SEO";

export default function CourseDetail() {
  const { id } = useParams();
  const courseQuery = useCourse(id);
  const session = useSession();
  const enrollmentQuery = useEnrollment(id, Boolean(session.data));
  const enroll = useEnroll(id);
  const navigate = useNavigate();
  if (courseQuery.isPending) return <PageSkeleton />;
  if (courseQuery.isError)
    return (
      <div className="container section">
        <ErrorState error={courseQuery.error} retry={courseQuery.refetch} />
      </div>
    );
  const { course } = courseQuery.data;
  const enrollment = enrollmentQuery.data?.enrollment;
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description || course.title,
    "provider": {
      "@type": "Organization",
      "name": course.author || "Parvis",
      "sameAs": "https://www.parvis.com.ng"
    }
  };

  return (
    <div className="container section">
      <SEO 
        title={`${course.title} | Parvis`}
        description={course.description?.substring(0, 160) || "Start learning this course on Parvis."}
        canonical={`/courses/${id}`}
        ogImage={course.thumbnail}
        structuredData={structuredData}
      />
      <Link className="back-link" to="/courses">
        <ArrowLeft size={16} />
        Back to courses
      </Link>
      <div className="detail-grid">
        <section>
          <p className="eyebrow">
            {course.category} /{" "}
            {course.source === "video" ? "VIDEO TUTORIAL" : "CURATED COURSE"}
          </p>
          <h1 className="detail-title">{course.title}</h1>
          <p className="muted">
            Created by <strong>{course.author}</strong>
          </p>
          <div className="metadata">
            <span>
              <ListVideo size={18} />
              {course.videoCount} available lessons
            </span>
            <span>
              <Youtube size={18} />
              Learn with YouTube
            </span>
          </div>
          <h2>About this course</h2>
          <p className="description">
            {course.description ||
              "The creator has not provided a description for this course."}
          </p>
        </section>
        <aside className="enroll-panel">
          {course.thumbnail && (
            <img src={course.thumbnail} alt="" width="480" height="270" />
          )}
          <div className="panel-content">
            <h2>
              {enrollment
                ? "Make your next step count."
                : "Make time for something new."}
            </h2>
            <p className="muted">
              A focused player, a clear curriculum, and a place to keep your
              progress.
            </p>
            {session.error && (
              <ErrorState error={session.error} retry={session.refetch} />
            )}
            {enrollmentQuery.isError && (
              <ErrorState
                error={enrollmentQuery.error}
                retry={enrollmentQuery.refetch}
              />
            )}
            {enrollment && <Progress value={enrollment.progress} />}
            <FormError error={enroll.error} />
            {enrollment ? (
              <Link
                className="button full"
                to={`/learn/${id}${enrollment.lastLessonId ? `?lesson=${enrollment.lastLessonId}` : ""}`}
              >
                Continue learning <ArrowRight size={18} />
              </Link>
            ) : (
              <Button
                className="full"
                pending={
                  enroll.isPending ||
                  session.isPending ||
                  (Boolean(session.data) && enrollmentQuery.isPending)
                }
                disabled={
                  !course.lessons.length ||
                  enrollmentQuery.isError ||
                  session.isError
                }
                onClick={() =>
                  session.data
                    ? enroll.mutate(undefined, {
                        onSuccess: () => navigate(`/learn/${id}`),
                      })
                    : navigate("/login", { state: { from: `/courses/${id}` } })
                }
              >
                {session.data
                  ? "Enroll in this course"
                  : "Sign in to start learning"}
                <ArrowRight size={18} />
              </Button>
            )}
            <p className="fine-print">
              Learn at your own pace. Return whenever you’re ready.
            </p>
          </div>
        </aside>
      </div>
      <section className="curriculum-section">
        <div className="section-heading">
          <h2>Your learning path</h2>
          <span className="muted">{course.lessons.length} lessons</span>
        </div>
        {course.lessons.length ? (
          <ol className="curriculum-list">
            {course.lessons.map((lesson, index) => (
              <li key={lesson.videoId}>
                <span className="lesson-number">
                  {enrollment?.completedLessons.includes(lesson.videoId) ? (
                    <Check size={18} />
                  ) : (
                    String(index + 1).padStart(2, "0")
                  )}
                </span>
                <div>
                  <h3>{lesson.title}</h3>
                  <span className="muted">
                    {lesson.duration?.replace("PT", "").toLowerCase() ||
                      "Video lesson"}
                  </span>
                </div>
                {enrollment ? (
                  <Link
                    className="icon-button"
                    aria-label={`Watch ${lesson.title}`}
                    to={`/learn/${id}?lesson=${lesson.videoId}`}
                  >
                    <Play size={18} />
                  </Link>
                ) : (
                  <Play size={17} className="muted" aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState title="No available lessons">
            The creator may have made this content private or removed it.
          </EmptyState>
        )}
      </section>
    </div>
  );
}
