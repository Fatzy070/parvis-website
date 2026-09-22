/**
 * OnboardingIllustrations.jsx
 *
 * Product-accurate SVG illustrations for Parvis onboarding.
 * Inspired by the real Learn page, AI Study Assistant, and Profile/Achievements UI.
 * Uses real CSS variables — adapts to light/dark automatically.
 */

/* ------------------------------------------------------------------
   Screen 1 — Learn with structure
   Source: Learn.jsx + LessonPlayer + lesson-sidebar CSS
   Elements: video frame, lesson eyebrow, lesson title, Mark complete
   button, sidebar with course content heading, progress bar,
   lesson list (completed ✓, current playing ▶, upcoming numbered)
   ------------------------------------------------------------------ */
export function StructuredLearningIllustration() {
  return (
    <svg
      viewBox="0 0 560 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="onboarding-illustration-svg"
    >
      {/* Page background */}
      <rect width="560" height="380" rx="10" fill="var(--bg)" />

      {/* ── Left column: main learning area ── */}

      {/* Video frame — .video-frame: dark bg, border-radius 7px */}
      <rect x="12" y="12" width="358" height="196" rx="7" fill="#0b1410" />
      {/* Play button overlay */}
      <circle cx="191" cy="110" r="22" fill="white" opacity="0.12" />
      <polygon points="183,100 183,120 205,110" fill="white" opacity="0.55" />
      {/* Save-status row */}
      <rect x="300" y="214" width="70" height="5" rx="2.5" fill="var(--line)" opacity="0.5" />

      {/* lesson-heading: eyebrow + title + Mark complete button */}
      {/* eyebrow: "LESSON 3 OF 12" */}
      <rect x="12" y="224" width="72" height="4" rx="2" fill="var(--primary)" opacity="0.75" />
      {/* h2: lesson title */}
      <rect x="12" y="232" width="200" height="7" rx="3" fill="var(--text)" opacity="0.85" />
      <rect x="12" y="243" width="140" height="6" rx="3" fill="var(--text)" opacity="0.4" />
      {/* Mark complete button (secondary style: border, bg surface) */}
      <rect x="280" y="228" width="90" height="26" rx="5" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />
      <rect x="292" y="239" width="10" height="4" rx="2" fill="var(--primary)" opacity="0.7" />
      <rect x="306" y="239" width="52" height="4" rx="2" fill="var(--text)" opacity="0.5" />

      {/* lesson-navigation: Previous / Next lesson */}
      <rect x="12" y="268" width="70" height="22" rx="5" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />
      <rect x="22" y="277" width="45" height="4" rx="2" fill="var(--text)" opacity="0.45" />
      {/* completion-badge in center */}
      <rect x="155" y="272" width="72" height="14" rx="7" fill="var(--soft)" />
      <rect x="163" y="277" width="56" height="4" rx="2" fill="var(--primary)" opacity="0.7" />
      {/* Next lesson button */}
      <rect x="300" y="268" width="70" height="22" rx="5" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />
      <rect x="308" y="277" width="50" height="4" rx="2" fill="var(--text)" opacity="0.45" />

      {/* tabs: Overview | Assistant | Discussion | Quiz */}
      <line x1="12" y1="300" x2="370" y2="300" stroke="var(--line)" strokeWidth="1" />
      {/* Active tab — Overview */}
      <rect x="12" y="284" width="52" height="4" rx="2" fill="var(--primary)" opacity="0.9" />
      <line x1="12" y1="300" x2="64" y2="300" stroke="var(--primary)" strokeWidth="2" />
      {/* Inactive tabs */}
      <rect x="80" y="284" width="52" height="4" rx="2" fill="var(--muted)" opacity="0.5" />
      <rect x="150" y="284" width="52" height="4" rx="2" fill="var(--muted)" opacity="0.5" />
      <rect x="220" y="284" width="30" height="4" rx="2" fill="var(--muted)" opacity="0.5" />

      {/* lesson-overview: About this lesson */}
      <rect x="12" y="312" width="80" height="6" rx="3" fill="var(--text)" opacity="0.7" />
      <rect x="12" y="322" width="340" height="4" rx="2" fill="var(--line)" opacity="0.6" />
      <rect x="12" y="330" width="300" height="4" rx="2" fill="var(--line)" opacity="0.5" />
      <rect x="12" y="338" width="320" height="4" rx="2" fill="var(--line)" opacity="0.45" />
      <rect x="12" y="346" width="200" height="4" rx="2" fill="var(--line)" opacity="0.35" />

      {/* ── Right column: lesson-sidebar ── */}
      {/* .lesson-sidebar: border, border-radius 7, surface bg */}
      <rect x="382" y="12" width="166" height="356" rx="7" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />

      {/* sidebar-heading */}
      <rect x="382" y="12" width="166" height="100" rx="7" fill="var(--surface)" />
      <rect x="382" y="111" width="166" height="1" fill="var(--line)" />
      {/* Course content heading — ListVideo icon + text */}
      <rect x="396" y="24" width="10" height="10" rx="2" fill="var(--primary)" opacity="0.6" />
      <rect x="410" y="25" width="66" height="5" rx="2.5" fill="var(--text)" opacity="0.8" />
      {/* "8 of 12 complete" */}
      <rect x="396" y="44" width="80" height="4" rx="2" fill="var(--muted)" opacity="0.6" />
      {/* Progress bar — .progress-group */}
      <rect x="396" y="56" width="120" height="4" rx="2" fill="var(--surface-alt)" />
      <rect x="396" y="56" width="80" height="4" rx="2" fill="var(--primary)" opacity="0.85" />
      <rect x="396" y="64" width="28" height="3.5" rx="1.75" fill="var(--muted)" opacity="0.5" />
      <rect x="484" y="64" width="28" height="3.5" rx="1.75" fill="var(--muted)" opacity="0.5" />
      {/* ── Lesson list ── */}
      {/* Lesson 1 — completed: Check icon, primary color span */}
      <rect x="382" y="113" width="166" height="40" fill="var(--surface)" />
      <circle cx="403" cy="133" r="8" fill="var(--primary)" opacity="0.18" />
      <path d="M399 133 L402 136 L407 130" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="418" y="126" width="80" height="4" rx="2" fill="var(--text)" opacity="0.65" />
      <rect x="418" y="134" width="52" height="3" rx="1.5" fill="var(--muted)" opacity="0.45" />
      <line x1="382" y1="153" x2="548" y2="153" stroke="var(--line)" strokeWidth="1" />

      {/* Lesson 2 — completed */}
      <rect x="382" y="153" width="166" height="40" fill="var(--surface)" />
      <circle cx="403" cy="173" r="8" fill="var(--primary)" opacity="0.18" />
      <path d="M399 173 L402 176 L407 170" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="418" y="166" width="90" height="4" rx="2" fill="var(--text)" opacity="0.65" />
      <rect x="418" y="174" width="60" height="3" rx="1.5" fill="var(--muted)" opacity="0.45" />
      <line x1="382" y1="193" x2="548" y2="193" stroke="var(--line)" strokeWidth="1" />

      {/* Lesson 3 — CURRENT: .lesson-sidebar button.current: soft bg, 3px primary left border */}
      <rect x="382" y="193" width="166" height="44" fill="var(--soft)" />
      <rect x="382" y="193" width="3" height="44" fill="var(--primary)" />
      {/* Play icon */}
      <polygon points="398,210 398,222 410,216" fill="var(--primary)" opacity="0.85" />
      <rect x="418" y="206" width="100" height="4.5" rx="2" fill="var(--text)" opacity="0.85" />
      <rect x="418" y="215" width="65" height="3" rx="1.5" fill="var(--muted)" opacity="0.55" />
      <line x1="382" y1="237" x2="548" y2="237" stroke="var(--line)" strokeWidth="1" />

      {/* Lesson 4 — upcoming numbered "04" */}
      <rect x="382" y="237" width="166" height="40" fill="var(--surface)" />
      <rect x="396" y="251" width="14" height="7" rx="2" fill="var(--line)" opacity="0.5" />
      <rect x="418" y="248" width="75" height="4" rx="2" fill="var(--text)" opacity="0.5" />
      <rect x="418" y="256" width="50" height="3" rx="1.5" fill="var(--muted)" opacity="0.35" />
      <line x1="382" y1="277" x2="548" y2="277" stroke="var(--line)" strokeWidth="1" />

      {/* Lesson 5 — upcoming */}
      <rect x="382" y="277" width="166" height="40" fill="var(--surface)" />
      <rect x="396" y="291" width="14" height="7" rx="2" fill="var(--line)" opacity="0.5" />
      <rect x="418" y="288" width="88" height="4" rx="2" fill="var(--text)" opacity="0.45" />
      <rect x="418" y="296" width="55" height="3" rx="1.5" fill="var(--muted)" opacity="0.3" />
      <line x1="382" y1="317" x2="548" y2="317" stroke="var(--line)" strokeWidth="1" />

      {/* Lesson 6 — upcoming faded */}
      <rect x="382" y="317" width="166" height="40" fill="var(--surface)" />
      <rect x="396" y="331" width="14" height="7" rx="2" fill="var(--line)" opacity="0.3" />
      <rect x="418" y="328" width="70" height="4" rx="2" fill="var(--text)" opacity="0.3" />
      <rect x="418" y="336" width="45" height="3" rx="1.5" fill="var(--muted)" opacity="0.2" />

      {/* Bottom curve of sidebar */}
      <rect x="382" y="357" width="166" height="11" rx="0" fill="var(--surface)" />
      <rect x="382" y="357" width="166" height="11" rx="7" fill="var(--surface)" />
    </svg>
  );
}

