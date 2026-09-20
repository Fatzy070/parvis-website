import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import {
  StructuredLearningIllustration,
  StudySmarterIllustration,
  ProgressIllustration,
} from "../components/OnboardingIllustrations";

const STEPS = [
  {
    title: "Learn with structure.",
    description:
      "Every course on LearnHub gives you a clear curriculum with lessons, progress tracking, and a content sidebar so you always know where you are and what comes next.",
    Illustration: StructuredLearningIllustration,
  },
  {
    title: "Study smarter.",
    description:
      "Use the AI Study Assistant, AI Study Notes, Practice Quizzes, and Practical Exercises right inside each lesson  tools designed to reinforce what you're learning, not replace it.",
    Illustration: StudySmarterIllustration,
  },
  {
    title: "Keep progressing.",
    description:
      "Track your course completions, quiz scores, and monthly consistency. LearnHub recognises consistent learners with achievements that appear on your profile.",
    Illustration: ProgressIllustration,
  },
];

const MARKER_KEY = "learnhub-post-signup";

/* Motion variants — subtle slide in the direction of travel */
const variants = {
  enter: (dir) => ({
    opacity: 0,
    x: dir > 0 ? 32 : -32,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (dir) => ({
    opacity: 0,
    x: dir > 0 ? -32 : 32,
  }),
};

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  /* Guard: if someone visits /welcome without going through signup, redirect */
  const destination = location.state?.destination ?? "/my-learning";

  useEffect(() => {
    const marker = sessionStorage.getItem(MARKER_KEY);
    if (!marker) navigate(destination, { replace: true });
  }, [navigate, destination]);

  const finish = () => {
    sessionStorage.removeItem(MARKER_KEY);
    navigate(destination, { replace: true });
  };

  const go = (next) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const { title, description, Illustration } = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="onboarding-layout container">
      <div className="onboarding-card">
        {/* Step indicator */}
        <p className="onboarding-step-indicator" aria-live="polite">
          {step + 1} / {STEPS.length}
        </p>

        {/* Two-column content area */}
        <div className="onboarding-body">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              className="onboarding-columns"
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {/* Left: copy */}
              <div className="onboarding-copy">
                <h1 className="onboarding-title">{title}</h1>
                <p className="onboarding-description">{description}</p>
              </div>

              {/* Right: illustration */}
              <div className="onboarding-illustration" aria-hidden="true">
                <Illustration />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="onboarding-controls">
          <div className="onboarding-controls-left">
            {step > 0 && (
              <button
                className="button secondary onboarding-back"
                onClick={() => go(step - 1)}
              >
                ← Back
              </button>
            )}
          </div>

          <div className="onboarding-controls-right">
            {!isLast && (
              <button className="onboarding-skip" onClick={finish}>
                Skip
              </button>
            )}
            {isLast ? (
              <button className="button onboarding-next" onClick={finish}>
                Get started →
              </button>
            ) : (
              <button
                className="button onboarding-next"
                onClick={() => go(step + 1)}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
