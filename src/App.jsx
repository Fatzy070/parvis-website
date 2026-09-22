import { Component, Suspense, lazy } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import Shell from "./components/Shell";
import Protected from "./components/Protected";
import { EmptyState, PageSkeleton } from "./components/UI";
import { Analytics } from "./components/Analytics";
const Landing = lazy(() => import("./pages/Landing"));
const Explore = lazy(() => import("./pages/Explore"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const MyLearning = lazy(() => import("./pages/MyLearning"));
const Auth = lazy(() => import("./pages/Auth"));
const Learn = lazy(() => import("./pages/Learn"));
const Settings = lazy(() => import("./pages/Settings"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Profile = lazy(() => import("./pages/Profile"));
const BillingReturn = lazy(() => import("./pages/BillingReturn"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const CertificateView = lazy(() => import("./pages/CertificateView"));
import { About, Blog, BlogPost, Legal } from "./pages/PublicInfo";
class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.error("LearnHub could not render this view:", error.name);
  }
  render() {
    return this.state.failed ? (
      <div className="container section">
        <h1>Let’s get you back on track.</h1>
        <p>This page couldn’t be displayed. Reload to try again.</p>
        <button className="button" onClick={() => window.location.reload()}>
          Reload page
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function LegacyCourse({ video }) {
  const params = useParams();
  return (
    <Navigate
      to={`/courses/${video ? `video-${params.videoId}` : params.playlistId}`}
      replace
    />
  );
}
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Analytics />
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route element={<Shell />}>
              <Route index element={<Landing />} />
              <Route path="courses" element={<Explore />} />
              <Route path="courses/:id" element={<CourseDetail />} />
              <Route path="about" element={<About />} />
              <Route path="blog" element={<Blog />} />
              <Route path="blog/:slug" element={<BlogPost />} />
              <Route path="privacy" element={<Legal type="privacy" />} />
              <Route path="terms" element={<Legal type="terms" />} />
              <Route path="certificates/:id" element={<CertificateView />} />
              {[
                "login",
                "register",
                "verify-email",
                "forgot-password",
                "verify-reset-code",
                "reset-password",
              ].map((mode) => (
                <Route
                  key={mode}
                  path={mode}
                  element={<Auth mode={mode} />}
                />
              ))}
              <Route element={<Protected />}>
                <Route path="my-learning" element={<MyLearning />} />
                <Route path="tutorials" element={<MyLearning tutorials />} />
                <Route path="learn/:id" element={<Learn />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings/:section?" element={<Settings />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="billing/return" element={<BillingReturn />} />
              </Route>
              <Route path="welcome" element={<Onboarding />} />
              <Route
                path="signup"
                element={<Navigate to="/register" replace />}
              />
              <Route
                path="tutorial"
                element={<Navigate to="/tutorials" replace />}
              />
              <Route
                path="edit-profile"
                element={<Navigate to="/profile" replace />}
              />
              <Route path="course/:playlistId" element={<LegacyCourse />} />
              <Route path="video/:videoId" element={<LegacyCourse video />} />
              <Route
                path="*"
                element={
                  <div className="container section">
                    <EmptyState
                      title="This page has turned."
                      to="/courses"
                      action="Explore courses"
                    >
                      We couldn’t find that page. Your next lesson is still
                      waiting.
                    </EmptyState>
                  </div>
                }
              />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
