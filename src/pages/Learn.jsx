import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Play, ListVideo } from "lucide-react";
import { useCourse, useEnrollment, useProgress } from "../queries";
import { SEO } from "../components/SEO";
import {
  Button,
  EmptyState,
  ErrorState,
  PageSkeleton,
  Progress,
} from "../components/UI";
import LessonPlayer from "../components/LessonPlayer";
import Discussion from "../components/Discussion";
import Quiz from "../components/Quiz";
import AiStudyAssistant from "../components/AiStudyAssistant";
export default function Learn() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const courseQuery = useCourse(id);
  const enrollmentQuery = useEnrollment(id);
  const progress = useProgress(id);
  const [tab, setTab] = useState("overview");
  const [scope, setScope] = useState("lesson");
  const [curriculumOpen, setCurriculumOpen] = useState(
    () => window.matchMedia("(min-width: 761px)").matches,
  );
  if (courseQuery.isPending || enrollmentQuery.isPending)
    return <PageSkeleton />;
  if (courseQuery.isError || enrollmentQuery.isError)
    return (
      <div className="container section">
        <ErrorState
          error={courseQuery.error || enrollmentQuery.error}
          retry={() => {
            courseQuery.refetch();
            enrollmentQuery.refetch();
          }}
        />
      </div>
    );
  const { course } = courseQuery.data;
  const enrollment = enrollmentQuery.data.enrollment;
  if (!enrollment)
    return (
      <div className="container section">
        <SEO title={`${course.title} | Parvis`} noindex />
        <EmptyState
          title="Make this course part of your journey"
          to={`/courses/${id}`}
          action="View course and enroll"
        >
          Enroll to save your progress, join discussions, and take quizzes.
        </EmptyState>
      </div>
    );
  const lessonId = params.get("lesson") || enrollment.lastLessonId;
  const lesson =
    course.lessons.find((item) => item.videoId === lessonId) ||
    course.lessons[0];
  if (!lesson)
    return (
      <div className="container section">
        <SEO title={`${course.title} | Parvis`} noindex />
        <EmptyState
          title="Lesson not found"
          to={`/courses/${id}`}
          action="Back to course"
        >
          This lesson doesn't exist in the curriculum.
        </EmptyState>
      </div>
    );
  const index = course.lessons.findIndex(
    (item) => item.videoId === lesson.videoId,
  );
  const completed = enrollment.completedLessons.includes(lesson.videoId);
  const save = (position) =>
    progress.mutate({ lessonId: lesson.videoId, position });
  const complete = () =>
    progress.mutate({ lessonId: lesson.videoId, completed: true });
  const selectLesson = (videoId) => {
    setParams({ lesson: videoId });
  };
  return (
    <div className="learning-container">
      <SEO title={`${lesson.title} - ${course.title} | Parvis`} noindex />
      <div className="learning-top">
        <Link className="back-link" to="/my-learning">
          <ArrowLeft size={16} />
          My learning
        </Link>
        <Link className="text-link" to={`/courses/${id}`}>
          Course details
        </Link>
      </div>
      <p className="eyebrow">{course.category} / YOUR LEARNING SPACE</p>
      <h1 className="learning-title">{course.title}</h1>
      <div className="learning-grid">
        <div className="learning-main">
          <LessonPlayer
            key={`${id}-${lesson.videoId}`}
            lesson={lesson}
            position={enrollment.positions[lesson.videoId]}
            save={save}
            complete={complete}
            pending={progress.isPending}
            error={progress.error}
          />
          <div className="lesson-heading">
            <div>
              <p className="eyebrow">
                LESSON {index + 1} OF {course.lessons.length}
              </p>
              <h2>{lesson.title}</h2>
            </div>
            <Button
              className={completed ? "secondary" : ""}
              pending={progress.isPending}
              disabled={completed}
              onClick={complete}
            >
              <Check size={17} />
              {completed ? "Completed" : "Mark complete"}
            </Button>
          </div>
          <div className="lesson-navigation">
            <Button
              className="secondary"
              disabled={index === 0}
              onClick={() => selectLesson(course.lessons[index - 1].videoId)}
            >
              <ArrowLeft size={16} />
              Previous
            </Button>
            {enrollment.completed && (
              <span className="completion-badge">
                <Check size={16} />
                Course completed
              </span>
            )}
            <Button
              className="secondary"
              disabled={index === course.lessons.length - 1}
              onClick={() => selectLesson(course.lessons[index + 1].videoId)}
            >
              Next lesson
              <ArrowRight size={16} />
            </Button>
          </div>
          <div className="tabs" aria-label="Lesson information">
            {["overview", "assistant", "discussion", "quiz"].map((value) => (
              <button
                key={value}
                className={tab === value ? "active" : ""}
                aria-pressed={tab === value}
                onClick={() => setTab(value)}
              >
                {value[0].toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
          {tab !== "overview" && (
            <div className="scope-switch">
              <label htmlFor="activity-scope">Show</label>
              <select
                id="activity-scope"
                value={scope}
                onChange={(event) => setScope(event.target.value)}
              >
                <option value="lesson">This lesson</option>
                <option value="course">Whole course</option>
              </select>
            </div>
          )}
          {tab === "overview" && (
            <section className="lesson-overview">
              <h2>About this lesson</h2>
              <p className="description">
                {lesson.description ||
                  "No description was provided for this lesson."}
              </p>
             
            
            </section>
          )}
          {tab === "discussion" && (
            <Discussion
              key={`${id}-${scope}-${lesson.videoId}`}
              courseId={id}
              lessonId={scope === "lesson" ? lesson.videoId : undefined}
            />
          )}
          {tab === "assistant" && (
            <AiStudyAssistant
              key={`${id}-${lesson.videoId}`}
              courseId={id}
              lessonId={lesson.videoId}
            />
          )}
          {tab === "quiz" && (
            <Quiz
              key={`${id}-${scope}-${lesson.videoId}`}
              courseId={id}
              lessonId={scope === "lesson" ? lesson.videoId : undefined}
            />
          )}
        </div>
        <aside className="lesson-sidebar">
          <div className="sidebar-heading">
            <h2>
              <button
                className="curriculum-toggle"
                aria-expanded={curriculumOpen}
                aria-controls="course-curriculum"
                onClick={() => setCurriculumOpen(!curriculumOpen)}
              >
                <ListVideo size={20} />
                Course content<span>{curriculumOpen ? "−" : "+"}</span>
              </button>
            </h2>
            <p className="muted">
              {enrollment.completedLessons.length} of {course.lessons.length}{" "}
              complete
            </p>
            <Progress value={enrollment.progress} />
          </div>
          <ol id="course-curriculum" hidden={!curriculumOpen}>
            {course.lessons.map((item, itemIndex) => (
              <li key={item.videoId}>
                <button
                  className={item.videoId === lesson.videoId ? "current" : ""}
                  aria-current={
                    item.videoId === lesson.videoId ? "step" : undefined
                  }
                  onClick={() => selectLesson(item.videoId)}
                >
                  <span>
                    {enrollment.completedLessons.includes(item.videoId) ? (
                      <Check size={18} />
                    ) : item.videoId === lesson.videoId ? (
                      <Play size={16} />
                    ) : (
                      String(itemIndex + 1).padStart(2, "0")
                    )}
                  </span>
                  <div>
                    {item.title}
                    <small>
                      {item.duration?.replace("PT", "").toLowerCase() ||
                        "Video"}
                    </small>
                  </div>
                </button>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
