import { useState } from "react";
import { Link, NavLink, Navigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CreditCard, KeyRound, Laptop, LifeBuoy, Monitor, Moon, Sun, UserRound } from "lucide-react";
import { keys, useChangePassword, usePreferences, useRevokeSessions, useSession, useSessions } from "../queries";
import { api } from "../api/client";
import { useTheme } from "../components/ThemeProvider";
import Avatar from "../components/Avatar";
import Billing from "./Billing";
import SettingsSupport from "./SettingsSupport";
import { Button, ErrorState, FormError, PageHeading, PageSkeleton } from "../components/UI";
import { SEO } from "../components/SEO";

const sections = [
  ["account", "Account", UserRound], ["security", "Security", KeyRound],
  ["notifications", "Notifications", Bell], ["appearance", "Appearance", Sun],
  ["devices", "Devices & sessions", Laptop],
  ["billing", "Billing", CreditCard],
  ["support", "Support", LifeBuoy]
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

function ReminderTimeSelector({ value, onChange }) {
  const parseTime = (timeStr) => {
    const [hStr, mStr] = (timeStr || "19:00").split(":");
    let h = parseInt(hStr, 10);
    const m = mStr;
    const period = h >= 12 ? "PM" : "AM";
    let hour12 = h % 12;
    if (hour12 === 0) hour12 = 12;
    return { hour12: String(hour12), minute: m, period };
  };

  const { hour12, minute, period } = parseTime(value);

  const handleChange = (newH, newM, newP) => {
    let h = parseInt(newH, 10);
    if (newP === "AM" && h === 12) h = 0;
    if (newP === "PM" && h !== 12) h += 12;
    onChange(`${String(h).padStart(2, '0')}:${newM.padStart(2, '0')}`);
  };

  return (
    <div className="time-selector" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <select style={{ width: 'auto', minWidth: '4rem' }} value={hour12} onChange={(e) => handleChange(e.target.value, minute, period)}>
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
          ))}
        </select>
        <span style={{ fontWeight: 600 }}>:</span>
        <select style={{ width: 'auto', minWidth: '4rem' }} value={minute} onChange={(e) => handleChange(hour12, e.target.value, period)}>
          {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <select style={{ width: 'auto', minWidth: '5rem' }} value={period} onChange={(e) => handleChange(hour12, minute, e.target.value)}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

function PreferencesForm({ preferences }) {
  const client = useQueryClient();
  const [draft, setDraft] = useState(preferences);
  const [pushError, setPushError] = useState("");
  const [pushBusy, setPushBusy] = useState(false);
  const save = useMutation({ 
    mutationFn: () => {
      const payload = { ...draft };
      if (payload.studyReminder) {
        payload.studyReminder.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      }
      return api("/auth/me/notification-preferences", { method: "PATCH", body: payload });
    }, 
    onSuccess: (data) => { client.setQueryData(keys.preferences, data); client.invalidateQueries({ queryKey: keys.session }); } 
  });
  return <form className="settings-card form-stack" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
    <h2>Notification preferences</h2>
    {[["email", "Email notifications", "Course and enrollment updates."], ["inApp", "In-app notifications", "Updates in your Parvis inbox."]].map(([key, label, description]) => <label className="preference-row" key={key}><span><strong>{label}</strong><span className="muted">{description}</span></span><input type="checkbox" checked={draft[key]} onChange={(event) => { setDraft({ ...draft, [key]: event.target.checked }); save.reset(); }} /></label>)}
    <p className="field-hint">Verification, password reset, welcome, and security emails always remain enabled.</p>
    
    <div className="section-divider" style={{ margin: "24px 0", borderTop: "1px solid var(--border-subtle)" }}></div>
    <h2>Learning reminders</h2>
    <label className="preference-row">
      <span><strong>Daily study reminder</strong><span className="muted">Receive an in-app notification when it's time to learn.</span></span>
      <input type="checkbox" checked={draft.studyReminder?.enabled || false} onChange={(event) => { setDraft({ ...draft, studyReminder: { ...draft.studyReminder, enabled: event.target.checked } }); save.reset(); }} />
    </label>
    {draft.studyReminder?.enabled && (
      <label>Reminder time
        <ReminderTimeSelector value={draft.studyReminder?.time || "19:00"} onChange={(time) => { setDraft({ ...draft, studyReminder: { ...draft.studyReminder, time } }); save.reset(); }} />
      </label>
    )}

    <div className="section-divider" style={{ margin: "24px 0", borderTop: "1px solid var(--border-subtle)" }}></div>
    <h2>Browser notifications</h2>
    <label className="preference-row">
      <span><strong>Push notifications</strong><span className="muted">Receive alerts on your device even when Parvis is closed.</span></span>
      <input type="checkbox" aria-describedby="push-status" disabled={pushBusy} checked={draft.webPush?.enabled || false} onChange={async (event) => { 
        const enabled = event.target.checked;
        setPushError("");
        setPushBusy(true);
        setDraft({ ...draft, webPush: { ...draft.webPush, enabled } });
        save.reset();
        
        if (enabled && 'serviceWorker' in navigator && 'PushManager' in window) {
          try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              const registration = await navigator.serviceWorker.ready;
              const { publicKey } = await api("/auth/web-push/vapid");
              
              const base64ToUint8Array = (base64) => {
                const padding = '='.repeat((4 - base64.length % 4) % 4);
                const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
                const rawData = window.atob(b64);
                return new Uint8Array([...rawData].map(c => c.charCodeAt(0)));
              };
              
              const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: base64ToUint8Array(publicKey)
              });
              await api("/auth/web-push/subscribe", { method: "POST", body: subscription.toJSON() });
            } else throw new Error("Browser notification permission was not granted.");
          } catch (err) {
            setPushError(err.message || "Browser notifications could not be enabled.");
            setDraft({ ...draft, webPush: { ...draft.webPush, enabled: false } });
          }
        } else if (!enabled) {
          try {
            const registration = await navigator.serviceWorker?.ready;
            const subscription = await registration?.pushManager?.getSubscription();
            if (subscription) {
              await api("/auth/web-push/unsubscribe", { method: "POST", body: { endpoint: subscription.endpoint } });
              await subscription.unsubscribe();
            }
            await api("/auth/web-push/toggle", { method: "POST", body: { enabled: false } });
          } catch (err) {
            setPushError(err.message || "Browser notifications could not be disabled.");
          }
        } else {
          setPushError("This browser does not support push notifications.");
          setDraft({ ...draft, webPush: { ...draft.webPush, enabled: false } });
        }
        setPushBusy(false);
      }} />
    </label>
    <p id="push-status" className={pushError ? "form-error" : "field-hint"} role={pushError ? "alert" : undefined}>{pushError || (pushBusy ? "Updating browser notifications…" : "Each browser can be enabled separately.")}</p>


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
  return <section className="settings-card"><h2>Appearance</h2><p className="muted">Choose a theme or let Parvis follow your device.</p>
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

const content = { account: AccountSettings, security: SecuritySettings, notifications: NotificationSettings, appearance: AppearanceSettings, devices: DevicesSettings, billing: Billing, support: SettingsSupport };
export default function Settings() {
  const { section = "notifications" } = useParams();
  if (!content[section]) return <Navigate to="/settings/account" replace />;
  const Content = content[section];
  return <div className="container section settings-page">
    <SEO title="Settings | Parvis" noindex />
    <PageHeading eyebrow="YOUR SPACE" title="Settings">Keep your account comfortable and secure.</PageHeading><div className="settings-layout"><nav className="settings-nav" aria-label="Settings sections">{sections.map(([path, label, Icon]) => <NavLink key={path} to={`/settings/${path}`}><Icon size={18} />{label}</NavLink>)}</nav><div className="settings-content"><Content /></div></div></div>;
}
