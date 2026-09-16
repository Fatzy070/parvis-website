import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { UserRound, Settings, Bell, LogOut } from "lucide-react";
import Avatar from "./Avatar";
export default function AccountMenu({ user, logout }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  const panel = useRef(null);
  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector('[role="menuitem"]')?.focus();
    const outside = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  return (
    <div
      className="account-menu"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          close();
        }
        if (
          open &&
          ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)
        ) {
          event.preventDefault();
          const items = [
            ...panel.current.querySelectorAll('[role="menuitem"]'),
          ];
          const index = items.indexOf(document.activeElement);
          items[
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? items.length - 1
                : (index +
                    (event.key === "ArrowDown" ? 1 : -1) +
                    items.length) %
                  items.length
          ]?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        className="account-trigger"
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="account-dropdown"
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <Avatar user={user} />
      </button>
      {open && (
        <div id="account-dropdown" className="account-dropdown" ref={panel}>
          <div className="account-identity">
            <Avatar user={user} />
            <div>
              <strong>
                {user.firstName} {user.lastName}
              </strong>
              <span>{user.email}</span>
            </div>
          </div>
          <div role="menu" aria-label="Account">
            {[
              ["/profile", "Profile", UserRound],
              ["/settings", "Settings", Settings],
              ["/notifications", "Notifications", Bell],
            ].map(([to, label, Icon]) => (
              <Link
                role="menuitem"
                key={to}
                to={to}
                onClick={() => setOpen(false)}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
            <div className="account-divider" />
            <button
              role="menuitem"
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
            >
              <LogOut size={18} />
              {logout.isPending ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
