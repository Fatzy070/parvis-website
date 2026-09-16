import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  Play,
  CheckCheck,
  MessageSquare,
  Bookmark,
  MoveUpRight,
} from "lucide-react";
import { useCourses, useSession } from "../queries";
import { CourseCard, EmptyState, ErrorState, Skeleton } from "../components/UI";
export default function Landing() {
  const courses = useCourses({ limit: 3 });
  const session = useSession();
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="little-line" /> YOUR NEXT CHAPTER STARTS HERE
          </p>
          <h1>
            Stay curious.
            <br />
            Build something
            <br />
            <em>that matters.</em>
          </h1>
          <p className="hero-description">
            Turn great tutorials into lasting knowledge. Explore curated
            courses, find your focus, and make progress one lesson at a time.
          </p>
          <div className="actions">
            <Link className="button" to="/courses">
              Find your next course <ArrowUpRight size={19} />
            </Link>
            <Link
              className="text-link"
              to={session.data ? "/my-learning" : "/register"}
            >
              {session.data ? "Continue learning" : "Create your free account"}{" "}
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="hero-note">
            <Bookmark size={17} /> Your courses, your pace, your place to grow.
          </div>
        </div>
        <div
          className="hero-art"
          aria-label="Learning journey: discover, learn, put it into practice"
        >
          <div className="art-grid" />
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="art-heading">
            MAKE ROOM
            <br />
            FOR <em>what’s next.</em>
          </div>
          <div className="journey-tag tag-discover">
            <Compass size={22} />
            <span>
              01 / DISCOVER
              <br />
              <strong>Follow your curiosity</strong>
            </span>
          </div>
          <div className="journey-tag tag-learn">
            <Play size={22} />
            <span>
              02 / LEARN
              <br />
              <strong>Find your flow</strong>
            </span>
          </div>
          <div className="journey-tag tag-grow">
            <MoveUpRight size={22} />
            <span>
              03 / GROW
              <br />
              <strong>Keep moving forward</strong>
            </span>
          </div>
          <div className="art-bottom">
            A SPACE FOR YOUR NEXT IDEA <ArrowUpRight />
          </div>
        </div>
      </section>
      <div className="value-strip">
        <div className="container">
          <span>
            <Play size={18} /> Curated YouTube courses
          </span>
          <span>
            <CheckCheck size={19} /> Progress that stays with you
          </span>
          <span>
            <MessageSquare size={18} /> Learn alongside others
          </span>
        </div>
      </div>
      <section className="container section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A GOOD PLACE TO BEGIN</p>
            <h2>Find your next “I can do this.”</h2>
          </div>
          <Link className="text-link" to="/courses">
            Explore all courses <ArrowRight size={18} />
          </Link>
        </div>
        {courses.isPending ? (
          <Skeleton />
        ) : courses.isError ? (
          <ErrorState error={courses.error} retry={courses.refetch} />
        ) : courses.data.items.length ? (
          <div className="course-grid">
            {courses.data.items.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <EmptyState title="New learning starts here">
            No courses are available right now. Check back soon.
          </EmptyState>
        )}
      </section>
      <section className="how-section">
        <div className="container section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">LESS SCROLLING. MORE LEARNING.</p>
              <h2>
                A clear path from
                <br />
                curiosity to confidence.
              </h2>
            </div>
            <p className="muted section-intro">
              Bring your learning together in one calm, focused space. We’ll
              keep your place along the way.
            </p>
          </div>
          <div className="steps">
            {[
              [
                "01",
                "Find what sparks your interest",
                "Explore curated programming courses and see the full curriculum before you begin.",
                Compass,
              ],
              [
                "02",
                "Make a little progress",
                "Learn in a focused player, keep your place, and mark each lesson as you complete it.",
                Play,
              ],
              [
                "03",
                "Make the knowledge yours",
                "Discuss lessons with other learners and check your understanding when a quiz is available.",
                CheckCheck,
              ],
            ].map(([number, title, body, Icon]) => (
              <article key={number}>
                <div className="row-between">
                  <span className="step-number">{number}</span>
                  <Icon size={26} />
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="container section">
        <div className="landing-cta">
          <div>
            <p className="eyebrow">YOUR NEXT STEP IS A SMALL ONE</p>
            <h2>
              You don’t have to know it all.
              <br />
              You just have to begin.
            </h2>
          </div>
          <Link className="button" to={session.data ? "/courses" : "/register"}>
            Start your learning journey <ArrowUpRight size={19} />
          </Link>
        </div>
      </section>
    </>
  );
}
