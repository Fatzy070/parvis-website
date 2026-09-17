import { afterEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Settings from "../pages/Settings";
import Landing from "../pages/Landing";
import { ThemeProvider } from "../components/ThemeProvider";
import { keys } from "../queries";

const user = { id: "user-1", firstName: "Faruk", lastName: "Learner", email: "faruk@example.test", emailVerified: true };
const ok = (data) => ({ ok: true, status: 200, json: async () => ({ data }) });
function mount(content, path = "/") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  client.setQueryData(keys.session, user);
  render(<QueryClientProvider client={client}><ThemeProvider><MemoryRouter initialEntries={[path]}>{content}</MemoryRouter></ThemeProvider></QueryClientProvider>);
  return client;
}
afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); delete document.startViewTransition; delete document.documentElement.animate; });

it("opens settings sections and submits authenticated password changes", async () => {
  const fetch = vi.fn().mockResolvedValue(ok({ message: "Password updated. Other signed-in sessions were revoked." }));
  vi.stubGlobal("fetch", fetch);
  mount(<Routes><Route path="/settings/:section?" element={<Settings />} /></Routes>, "/settings/security");
  expect(screen.getByRole("heading", { name: "Change password" })).toBeVisible();
  fireEvent.change(screen.getByLabelText("Current password"), { target: { value: "current-passphrase" } });
  fireEvent.change(screen.getByLabelText("New password"), { target: { value: "new-password-value" } });
  fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "new-password-value" } });
  fireEvent.click(screen.getByRole("button", { name: "Update password" }));
  expect(await screen.findByText(/Password updated/)).toBeVisible();
  expect(fetch.mock.calls[0][0]).toMatch(/\/api\/auth\/me\/password$/);
});

it("lists actual sessions and revokes a selected non-current session", async () => {
  const fetch = vi.fn().mockImplementation(async (path, options = {}) => {
    if (options.method === "DELETE") return ok({ message: "Session revoked." });
    return ok({ sessions: [
      { id: "current", browser: "Chrome", platform: "Linux", lastActiveAt: new Date().toISOString(), current: true },
      { id: "other", browser: "Safari", platform: "iOS", lastActiveAt: new Date().toISOString(), current: false },
    ], knownDevices: [] });
  });
  vi.stubGlobal("fetch", fetch);
  mount(<Routes><Route path="/settings/:section?" element={<Settings />} /></Routes>, "/settings/devices");
  expect(await screen.findByText("Chrome on Linux")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Revoke" }));
  await waitFor(() => expect(fetch.mock.calls.some(([path, options]) => path.endsWith("/auth/me/sessions/other") && options.method === "DELETE")).toBe(true));
});

it("persists System theme and uses the radial transition only when motion is allowed", async () => {
  const transition = vi.fn((callback) => { callback(); return { ready: Promise.resolve() }; });
  document.startViewTransition = transition;
  document.documentElement.animate = vi.fn();
  vi.stubGlobal("matchMedia", vi.fn((query) => ({ matches: query.includes("dark"), media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  mount(<Routes><Route path="/settings/:section?" element={<Settings />} /></Routes>, "/settings/appearance");
  fireEvent.click(screen.getByRole("radio", { name: "Dark" }));
  await waitFor(() => expect(transition).toHaveBeenCalledOnce());
  expect(localStorage.getItem("learnhub-theme")).toBe("dark");
  fireEvent.click(screen.getByRole("radio", { name: "System" }));
  expect(localStorage.getItem("learnhub-theme")).toBe("system");
  expect(document.documentElement.dataset.theme).toBe("dark");
});

it("submits the public support form and never fakes a failed request", async () => {
  const fetch = vi.fn().mockImplementation(async (path) => {
    if (path.includes("/courses")) return ok({ items: [], page: 1, hasMore: false });
    return ok({ requestId: "request-1", message: "Your support request has been received." });
  });
  vi.stubGlobal("fetch", fetch);
  const client = mount(<Landing />);
  client.setQueryData(keys.session, null);
  fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Guest Learner" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "guest@example.test" } });
  fireEvent.change(screen.getByLabelText("Subject"), { target: { value: "Account question" } });
  fireEvent.change(screen.getByLabelText("How can we help?"), { target: { value: "I need help signing into my account." } });
  fireEvent.click(screen.getByRole("button", { name: /Send message/ }));
  expect(await screen.findByText("Message received.")).toBeVisible();
  expect(fetch.mock.calls.some(([path, options]) => path.endsWith("/api/support") && options.method === "POST")).toBe(true);
});
