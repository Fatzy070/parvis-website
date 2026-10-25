import { Link, useParams } from "react-router-dom";
import { ArrowRight, BookOpenCheck, BrainCircuit, Compass, NotebookPen, Route, Sparkles, Target } from "lucide-react";
import { PageHeading } from "../components/UI";
import Reveal from "../components/Reveal";
import { useBlogPost, useBlogPosts } from "../queries";
import { ErrorState, Skeleton } from "../components/UI";
import { SEO } from "../components/SEO";

const journey = [
  [Compass, "Discover", "Find curated paths through useful public courses."],
  [BrainCircuit, "Understand", "Use lesson-aware summaries and focused questions when a concept needs another explanation."],
  [Target, "Practise", "Check your understanding with quizzes, practical questions, and feedback."],
  [Route, "Progress", "Keep your place, your saved work, and your learning momentum together."],
];

export function About() {
  return <div className="public-info">
    <SEO 
      title="About Parvis | The Learning System"
      description="Parvis helps learners turn high-quality tutorials from educators around the web into a structured experience for understanding, practising, and staying consistent."
      canonical="/about"
    />
    <section className="container section about-hero"><PageHeading eyebrow="ABOUT PARVIS" title="Public learning content, shaped into a learning system">Parvis helps learners turn high-quality tutorials from educators around the web into a structured experience for understanding, practising, and staying consistent.</PageHeading><div className="actions"><Link className="button" to="/courses">Explore courses <ArrowRight size={17} /></Link><Link className="text-link" to="/#pricing">Compare plans</Link></div></section>
    <Reveal as="section" className="about-band"><div className="container about-split"><div><p className="eyebrow">WHY PARVIS EXISTS</p><h2>Watching is only the beginning.</h2></div><div><p>A great tutorial can open a door, but learners still need a way to keep their place, revisit ideas, practise deliberately, and see progress over time.</p><p>Parvis brings those parts together without claiming ownership of the original videos. Educators create the content; Parvis provides the workspace around it.</p></div></div></Reveal>
    <Reveal as="section" className="container section"><div className="section-heading"><div><p className="eyebrow">HOW LEARNING WORKS</p><h2>Learn → Understand → Practise → Progress</h2></div></div><div className="about-journey">{journey.map(([Icon, title, text], index) => <article key={title}><span className="step-number">0{index + 1}</span><Icon size={24} /><h3>{title}</h3><p>{text}</p></article>)}</div></Reveal>
    <Reveal as="section" className="container section about-workspace"><div><p className="eyebrow">YOUR LEARNING WORKSPACE</p><h2>Tools that stay connected to the lesson.</h2><p className="muted">Progress tracking, the AI Study Assistant, Study Notes, practice quizzes, practical questions, feedback, and saved work support the same learning journey.</p></div><div className="value-grid">{[[BrainCircuit,"Context-aware help","Ask focused questions or request summary modes grounded in the current lesson."],[NotebookPen,"Notes that remain useful","Save study notes and return to them from your private workspace."],[BookOpenCheck,"Practice with purpose","Use quizzes and practical work to move beyond passive watching."],[Sparkles,"AI with a supporting role","AI helps explain and practise; it does not replace the educator or your judgment."]].map(([Icon,title,text]) => <article key={title}><Icon /><h3>{title}</h3><p>{text}</p></article>)}</div></Reveal>
    <Reveal as="section" className="container section"><div className="landing-cta"><div><p className="eyebrow">MAKE THE NEXT LESSON COUNT</p><h2>Build a learning rhythm that lasts.</h2></div><Link className="button" to="/register">Start free <ArrowRight size={17} /></Link></div></Reveal>
  </div>;
}

function BlogEmptyState() {
  return <div className="blog-empty"><span className="blog-empty-icon"><NotebookPen size={30} /></span><p className="eyebrow">THE FIRST EDITION IS IN PROGRESS</p><h2>Useful learning ideas will live here.</h2><p>Learning guides, study techniques, and Parvis product updates will appear here when they are ready.</p><div className="actions"><Link className="button" to="/courses">Explore courses</Link><Link className="text-link" to="/#support">Suggest a topic</Link></div></div>;
}

