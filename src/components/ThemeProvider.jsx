/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const media = (query = "(prefers-color-scheme: dark)") =>
  typeof window.matchMedia === "function"
    ? window.matchMedia(query)
    : { matches: false, addEventListener() {}, removeEventListener() {} };
const resolve = (preference) =>
  preference === "system" ? (media().matches ? "dark" : "light") : preference;
const initialPreference = () => {
  const stored = localStorage.getItem("learnhub-theme");
  return ["light", "dark", "system"].includes(stored) ? stored : "system";
};

export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(initialPreference);
  const [resolvedTheme, setResolvedTheme] = useState(() => resolve(preference));

  const apply = (next) => {
    const resolved = resolve(next);
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themePreference = next;
    localStorage.setItem("learnhub-theme", next);
    setPreferenceState(next);
    setResolvedTheme(resolved);
  };

  useEffect(() => {
    apply(preference);
    const scheme = media();
    const changed = () => preference === "system" && apply("system");
    scheme.addEventListener("change", changed);
    return () => scheme.removeEventListener("change", changed);
  }, [preference]);

  const setTheme = (next) => {
    if (!["light", "dark", "system"].includes(next) || next === preference)
      return;
    const reduced = media("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduced) return apply(next);
    const transition = document.startViewTransition(() => apply(next));
    transition.ready.then(() => {
      const radius = Math.hypot(window.innerWidth, window.innerHeight);
      document.documentElement.animate(
        {
          clipPath: ["circle(0px at 50% 50%)", `circle(${radius}px at 50% 50%)`],
        },
        {
          duration: 420,
          easing: "ease-out",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  const value = { preference, resolvedTheme, setTheme };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