/* ------------------------------------------------------------------
   Screen 2 — Study Smarter
   Source: AiStudyAssistant.jsx + PremiumLearningTools.jsx + CSS
   Elements:
     - .ai-assistant card with sparkles eyebrow "AI STUDY ASSISTANT"
     - .ai-mode-grid: 4 buttons (Short summary, Detailed, Key points, Explain simply)
     - .ai-question with textarea + "Ask AI" button
     - .ai-result in var(--soft): "Key points" result card
     - .premium-learning section with 3 .premium-tabs buttons:
       Study Notes (book icon), Practice Quiz (brain icon), Practical (code icon)
     - .premium-tool card — study notes content
   ------------------------------------------------------------------ */
export function StudySmarterIllustration() {
  return (
    <svg
      viewBox="0 0 560 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="onboarding-illustration-svg"
    >
      <rect width="560" height="380" rx="10" fill="var(--bg)" />

      {/* ── AI Study Assistant (.ai-assistant): border, radius 8, surface ── */}
      <rect x="12" y="12" width="336" height="356" rx="8" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />

      {/* .ai-heading: sparkles eyebrow + h2 + "AI-generated" pill */}
      {/* sparkles icon approximation */}
      <rect x="24" y="24" width="9" height="9" rx="2" fill="var(--primary)" opacity="0.7" />
      <rect x="36" y="26" width="90" height="4" rx="2" fill="var(--primary)" opacity="0.8" />
      {/* "AI-generated" pill — .ai-label */}
      <rect x="268" y="22" width="68" height="16" rx="8" fill="var(--soft)" />
      <rect x="276" y="27" width="52" height="4" rx="2" fill="var(--primary)" opacity="0.7" />
      {/* h2: "Understand this lesson your way" */}
      <rect x="24" y="38" width="170" height="6.5" rx="3" fill="var(--text)" opacity="0.85" />
      <rect x="24" y="48" width="120" height="6" rx="3" fill="var(--text)" opacity="0.55" />

      {/* .ai-mode-grid — 4 buttons (secondary style: border, surface bg, muted text) */}
      {/* Short summary */}
      <rect x="24" y="64" width="72" height="28" rx="5" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />
      <rect x="33" y="75" width="54" height="4" rx="2" fill="var(--muted)" opacity="0.7" />
      {/* Detailed summary */}
      <rect x="104" y="64" width="72" height="28" rx="5" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />
      <rect x="113" y="75" width="54" height="4" rx="2" fill="var(--muted)" opacity="0.7" />
      {/* Key points */}
      <rect x="184" y="64" width="72" height="28" rx="5" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />
      <rect x="193" y="75" width="54" height="4" rx="2" fill="var(--muted)" opacity="0.7" />
      {/* Explain simply */}
      <rect x="264" y="64" width="72" height="28" rx="5" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />
      <rect x="273" y="75" width="54" height="4" rx="2" fill="var(--muted)" opacity="0.7" />

      {/* .ai-question: label + textarea + Ask AI button */}
      <rect x="24" y="100" width="100" height="5" rx="2.5" fill="var(--text)" opacity="0.7" />
      {/* textarea */}
      <rect x="24" y="110" width="230" height="54" rx="5" fill="var(--surface-alt)" stroke="var(--line)" strokeWidth="1.25" />
      <rect x="34" y="120" width="140" height="4" rx="2" fill="var(--line)" opacity="0.5" />
      <rect x="34" y="128" width="100" height="4" rx="2" fill="var(--line)" opacity="0.35" />
      {/* Ask AI button (primary) */}
      <rect x="264" y="110" width="72" height="54" rx="5" fill="var(--primary)" opacity="0.9" />
      {/* Send icon + "Ask AI" */}
      <rect x="275" y="131" width="8" height="8" rx="2" fill="var(--primary-text)" opacity="0.8" />
      <rect x="287" y="133" width="36" height="4" rx="2" fill="var(--primary-text)" opacity="0.85" />

      {/* .ai-result — in var(--soft), border-radius 7 */}
      <rect x="24" y="172" width="312" height="90" rx="7" fill="var(--soft)" />
      {/* ai-result-meta: "Key points" strong + "Saved result" span */}
      <rect x="34" y="182" width="60" height="5" rx="2.5" fill="var(--text)" opacity="0.8" />
      <rect x="254" y="180" width="72" height="14" rx="7" fill="var(--surface)" />
      <rect x="261" y="184" width="58" height="4" rx="2" fill="var(--primary)" opacity="0.65" />
      {/* ai-content: 4 bullet-style lines */}
      <rect x="34" y="197" width="6" height="6" rx="1" fill="var(--primary)" opacity="0.6" />
      <rect x="44" y="199" width="200" height="4" rx="2" fill="var(--text)" opacity="0.65" />
      <rect x="34" y="209" width="6" height="6" rx="1" fill="var(--primary)" opacity="0.6" />
      <rect x="44" y="211" width="180" height="4" rx="2" fill="var(--text)" opacity="0.55" />
      <rect x="34" y="221" width="6" height="6" rx="1" fill="var(--primary)" opacity="0.6" />
      <rect x="44" y="223" width="220" height="4" rx="2" fill="var(--text)" opacity="0.55" />
      <rect x="34" y="233" width="6" height="6" rx="1" fill="var(--primary)" opacity="0.6" />
      <rect x="44" y="235" width="160" height="4" rx="2" fill="var(--text)" opacity="0.4" />
      {/* disclaimer */}
      <rect x="24" y="270" width="280" height="3.5" rx="1.75" fill="var(--muted)" opacity="0.4" />
      <rect x="24" y="277" width="200" height="3.5" rx="1.75" fill="var(--muted)" opacity="0.3" />

      {/* ── Right column: .premium-learning section ── */}
      <rect x="358" y="12" width="190" height="356" rx="8" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />

      {/* .premium-tabs: Study Notes | Practice Quiz | Practical */}
      {/* Study Notes tab — active */}
      <rect x="366" y="22" width="52" height="28" rx="5" fill="var(--primary)" />
      {/* BookOpenText icon */}
      <rect x="374" y="31" width="10" height="9" rx="2" fill="var(--primary-text)" opacity="0.8" />
      <rect x="387" y="33" width="24" height="4" rx="2" fill="var(--primary-text)" opacity="0.8" />
      {/* Practice Quiz tab — inactive */}
      <rect x="425" y="22" width="55" height="28" rx="5" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />
      <rect x="433" y="31" width="10" height="9" rx="2" fill="var(--line)" opacity="0.7" />
      <rect x="446" y="33" width="27" height="4" rx="2" fill="var(--muted)" opacity="0.65" />
      {/* Practical tab — inactive */}
      <rect x="487" y="22" width="55" height="28" rx="5" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />
      <rect x="495" y="31" width="10" height="9" rx="2" fill="var(--line)" opacity="0.7" />
      <rect x="508" y="33" width="27" height="4" rx="2" fill="var(--muted)" opacity="0.65" />

      {/* .premium-tool for Study Notes */}
      {/* h3: AI Study Notes */}
      <rect x="366" y="60" width="90" height="6" rx="3" fill="var(--text)" opacity="0.85" />
      {/* description */}
      <rect x="366" y="72" width="170" height="4" rx="2" fill="var(--muted)" opacity="0.55" />
      <rect x="366" y="79" width="155" height="4" rx="2" fill="var(--muted)" opacity="0.45" />

      {/* Note editor — mimics .note-editor textarea */}
      <rect x="366" y="96" width="174" height="180" rx="5" fill="var(--surface-alt)" stroke="var(--line)" strokeWidth="1.25" />
      {/* Note title input */}
      <rect x="374" y="104" width="90" height="4" rx="2" fill="var(--text)" opacity="0.8" />
      <rect x="374" y="112" width="158" height="1" fill="var(--line)" opacity="0.7" />
      {/* Note body lines */}
      <rect x="374" y="118" width="155" height="3.5" rx="1.75" fill="var(--text)" opacity="0.55" />
      <rect x="374" y="126" width="145" height="3.5" rx="1.75" fill="var(--text)" opacity="0.5" />
      <rect x="374" y="134" width="160" height="3.5" rx="1.75" fill="var(--text)" opacity="0.45" />
      <rect x="374" y="142" width="120" height="3.5" rx="1.75" fill="var(--text)" opacity="0.4" />
      <rect x="374" y="154" width="155" height="3.5" rx="1.75" fill="var(--muted)" opacity="0.35" />
      <rect x="374" y="162" width="130" height="3.5" rx="1.75" fill="var(--muted)" opacity="0.3" />
      <rect x="374" y="170" width="148" height="3.5" rx="1.75" fill="var(--muted)" opacity="0.25" />
      <rect x="374" y="182" width="155" height="3.5" rx="1.75" fill="var(--muted)" opacity="0.2" />
      <rect x="374" y="190" width="100" height="3.5" rx="1.75" fill="var(--muted)" opacity="0.15" />

      {/* Save to My Learning button */}
      <rect x="366" y="284" width="174" height="30" rx="5" fill="var(--primary)" />
      <rect x="400" y="296" width="105" height="4" rx="2" fill="var(--primary-text)" opacity="0.85" />

      {/* Practical Exercise panel below — collapsed hint */}
      <rect x="366" y="324" width="174" height="36" rx="5" fill="var(--surface-alt)" />
      <rect x="374" y="333" width="70" height="4" rx="2" fill="var(--text)" opacity="0.6" />
      <rect x="374" y="342" width="130" height="3.5" rx="1.75" fill="var(--muted)" opacity="0.4" />
    </svg>
  );
}