export function Blog() {
  const posts=useBlogPosts();
  return <div className="container section public-info blog-page">
    <SEO 
      title="Parvis Blog | Learning Guides & Updates"
      description="Practical learning guides, platform updates, and thoughtful ways to get more from every lesson on Parvis."
      canonical="/blog"
    />
    <PageHeading eyebrow="PARVIS BLOG" title="Notes for curious, consistent learners">Practical learning guides, platform updates, and thoughtful ways to get more from every lesson.</PageHeading>{posts.isPending?<Skeleton/>:posts.isError?<ErrorState error={posts.error} retry={posts.refetch}/>:posts.data.items.length?<div className="blog-grid">{posts.data.items.map((post)=><article key={post.slug}><p className="eyebrow">{new Date(post.publishedAt).toLocaleDateString()}</p><h2><Link to={`/blog/${post.slug}`}>{post.title}</Link></h2><p>{post.excerpt}</p><Link className="text-link" to={`/blog/${post.slug}`}>Read article <ArrowRight size={16}/></Link></article>)}</div>:<BlogEmptyState/>}</div>;
}

function Markdown({content}) { return <div className="blog-content">{content.split(/\n{2,}/).map((block,index)=>block.startsWith("## ")?<h2 key={index}>{block.slice(3)}</h2>:block.startsWith("# ")?<h2 key={index}>{block.slice(2)}</h2>:<p key={index}>{block}</p>)}</div>; }
export function BlogPost() { 
  const {slug}=useParams();
  const query=useBlogPost(slug);
  if(query.isPending)return <div className="container section"><Skeleton/></div>;
  if(query.isError)return <div className="container section"><ErrorState error={query.error} retry={query.refetch}/></div>;
  const post=query.data.post;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "datePublished": post.publishedAt,
    "author": {
      "@type": "Organization",
      "name": "Parvis"
    }
  };

  return <article className="container section blog-article">
    <SEO 
      title={`${post.title} | Parvis Blog`}
      description={post.excerpt}
      canonical={`/blog/${slug}`}
      structuredData={structuredData}
    />
    <Link className="text-link" to="/blog">← Blog</Link>
    <p className="eyebrow">{new Date(post.publishedAt).toLocaleDateString()}</p>
    <h1>{post.title}</h1>
    <p className="blog-lead">{post.excerpt}</p>
    <Markdown content={post.content}/>
  </article>;
}

const privacyData = [
  { title: "1. Introduction", content: <p>This Privacy Notice describes how Parvis handles your personal information when you use our platform.</p> },
  { title: "2. Information We Collect", content: (
    <>
      <p>We collect information necessary to provide and operate the Parvis platform, including:</p>
      <ul>
        <li><strong>Account Information:</strong> Name, email address, and profile/avatar information.</li>
        <li><strong>Learning Data:</strong> Course enrollments, lesson progress, completed lessons, quiz responses, practical activity, learning history, and achievements/recognition.</li>
        <li><strong>Technical Data:</strong> Authentication and session information, device and security information, email-delivery metadata, and Web Push subscription information.</li>
        <li><strong>Support and Preferences:</strong> Subscription and access information, support requests, and notification preferences.</li>
        <li><strong>Billing Metadata:</strong> Billing and payment metadata.</li>
      </ul>
      <p>Please note that payment card credentials are processed securely through Paystack. Parvis does not intentionally store full card numbers, CVVs, PINs, or banking authentication credentials.</p>
    </>
  )},
  { title: "3. How We Use Information", content: (
    <>
      <p>We use the collected information for the following purposes:</p>
      <ul>
        <li>Providing accounts, authentication, and platform security.</li>
        <li>Delivering courses, saving your progress, and managing subscriptions and access.</li>
        <li>Facilitating quizzes, practicals, certificates, and achievements/recognition.</li>
        <li>Powering our AI study functionality.</li>
        <li>Providing customer support.</li>
        <li>Sending transactional emails, optional learning reminders, and Web Push notifications.</li>
        <li>Improving the Parvis platform.</li>
      </ul>
    </>
  )},
  { title: "4. AI Features", content: <p>Parvis uses AI services for functionality such as study assistance, summaries, quiz generation, and practical feedback. Only relevant learning context is sent to these services where necessary. Please be aware that AI output is not always accurate and should be used as a learning aid.</p> },
  { title: "5. Payments", content: <p>Payments for Parvis subscriptions are handled through Paystack where applicable. While Parvis may store transaction and subscription metadata required to manage your access, your payment credentials are handled directly by the payment provider.</p> },
  { title: "6. Notifications and Communications", content: <p>Parvis may send various communications, including verification emails, password-reset emails, security alerts, completion emails, certificate emails, optional study reminders, engagement emails, campaigns where applicable, and Web Push notifications. You can control optional communications and reminders through your notification settings where supported. Transactional and security messages may still be sent where necessary.</p> },
  { title: "7. User Controls", content: <p>You can manage your profile information, password and security, sessions and devices (where supported), notification preferences, Web Push settings, and subscription/billing settings directly within Parvis. Account-related requests can also be made through support.</p> },
  { title: "8. Data Rights and Requests", content: <p>You may contact Parvis regarding accessing, correcting, or requesting deletion or closure of your account and information, or if you have any questions about privacy.</p> },
  { title: "9. Contact", content: <p>For any questions or concerns regarding this Privacy Notice, please contact Parvis through our support form.</p> },
];

