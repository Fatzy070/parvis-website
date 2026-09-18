import { Link, useParams } from "react-router-dom";
import { ArrowRight, BookOpenCheck, BrainCircuit, Compass, NotebookPen, Route, Sparkles, Target } from "lucide-react";
import { PageHeading } from "../components/UI";
import Reveal from "../components/Reveal";
import { useBlogPost, useBlogPosts } from "../queries";
import { ErrorState, Skeleton } from "../components/UI";

const journey = [
  [Compass, "Discover", "Find curated paths through useful public courses."],
  [BrainCircuit, "Understand", "Use lesson-aware summaries and focused questions when a concept needs another explanation."],
  [Target, "Practise", "Check your understanding with quizzes, practical questions, and feedback."],
  [Route, "Progress", "Keep your place, your saved work, and your learning momentum together."],
];

export function About() {
  return <div className="public-info">
    <section className="container section about-hero"><PageHeading eyebrow="ABOUT LEARNHUB" title="Public learning content, shaped into a learning system">LearnHub helps learners turn high-quality tutorials from educators around the web into a structured experience for understanding, practising, and staying consistent.</PageHeading><div className="actions"><Link className="button" to="/courses">Explore courses <ArrowRight size={17} /></Link><Link className="text-link" to="/#pricing">Compare plans</Link></div></section>
    <Reveal as="section" className="about-band"><div className="container about-split"><div><p className="eyebrow">WHY LEARNHUB EXISTS</p><h2>Watching is only the beginning.</h2></div><div><p>A great tutorial can open a door, but learners still need a way to keep their place, revisit ideas, practise deliberately, and see progress over time.</p><p>LearnHub brings those parts together without claiming ownership of the original videos. Educators create the content; LearnHub provides the workspace around it.</p></div></div></Reveal>
    <Reveal as="section" className="container section"><div className="section-heading"><div><p className="eyebrow">HOW LEARNING WORKS</p><h2>Learn → Understand → Practise → Progress</h2></div></div><div className="about-journey">{journey.map(([Icon, title, text], index) => <article key={title}><span className="step-number">0{index + 1}</span><Icon size={24} /><h3>{title}</h3><p>{text}</p></article>)}</div></Reveal>
    <Reveal as="section" className="container section about-workspace"><div><p className="eyebrow">YOUR LEARNING WORKSPACE</p><h2>Tools that stay connected to the lesson.</h2><p className="muted">Progress tracking, the AI Study Assistant, Study Notes, practice quizzes, practical questions, feedback, and saved work support the same learning journey.</p></div><div className="value-grid">{[[BrainCircuit,"Context-aware help","Ask focused questions or request summary modes grounded in the current lesson."],[NotebookPen,"Notes that remain useful","Save study notes and return to them from your private workspace."],[BookOpenCheck,"Practice with purpose","Use quizzes and practical work to move beyond passive watching."],[Sparkles,"AI with a supporting role","AI helps explain and practise; it does not replace the educator or your judgment."]].map(([Icon,title,text]) => <article key={title}><Icon /><h3>{title}</h3><p>{text}</p></article>)}</div></Reveal>
    <Reveal as="section" className="container section"><div className="landing-cta"><div><p className="eyebrow">MAKE THE NEXT LESSON COUNT</p><h2>Build a learning rhythm that lasts.</h2></div><Link className="button" to="/register">Start free <ArrowRight size={17} /></Link></div></Reveal>
  </div>;
}

function BlogEmptyState() {
  return <div className="blog-empty"><span className="blog-empty-icon"><NotebookPen size={30} /></span><p className="eyebrow">THE FIRST EDITION IS IN PROGRESS</p><h2>Useful learning ideas will live here.</h2><p>Learning guides, study techniques, and LearnHub product updates will appear here when they are ready.</p><div className="actions"><Link className="button" to="/courses">Explore courses</Link><Link className="text-link" to="/#support">Suggest a topic</Link></div></div>;
}

export function Blog() {
  const posts=useBlogPosts();
  return <div className="container section public-info blog-page"><PageHeading eyebrow="LEARNHUB BLOG" title="Notes for curious, consistent learners">Practical learning guides, platform updates, and thoughtful ways to get more from every lesson.</PageHeading>{posts.isPending?<Skeleton/>:posts.isError?<ErrorState error={posts.error} retry={posts.refetch}/>:posts.data.items.length?<div className="blog-grid">{posts.data.items.map((post)=><article key={post.slug}><p className="eyebrow">{new Date(post.publishedAt).toLocaleDateString()}</p><h2><Link to={`/blog/${post.slug}`}>{post.title}</Link></h2><p>{post.excerpt}</p><Link className="text-link" to={`/blog/${post.slug}`}>Read article <ArrowRight size={16}/></Link></article>)}</div>:<BlogEmptyState/>}</div>;
}

function Markdown({content}) { return <div className="blog-content">{content.split(/\n{2,}/).map((block,index)=>block.startsWith("## ")?<h2 key={index}>{block.slice(3)}</h2>:block.startsWith("# ")?<h2 key={index}>{block.slice(2)}</h2>:<p key={index}>{block}</p>)}</div>; }
export function BlogPost() { const {slug}=useParams();const query=useBlogPost(slug);if(query.isPending)return <div className="container section"><Skeleton/></div>;if(query.isError)return <div className="container section"><ErrorState error={query.error} retry={query.refetch}/></div>;const post=query.data.post;return <article className="container section blog-article"><Link className="text-link" to="/blog">← Blog</Link><p className="eyebrow">{new Date(post.publishedAt).toLocaleDateString()}</p><h1>{post.title}</h1><p className="blog-lead">{post.excerpt}</p><Markdown content={post.content}/></article>;}

export function Legal({ type }) { const privacy = type === "privacy"; return <div className="container section public-info legal-copy"><PageHeading eyebrow="LEGAL" title={privacy ? "Privacy notice" : "Terms of use"}>This page is a product placeholder and requires final review by qualified legal counsel before LearnHub’s commercial launch.</PageHeading><h2>{privacy ? "What the product handles" : "Current product terms"}</h2><p>{privacy ? "LearnHub stores account, learning-progress, saved-work, notification, security-session, and billing records needed to operate the service. Payment credentials are handled by Paystack; LearnHub does not collect full card numbers, PINs, OTPs, or CVVs." : "Learners must use LearnHub lawfully and keep their accounts secure. Course videos remain subject to their original publishers’ terms. AI output can be incomplete and should be reviewed rather than treated as professional advice."}</p><p>Contact LearnHub through the support form for product questions. Final retention periods, governing law, processor details, and statutory disclosures remain subject to legal review.</p></div>; }
