import { useState } from "react";
import { Link, NavLink, Navigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, KeyRound, Laptop, Monitor, Moon, Sun, UserRound } from "lucide-react";
import { keys, useChangePassword, usePreferences, useRevokeSessions, useSession, useSessions } from "../queries";
import { api } from "../api/client";
import { useTheme } from "../components/ThemeProvider";
import Avatar from "../components/Avatar";
import { Button, ErrorState, FormError, PageHeading, PageSkeleton } from "../components/UI";

const sections = [
  ["account", "Account", UserRound], ["security", "Security", KeyRound],
  ["notifications", "Notifications", Bell], ["appearance", "Appearance", Sun],
  ["devices", "Devices & sessions", Laptop],
];

function AccountSettings() {
  const { data: user } = useSession();
  return <section className="settings-card">
    <div className="settings-identity"><Avatar user={user} /><div><h2>{`${user.firstName} ${user.lastName}`.trim()}</h2><p className="muted">{user.email}</p></div></div>
    <p>Manage your name, portfolio, and profile picture from your full profile.</p>
    <Link className="button secondary" to="/profile">Edit profile</Link>
  </section>;
}

function SecuritySettings() {
  const change = useChangePassword();
  const [values, setValues] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const field = (key) => ({ value: values[key], onChange: (event) => { setValues({ ...values, [key]: event.target.value }); change.reset(); } });
  return <form className="settings-card form-stack" onSubmit={(event) => { event.preventDefault(); change.mutate(values, { onSuccess: () => setValues({ currentPassword: "", newPassword: "", confirmPassword: "" }) }); }}>
    <h2>Change password</h2><p className="muted">Use at least 10 characters. Changing it signs out your other sessions.</p>
    <label>Current password<input type="password" autoComplete="current-password" required {...field("currentPassword")} /></label>
    <label>New password<input type="password" autoComplete="new-password" minLength="10" required {...field("newPassword")} /></label>
    <label>Confirm new password<input type="password" autoComplete="new-password" minLength="10" required {...field("confirmPassword")} /></label>
    <FormError error={change.error} />
    {change.isSuccess && <p className="notice" role="status">{change.data.message}</p>}
    <Button type="submit" pending={change.isPending}>Update password</Button>
  </form>;
}

function PreferencesForm({ preferences }) {
  const client = useQueryClient();
  const [draft, setDraft] = useState(preferences);
  const save = useMutation({ mutationFn: () => api("/auth/me/notification-preferences", { method: "PATCH", body: draft }), onSuccess: (data) => { client.setQueryData(keys.preferences, data); client.invalidateQueries({ queryKey: keys.session }); } });
  return <form className="settings-card form-stack" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
    <h2>Notification preferences</h2>
    {[["email", "Email notifications", "Course and enrollment updates."], ["inApp", "In-app notifications", "Updates in your LearnHub inbox."]].map(([key, label, description]) => <label className="preference-row" key={key}><span><strong>{label}</strong><span className="muted">{description}</span></span><input type="checkbox" checked={draft[key]} onChange={(event) => { setDraft({ ...draft, [key]: event.target.checked }); save.reset(); }} /></label>)}
    <p className="field-hint">Verification, password reset, welcome, and security emails always remain enabled.</p>
    <FormError error={save.error} />
    {save.isSuccess && <p className="notice" role="status">Your notification preferences have been saved.</p>}
    <Button type="submit" pending={save.isPending}>Save preferences</Button>
  </form>;
}

function NotificationSettings() {
  const query = usePreferences();
  if (query.isPending) return <PageSkeleton />;
  if (query.isError) return <ErrorState error={query.error} retry={query.refetch} />;
  return <PreferencesForm preferences={query.data.preferences} />;
}

function AppearanceSettings() {
  const { preference, setTheme } = useTheme();
  return <section className="settings-card"><h2>Appearance</h2><p className="muted">Choose a theme or let LearnHub follow your device.</p>
    <div className="theme-options" role="radiogroup" aria-label="Color theme">
      {[["light", "Light", Sun], ["dark", "Dark", Moon], ["system", "System", Monitor]].map(([value, label, Icon]) => <button key={value} type="button" role="radio" aria-checked={preference === value} className={preference === value ? "selected" : ""} onClick={() => setTheme(value)}><Icon size={22} /><strong>{label}</strong></button>)}
    </div>
  </section>;
}

function DevicesSettings() {
  const query = useSessions();
  const revoke = useRevokeSessions();
  if (query.isPending) return <PageSkeleton />;
  if (query.isError) return <ErrorState error={query.error} retry={query.refetch} />;
  return <section className="settings-card form-stack">
    <div className="row-between"><div><h2>Active sessions</h2><p className="muted">Browsers currently signed into your account.</p></div>{query.data.sessions.some((item) => !item.current) && <Button className="secondary" pending={revoke.isPending} onClick={() => revoke.mutate(null)}>Sign out others</Button>}</div>
    <FormError error={revoke.error} />
    <div className="session-list">{query.data.sessions.map((item) => <article key={item.id}><Laptop aria-hidden="true" /><div><strong>{item.browser} on {item.platform}</strong><span className="muted">{item.lastActiveAt ? `Last active ${new Date(item.lastActiveAt).toLocaleString()}` : "Activity time unavailable"}</span></div>{item.current ? <span className="current-badge">Current</span> : <button type="button" className="text-link" onClick={() => revoke.mutate(item.id)}>Revoke</button>}</article>)}</div>
    {query.data.knownDevices.length > 0 && <details className="known-devices"><summary>Known browsers ({query.data.knownDevices.length})</summary><p className="muted">Used only for new-device security alerts. Clearing your browser cookie can register it again.</p></details>}
  </section>;
}

const content = { account: AccountSettings, security: SecuritySettings, notifications: NotificationSettings, appearance: AppearanceSettings, devices: DevicesSettings };
export default function Settings() {
  const { section = "notifications" } = useParams();
  if (!content[section]) return <Navigate to="/settings/account" replace />;
  const Content = content[section];
  return <div className="container section settings-page"><PageHeading eyebrow="YOUR SPACE" title="Settings">Keep your account comfortable and secure.</PageHeading><div className="settings-layout"><nav className="settings-nav" aria-label="Settings sections">{sections.map(([path, label, Icon]) => <NavLink key={path} to={`/settings/${path}`}><Icon size={18} />{label}</NavLink>)}</nav><div className="settings-content"><Content /></div></div></div>;
}