const termsData = [
  { title: "1. Acceptance of Terms", content: <p>By using Parvis, you agree to these Terms of Use and our Privacy Notice.</p> },
  { title: "2. Accounts", content: <p>You are responsible for providing accurate account information, protecting your credentials, and all activity that occurs under your account. You must not share or abuse accounts in ways prohibited by the platform.</p> },
  { title: "3. Learning Content", content: <p>Parvis organizes learning content, which may include public or third-party content such as YouTube playlists where applicable. Original publishers retain all rights to their content, and Parvis does not claim ownership over third-party course videos. Content availability may change if the original source modifies or removes their content.</p> },
  { title: "4. AI Features", content: <p>Parvis provides AI-generated explanations, summaries, quizzes, study notes, and practical feedback. This AI output may contain errors. You should treat AI output as learning assistance rather than guaranteed professional advice.</p> },
  { title: "5. Quizzes and Assessments", content: <p>Parvis provides various types of assessments, including AI Practice Quizzes and official Parvis quizzes. Practice quizzes are study tools and do not necessarily represent official grades.</p> },
  { title: "6. Course Progress", content: <p>Parvis tracks your progress and completion based on your platform activity. We do not guarantee that completing a Parvis course is equivalent to formal education or accreditation.</p> },
  { title: "7. Certificates of Completion", content: <p>Parvis certificates confirm your completion of learning activities and course requirements on the Parvis platform. They do NOT represent university accreditation, government licensing, professional certification, or guaranteed employment qualification, unless Parvis explicitly states otherwise for a particular course in the future.</p> },
  { title: "8. Subscriptions and Payments", content: <p>Parvis offers various plans, such as Free, Growth, and Pro where appropriate. Paid subscriptions are processed securely using Paystack. Any cancellation or access behavior operates according to the implementation on the platform at the time of subscription.</p> },
  { title: "9. Promotional Plan Grants", content: <p>Parvis may occasionally provide promotional paid-plan access. Such grants may expire, do not imply payment by the user, and do not automatically renew unless explicitly stated.</p> },
  { title: "10. Acceptable Use", content: <p>You must use Parvis responsibly. You must not abuse Parvis, attempt unauthorized access, interfere with platform operations, exploit APIs or security controls, impersonate others, use Parvis unlawfully, upload malicious content, or attempt to misuse paid or AI features.</p> },
  { title: "11. Intellectual Property", content: <p>Parvis branding, original UI, platform code, original Parvis-created content, and related assets belong to Parvis or their respective owners. Third-party course content remains owned by its original publisher.</p> },
  { title: "12. Third-Party Services", content: <p>Some Parvis features rely on third parties such as YouTube, Paystack, AI providers, and email/cloud services. Parvis cannot guarantee uninterrupted availability of these third-party services.</p> },
  { title: "13. Service Availability", content: <p>Parvis aims to provide reliable service but cannot guarantee uninterrupted or error-free availability. Features and content may change as the product evolves.</p> },
  { title: "14. Suspension and Termination", content: <p>Parvis may restrict or suspend accounts for abuse, security threats, fraudulent activity, or serious violations of these Terms.</p> },
  { title: "15. Disclaimers", content: <p>Parvis provides learning tools and content on an "as available" basis. We do not guarantee employment, income, exam results, career outcomes, or professional accreditation.</p> },
  { title: "16. Limitation of Liability", content: <p>To the maximum extent permitted by law, Parvis shall not be liable for indirect, incidental, special, or consequential damages arising out of or in connection with your use of the platform.</p> },
  { title: "17. Changes to the Terms", content: <p>Parvis may update these Terms of Use and will update the "Last updated" date accordingly.</p> },
  { title: "18. Contact", content: <p>If you have any questions about these Terms, please contact Parvis through our support form.</p> },
];

import React from 'react';

export function Legal({ type }) { 
  const isPrivacy = type === "privacy";
  const data = isPrivacy ? privacyData : termsData;
  const title = isPrivacy ? "Privacy Notice" : "Terms of Use";

  return (
    <div className="container section public-info">
      <SEO 
        title={`${title} | Parvis`}
        description={`Read the Parvis ${title}.`}
        canonical={`/${type}`}
      />
      <PageHeading eyebrow="LEGAL" title={title}>
        Please read these {isPrivacy ? "privacy practices" : "terms"} carefully.
      </PageHeading>
      
      <div className="legal-content">
        {data.map((section, index) => (
          <React.Fragment key={index}>
            <h2>{section.title}</h2>
            {section.content}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
