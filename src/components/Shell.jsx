import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Moon, Sun, Menu, X, ArrowUpRight } from "lucide-react";
import { api } from "../api/client";
import { useSession, keys } from "../queries";
import { FormError } from "./UI";
import AccountMenu from "./AccountMenu";
import { useTheme } from "./ThemeProvider";
export default function Shell() {
  const { resolvedTheme, setTheme } = useTheme();
  const [menu, setMenu] = useState(false);
  const session = useSession();
  const client = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const expired = () => {
      client.clear();
      client.setQueryData(keys.session, null);
    };
    window.addEventListener("learnhub:session-expired", expired);
    return () =>
      window.removeEventListener("learnhub:session-expired", expired);
  }, [client]);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frame = requestAnimationFrame(() => {
      if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      else window.scrollTo({ top: 0, behavior: "auto" });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);
  const logout = useMutation({
    mutationFn: () => api("/auth/logout", { method: "POST" }),
    onSuccess: async () => {
      await client.cancelQueries();
      client.clear();
      client.setQueryData(keys.session, null);
      navigate("/");
    },
  });
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="brand" aria-label="LearnHub home">
            <span className="brand-mark">
              <BookOpen size={22} />
            </span>
            learnhub<span className="brand-dot">.</span>
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            <NavLink to="/courses">Explore</NavLink>
            <NavLink to="/my-learning">My learning</NavLink>
            <NavLink to="/tutorials">Tutorials</NavLink>
            <Link to="/#pricing">Pricing</Link>
          </nav>
          <div className="header-actions">
            <button
              className="icon-button"
              aria-label={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
              onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
            >
              {resolvedTheme === "light" ? <Moon size={19} /> : <Sun size={19} />}
            </button>
            {session.data ? (
              <AccountMenu
                key={location.key}
                user={session.data}
                logout={logout}
              />
            ) : (
              <Link className="button small desktop-only" to="/login">
                Sign in <ArrowUpRight size={16} />
              </Link>
            )}
            <button
              className="icon-button mobile-menu"
              aria-expanded={menu}
              aria-controls="mobile-nav"
              aria-label={menu ? "Close menu" : "Open menu"}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {menu && (
          <nav
            id="mobile-nav"
            className="mobile-nav"
            aria-label="Mobile navigation"
            onKeyDown={(event) => event.key === "Escape" && setMenu(false)}
          >
            {[
              ["/courses", "Explore courses"],
              ["/my-learning", "My learning"],
              ["/tutorials", "Tutorials"],
              ["/#pricing", "Pricing"],
              [
                session.data ? "/profile" : "/login",
                session.data ? "Your profile" : "Sign in",
              ],
            ].map(([to, title]) => (
              <NavLink key={to} to={to} onClick={() => setMenu(false)}>
                {title}
              </NavLink>
            ))}
            {session.data && (
              <button
                onClick={() => {
                  logout.mutate();
                  setMenu(false);
                }}
              >
                Sign out
              </button>
            )}
          </nav>
        )}
      </header>
      {logout.error && (
        <div className="container">
          <FormError error={logout.error} />
        </div>
      )}
      <main id="main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <Link className="brand" to="/">
              <BookOpen size={20} /> learnhub.
            </Link>
            <p>Turn great public learning content into structured progress, understanding, and practice.</p>
          </div>
          <div className="footer-links">
            <nav aria-label="LearnHub"><strong>LearnHub</strong><Link to="/about">About</Link><Link to="/blog">Blog</Link><Link to="/#support">Contact and support</Link></nav>
            <nav aria-label="Learn"><strong>Learn</strong><Link to="/courses">Explore courses</Link>{session.data && <Link to="/my-learning">My learning</Link>}{session.data && <Link to="/tutorials">Tutorials</Link>}</nav>
            <nav aria-label="Product"><strong>Product</strong><Link to="/#pricing">Pricing</Link><Link to={session.data ? "/my-learning" : "/register"}>AI Study Assistant</Link><Link to={session.data ? "/my-learning" : "/register"}>Study Notes</Link></nav>
            {session.data && <nav aria-label="Account"><strong>Account</strong><Link to="/profile">Profile</Link><Link to="/settings">Settings</Link><Link to="/settings/billing">Billing</Link></nav>}
            <nav aria-label="Legal"><strong>Legal</strong><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></nav>
          </div>
          <p>
            © {new Date().getFullYear()} LearnHub
            <br />
            <span className="muted">Built for curious minds.</span>
          </p>
        </div>
      </footer>
    </>
  );
}
