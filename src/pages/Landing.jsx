import { useState } from "react";
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
  BrainCircuit,
  ShieldCheck,
  Sparkles,
  Send,
} from "lucide-react";
import { useBilling, useCheckout, useCourses, usePlans, useSession, useSupportRequest } from "../queries";
import { Button, CourseCard, EmptyState, ErrorState, FormError, Skeleton } from "../components/UI";
import { PricingCards } from "../components/BillingUI";
import Reveal from "../components/Reveal";

function SupportForm({ user }) {
  const support = useSupportRequest();
  const [form, setForm] = useState({ fullName: user ? `${user.firstName} ${user.lastName}`.trim() : "", email: user?.email || "", category: "general", subject: "", message: "" });
  const set = (key) => (event) => { setForm({ ...form, [key]: event.target.value }); support.reset(); };
  if (support.isSuccess) return <div className="support-success" role="status"><CheckCheck size={28} /><h3>Message received.</h3><p>{support.data.message}</p><button className="text-link" onClick={() => { support.reset(); setForm({ ...form, subject: "", message: "" }); }}>Send another message</button></div>;
  return <form className="support-form form-stack" onSubmit={(event) => { event.preventDefault(); support.mutate(form); }}>
    <div className="form-columns"><label>Full name<input required minLength="2" maxLength="160" value={form.fullName} onChange={set("fullName")} /></label><label>Email<input required type="email" maxLength="254" value={form.email} onChange={set("email")} /></label></div>
    <div className="form-columns"><label>Category<select value={form.category} onChange={set("category")}><option value="general">General</option><option value="account">Account</option><option value="technical">Technical</option><option value="course_content">Course content</option><option value="feedback">Feedback</option><option value="other">Other</option></select></label><label>Subject<input required minLength="3" maxLength="160" value={form.subject} onChange={set("subject")} /></label></div>
    <label>How can we help?<textarea required minLength="10" maxLength="5000" rows="5" value={form.message} onChange={set("message")} /></label>
    <FormError error={support.error} /><Button type="submit" pending={support.isPending}>Send message <Send size={17} /></Button>
  </form>;
}
export default function Landing() {
  const courses = useCourses({ limit: 3 });
  const session = useSession();
  const plans = usePlans();
  const billing = useBilling(Boolean(session.data));
  const checkout = useCheckout();
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
      <Reveal>
        <section className="container section ai-landing">
          <div className="ai-landing-copy"><p className="eyebrow">STUDY WITH CONTEXT</p><h2>Ask the lesson. Keep your momentum.</h2><p className="muted">The AI Study Assistant works from the lesson you are watching. Request a concise summary, key points, a simpler explanation, or ask a focused question without leaving your course.</p><Link className="text-link" to={session.data ? "/my-learning" : "/register"}>{session.data ? "Open your learning" : "Create an account"} <ArrowRight size={17} /></Link></div>
          <div className="ai-mode-grid">{[["Summarize", "Short or detailed lesson notes", BrainCircuit], ["Understand", "Explain the lesson in simpler terms", Sparkles], ["Stay secure", "Private backend-only AI access", ShieldCheck]].map(([title, text, Icon]) => <article key={title}><Icon size={24} /><h3>{title}</h3><p>{text}</p></article>)}</div>
        </section>
      </Reveal>
      <Reveal>
        <section className="container section pricing-section" id="pricing" aria-labelledby="pricing-heading"><div className="section-heading"><div><p className="eyebrow">PRICING</p><h2 id="pricing-heading">Choose the learning capacity that fits your goals.</h2></div><p className="muted section-intro">Public course videos remain free at their source. LearnHub plans provide the system around them: AI-supported understanding, saved study work, structured practice, progress, and active-course capacity.</p></div>{plans.isPending ? <Skeleton /> : plans.isError ? <ErrorState error={plans.error} retry={plans.refetch} /> : <><PricingCards plans={plans.data.items} currentPlan={billing.data?.plan} authenticated={Boolean(session.data)} onSelect={(value) => checkout.mutate(value)} pendingPlan={checkout.isPending ? checkout.variables : null} /><FormError error={checkout.error || billing.error} /></>}</section>
      </Reveal>
      <Reveal>
        <section className="support-section" id="support"><div className="container section support-grid"><div><p className="eyebrow">WE’RE HERE TO HELP</p><h2>Questions should not stop your progress.</h2><p className="muted">Tell us what happened and include the details that will help us understand it. Your request is saved securely for the LearnHub team.</p></div><SupportForm user={session.data} /></div></section>
      </Reveal>
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
