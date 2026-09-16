import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GoogleLogin } from "@react-oauth/google";
import { ArrowRight, MailCheck, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { api } from "../api/client";
import { keys, useSession } from "../queries";
import { Button, FormError } from "../components/UI";
const copy = {
  login: [
    "WELCOME BACK",
    "A good day to keep going.",
    "Sign in to pick up where curiosity left off.",
  ],
  register: [
    "MAKE YOURSELF AT HOME",
    "Big ideas start with a small step.",
    "Create an account and make room for what’s next.",
  ],
  "verify-email": [
    "ONE LAST STEP",
    "Check your inbox.",
    "Enter the six-digit code sent to your email address.",
  ],
  "forgot-password": [
    "LET’S GET YOU BACK IN",
    "Forgot your password?",
    "We’ll send a code to help you reset it.",
  ],
  "verify-reset-code": [
    "CHECK YOUR INBOX",
    "Verify your reset code.",
    "Enter the six-digit password-reset code sent to your email address.",
  ],
  "reset-password": [
    "A FRESH START",
    "Choose a new password.",
    "Your reset code is verified. Choose and confirm your new password.",
  ],
};
export default function Auth({ mode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const client = useQueryClient();
  const session = useSession();
  const [email, setEmail] = useState(
    location.state?.email ||
      (mode === "verify-email"
        ? sessionStorage.getItem("learnhub-verification-email")
        : ["verify-reset-code", "reset-password"].includes(mode)
          ? sessionStorage.getItem("learnhub-reset-email")
          : "") ||
      "",
  );
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState(null);
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState(location.state?.notice || "");
  const [cooldown, setCooldown] = useState(location.state?.retryAfter || 0);
  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  const destination =
    location.state?.from?.startsWith("/") &&
    !location.state.from.startsWith("//") &&
    !/^\/(login|register|verify-email|forgot-password|verify-reset-code|reset-password)(?:[/?#]|$)/.test(
      location.state.from,
    )
      ? location.state.from
      : "/my-learning";
  const signedIn = async (user) => {
    await client.cancelQueries();
    client.clear();
    client.setQueryData(keys.session, user);
    sessionStorage.removeItem("learnhub-verification-email");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate(destination, { replace: true });
  };
  const verifyRedirect = (data, notice = "") => {
    sessionStorage.setItem("learnhub-verification-email", email);
    navigate("/verify-email", {
      state: {
        email,
        retryAfter: data.retryAfter || 0,
        notice,
        from: destination,
      },
    });
  };
  const submit = useMutation({
    mutationFn: () =>
      api(`/auth/${mode}`, {
        method: "POST",
        body: {
          ...(mode !== "reset-password"
            ? { email: email.trim().toLowerCase() }
            : { confirmPassword }),
          ...(mode === "register" ? { name: name.trim() } : {}),
          ...(["login", "register", "reset-password"].includes(mode)
            ? { password }
            : {}),
          ...(["verify-email", "verify-reset-code"].includes(mode)
            ? { code }
            : {}),
        },
      }),
    onSuccess: async (data) => {
      if (data.user) {
        await signedIn(data.user);
        return;
      }
      if (mode === "register") {
        verifyRedirect(data);
        return;
      }
      if (mode === "forgot-password") {
        sessionStorage.setItem("learnhub-reset-email", email);
        navigate("/verify-reset-code", {
          state: { email, notice: data.message, retryAfter: data.retryAfter },
        });
        return;
      }
      if (mode === "verify-reset-code") {
        client.removeQueries({ queryKey: ["reset-authorization"] });
        navigate("/reset-password", { replace: true, state: { email } });
        return;
      }
      if (mode === "reset-password") {
        sessionStorage.removeItem("learnhub-reset-email");
        await client.cancelQueries();
        client.clear();
        client.setQueryData(keys.session, null);
        navigate("/login", { state: { email, notice: data.message } });
      }
    },
    onError: (error) => {
      if (error.code === "RESET_AUTHORIZATION_REQUIRED") {
        client.removeQueries({ queryKey: ["reset-authorization"] });
        navigate("/forgot-password", {
          replace: true,
          state: { email, notice: error.message },
        });
        return;
      }
      if (
        error.code === "VERIFICATION_REQUIRED" ||
        (mode === "register" && error.verificationRequired)
      )
        verifyRedirect(error, error.message);
    },
  });
  const resend = useMutation({
    mutationFn: () =>
      api(
        mode === "verify-reset-code"
          ? "/auth/forgot-password"
          : "/auth/resend-verification",
        {
          method: "POST",
          body: { email: email.trim().toLowerCase() },
        },
      ),
    onSuccess: (data) => {
      setCooldown(data.retryAfter);
      setNotice(data.message);
    },
    onError: (error) => {
      if (error.retryAfter) setCooldown(error.retryAfter);
    },
  });
  const google = useMutation({
    mutationFn: (credential) =>
      api("/auth/google", { method: "POST", body: { credential } }),
    onSuccess: (data) => signedIn(data.user),
  });
  if (session.data && ["login", "register", "verify-email"].includes(mode))
    return <Navigate to={destination} replace />;
  const [eyebrow, title, description] = copy[mode];
  const isCode = ["verify-email", "verify-reset-code"].includes(mode);
  return (
    <div className="auth-layout container">
      <aside className="auth-story">
        <p className="eyebrow">A SPACE TO GROW</p>
        <h2>
          One lesson
          <br />
          closer to
          <br />
          <em>what’s next.</em>
        </h2>
        <div className="story-line" />
        <p>
          Follow your curiosity.
          <br />
          Find your focus.
          <br />
          Keep your momentum.
        </p>
        <span className="auth-story-bottom">
          YOUR LEARNING JOURNEY, ALL TOGETHER.
        </span>
      </aside>
      <section className="auth-form-panel">
        <p className="eyebrow">{eyebrow}</p>
        {mode === "verify-email" && (
          <MailCheck className="auth-icon" size={38} />
        )}
        <h1>{title}</h1>
        <p className="muted">{description}</p>
        <form
          className="form-stack"
          onSubmit={(event) => {
            event.preventDefault();
            setNotice("");
            setFormError(null);
            if (mode === "reset-password" && password !== confirmPassword) {
              setFormError({ message: "Passwords must match." });
              return;
            }
            submit.mutate();
          }}
        >
          {mode === "register" && (
            <label>
              Full name
              <input
                autoComplete="name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={160}
              />
            </label>
          )}
          {mode !== "reset-password" && (
            <label>
              Email address
              <input
                type="email"
                autoComplete="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                maxLength={254}
              />
            </label>
          )}
          {isCode && (
            <label>
              <span id="verification-label">Verification code</span>
              <input
                aria-labelledby="verification-label"
                aria-describedby="verification-hint"
                className="code-input"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                placeholder="000000"
                maxLength={6}
                minLength={6}
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
              />
              <span id="verification-hint" className="field-hint">
                Codes expire after 10 minutes. Check your spam folder too.
              </span>
            </label>
          )}
          {["login", "register", "reset-password"].includes(mode) && (
            <label>
              <span id="password-label">
                {mode === "reset-password" ? "New password" : "Password"}
              </span>
              <span className="password-field">
                <input
                  aria-labelledby="password-label"
                  aria-describedby={
                    mode !== "login" ? "password-hint" : undefined
                  }
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  name="password"
                  minLength={mode === "login" ? 1 : 10}
                  maxLength={72}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
              {mode !== "login" && (
                <span id="password-hint" className="field-hint">
                  Use at least 10 characters. A memorable passphrase works well.
                </span>
              )}
            </label>
          )}
          {mode === "reset-password" && (
            <label>
              Confirm password
              <input
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={10}
                maxLength={72}
              />
            </label>
          )}
          {mode === "login" && (
            <Link className="text-link" to="/forgot-password">
              Forgot password?
            </Link>
          )}
          {notice && (
            <p className="notice" role="status">
              <CheckCircle2 size={18} />
              {notice}
            </p>
          )}
          <FormError error={formError} />
          <FormError error={submit.error} />
          <FormError error={resend.error} />
          {submit.error?.code === "ACCOUNT_EXISTS" && (
            <Link className="text-link" to="/login" state={{ email }}>
              Sign in to your existing account <ArrowRight size={16} />
            </Link>
          )}
          {submit.error?.code === "ALREADY_VERIFIED" && (
            <Link to="/login" className="text-link">
              Continue to sign in
            </Link>
          )}
          <Button type="submit" className="full" pending={submit.isPending}>
            {
              {
                login: "Sign in",
                register: "Create account",
                "verify-email": "Verify email",
                "forgot-password": "Send reset code",
                "verify-reset-code": "Verify reset code",
                "reset-password": "Update password",
              }[mode]
            }
            <ArrowRight size={17} />
          </Button>
        </form>
        {isCode && (
          <div className="resend-row">
            <p className="muted">Didn’t receive your code?</p>
            <Button
              className="secondary full"
              disabled={cooldown > 0 || !email}
              pending={resend.isPending}
              onClick={() => {
                setNotice("");
                resend.mutate();
              }}
            >
              {cooldown ? `Resend in ${cooldown}s` : "Send a new code"}
            </Button>
          </div>
        )}
        {["login", "register"].includes(mode) && (
          <>
            {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
              <div className="google-login">
                <span className="divider-label">or continue with Google</span>
                <GoogleLogin
                  onSuccess={(result) => google.mutate(result.credential)}
                  onError={() =>
                    setNotice(
                      "Google sign-in was interrupted. Please try again.",
                    )
                  }
                />
                <FormError error={google.error} />
              </div>
            )}
            <p className="auth-switch">
              {mode === "login" ? "New here?" : "Already have an account?"}{" "}
              <Link
                to={mode === "login" ? "/register" : "/login"}
                state={{ from: destination }}
              >
                {mode === "login" ? "Create an account" : "Sign in"}
              </Link>
            </p>
          </>
        )}
        {!["login", "register"].includes(mode) && (
          <p className="auth-switch">
            <Link to="/login">Back to sign in</Link>
          </p>
        )}
      </section>
    </div>
  );
}