/* ------------------------------------------------------------------
   Screen 3 — Keep Progressing
   Source: Profile.jsx AchievementsSection, Learn.jsx enrollment,
           .completion-badge, .practice-result CSS, progress-group
   Elements:
     - Top: My Learning cards with progress bars (course-card style)
     - Middle: completion badge (.completion-badge: Check + "Course completed")
     - Quiz result (.practice-result: score %, "X of Y correct")
     - Achievement card (trophy + title + "September 2026" + metrics tags)
   ------------------------------------------------------------------ */
export function ProgressIllustration() {
  return (
    <svg
      viewBox="0 0 560 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="onboarding-illustration-svg"
    >
      <rect width="560" height="380" rx="10" fill="var(--bg)" />

      {/* ── Top row: 2 course cards with enrollment progress ── */}
      {/* .course-card: surface, border, border-radius */}
      {/* Card 1 — nearly complete */}
      <rect x="12" y="12" width="260" height="148" rx="8" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />
      {/* .course-image: 16/9 aspect, source-tag */}
      <rect x="12" y="12" width="260" height="78" rx="8" fill="var(--surface-alt)" />
      <rect x="12" y="66" width="260" height="24" fill="var(--surface-alt)" />
      {/* YouTube source tag */}
      <rect x="20" y="20" width="78" height="14" rx="7" fill="var(--bg)" opacity="0.75" />
      <rect x="28" y="24" width="62" height="4" rx="2" fill="var(--text)" opacity="0.5" />
      {/* course-body */}
      <rect x="20" y="90" width="40" height="3.5" rx="1.75" fill="var(--primary)" opacity="0.7" />
      <rect x="20" y="98" width="170" height="5" rx="2.5" fill="var(--text)" opacity="0.8" />
      <rect x="20" y="107" width="100" height="4" rx="2" fill="var(--muted)" opacity="0.5" />
      {/* Progress bar + "11 of 12 lessons" */}
      <rect x="20" y="118" width="232" height="4" rx="2" fill="var(--surface-alt)" />
      <rect x="20" y="118" width="210" height="4" rx="2" fill="var(--primary)" opacity="0.85" />
      <rect x="20" y="128" width="80" height="3.5" rx="1.75" fill="var(--muted)" opacity="0.5" />
      {/* completion-badge: Check + "Course completed" */}
      <circle cx="213" cy="140" r="10" fill="var(--soft)" />
      <path d="M209 140 L212 143 L217 137" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="228" y="137" width="36" height="4" rx="2" fill="var(--primary)" opacity="0.75" />

      {/* Card 2 — in progress */}
      <rect x="284" y="12" width="260" height="148" rx="8" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />
      <rect x="284" y="12" width="260" height="78" rx="8" fill="var(--surface-alt)" />
      <rect x="284" y="66" width="260" height="24" fill="var(--surface-alt)" />
      <rect x="292" y="20" width="78" height="14" rx="7" fill="var(--bg)" opacity="0.75" />
      <rect x="300" y="24" width="62" height="4" rx="2" fill="var(--text)" opacity="0.5" />
      <rect x="292" y="90" width="40" height="3.5" rx="1.75" fill="var(--primary)" opacity="0.7" />
      <rect x="292" y="98" width="180" height="5" rx="2.5" fill="var(--text)" opacity="0.8" />
      <rect x="292" y="107" width="110" height="4" rx="2" fill="var(--muted)" opacity="0.5" />
      <rect x="292" y="118" width="232" height="4" rx="2" fill="var(--surface-alt)" />
      <rect x="292" y="118" width="140" height="4" rx="2" fill="var(--primary)" opacity="0.7" />
      <rect x="292" y="128" width="80" height="3.5" rx="1.75" fill="var(--muted)" opacity="0.5" />
      {/* Arrow → continue */}
      <circle cx="510" cy="140" r="10" fill="var(--soft)" />
      <path d="M506 140 L514 140 M510 136 L514 140 L510 144" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* ── Middle row: practice-result + quiz score ── */}
      {/* .practice-result: score %, "X of Y correct" */}
      <rect x="12" y="172" width="200" height="80" rx="8" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />
      {/* eyebrow: "PRACTICE QUIZ RESULT" */}
      <rect x="22" y="182" width="80" height="3.5" rx="1.75" fill="var(--primary)" opacity="0.7" />
      {/* Score — large */}
      <rect x="22" y="192" width="50" height="20" rx="4" fill="var(--soft)" />
      <rect x="27" y="199" width="40" height="7" rx="3" fill="var(--primary)" opacity="0.85" />
      {/* "80%" text-like block */}
      <rect x="80" y="197" width="28" height="10" rx="3" fill="var(--primary)" opacity="0.15" />
      <rect x="84" y="200" width="20" height="4" rx="2" fill="var(--primary)" opacity="0.8" />
      {/* "4 of 5 correct" */}
      <rect x="22" y="220" width="90" height="4" rx="2" fill="var(--muted)" opacity="0.55" />
      {/* check marks */}
      <circle cx="142" cy="216" r="8" fill="var(--soft)" />
      <path d="M138 216 L141 219 L146 213" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="158" cy="216" r="8" fill="var(--soft)" />
      <path d="M154 216 L157 219 L162 213" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="174" cy="216" r="8" fill="var(--soft)" />
      <path d="M170 216 L173 219 L178 213" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="190" cy="216" r="8" fill="var(--soft)" />
      <path d="M186 216 L189 219 L194 213" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Progress streak card */}
      <rect x="224" y="172" width="324" height="80" rx="8" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />
      <rect x="234" y="182" width="70" height="3.5" rx="1.75" fill="var(--primary)" opacity="0.7" />
      {/* Bar chart: 6 bars showing weekly streak */}
      <rect x="234" y="222" width="16" height="20" rx="3" fill="var(--primary)" opacity="0.3" />
      <rect x="256" y="210" width="16" height="32" rx="3" fill="var(--primary)" opacity="0.45" />
      <rect x="278" y="202" width="16" height="40" rx="3" fill="var(--primary)" opacity="0.6" />
      <rect x="300" y="194" width="16" height="48" rx="3" fill="var(--primary)" opacity="0.75" />
      <rect x="322" y="186" width="16" height="56" rx="3" fill="var(--primary)" opacity="0.88" />
      <rect x="344" y="180" width="16" height="62" rx="3" fill="var(--primary)" />
      <line x1="234" y1="244" x2="502" y2="244" stroke="var(--line)" strokeWidth="1" />
      {/* Consistency label */}
      <rect x="390" y="195" width="120" height="30" rx="6" fill="var(--soft)" />
      <rect x="398" y="202" width="78" height="4.5" rx="2" fill="var(--primary)" opacity="0.8" />
      <rect x="398" y="211" width="100" height="3.5" rx="1.75" fill="var(--muted)" opacity="0.5" />

      {/* ── Bottom: Achievement card (Profile.jsx AchievementsSection) ── */}
      {/* padding 16, radius 10, var(--bg), border var(--line) */}
      <rect x="12" y="264" width="536" height="104" rx="10" fill="var(--bg)" stroke="var(--line)" strokeWidth="1.25" />
      {/* h2: Achievements */}
      <rect x="24" y="274" width="100" height="6" rx="3" fill="var(--text)" opacity="0.85" />
      <rect x="24" y="285" width="260" height="3.5" rx="1.75" fill="var(--muted)" opacity="0.5" />

      {/* Achievement card — inspired by AchievementsSection */}
      <rect x="24" y="296" width="240" height="60" rx="8" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />
      {/* Trophy emoji placeholder */}
      <rect x="34" y="306" width="20" height="20" rx="5" fill="var(--soft)" />
      <rect x="39" y="310" width="10" height="12" rx="2" fill="var(--primary)" opacity="0.7" />
      {/* Title: "Practice Champion" */}
      <rect x="62" y="307" width="100" height="5.5" rx="2.5" fill="var(--primary)" opacity="0.85" />
      {/* "September 2026" */}
      <rect x="62" y="317" width="70" height="4" rx="2" fill="var(--muted)" opacity="0.5" />
      {/* Metrics tags: "🔥 18 active days" "📝 3 quizzes" */}
      <rect x="34" y="333" width="72" height="16" rx="8" fill="var(--soft)" />
      <rect x="42" y="339" width="56" height="4" rx="2" fill="var(--text)" opacity="0.65" />
      <rect x="114" y="333" width="60" height="16" rx="8" fill="var(--soft)" />
      <rect x="122" y="339" width="44" height="4" rx="2" fill="var(--text)" opacity="0.65" />
      <rect x="182" y="333" width="66" height="16" rx="8" fill="var(--soft)" />
      <rect x="190" y="339" width="50" height="4" rx="2" fill="var(--text)" opacity="0.65" />

      {/* Second achievement card */}
      <rect x="276" y="296" width="240" height="60" rx="8" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.25" />
      <rect x="286" y="306" width="20" height="20" rx="5" fill="var(--soft)" />
      <rect x="291" y="310" width="10" height="12" rx="2" fill="var(--primary)" opacity="0.7" />
      <rect x="314" y="307" width="110" height="5.5" rx="2.5" fill="var(--primary)" opacity="0.85" />
      <rect x="314" y="317" width="70" height="4" rx="2" fill="var(--muted)" opacity="0.5" />
      <rect x="286" y="333" width="78" height="16" rx="8" fill="var(--soft)" />
      <rect x="294" y="339" width="62" height="4" rx="2" fill="var(--text)" opacity="0.65" />
      <rect x="372" y="333" width="66" height="16" rx="8" fill="var(--soft)" />
      <rect x="380" y="339" width="50" height="4" rx="2" fill="var(--text)" opacity="0.65" />
    </svg>
  );
}
