import { afterEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Settings from "../pages/Settings";
import Landing from "../pages/Landing";
import { ThemeProvider } from "../components/ThemeProvider";
import { keys } from "../queries";

const user = { id: "user-1", firstName: "Faruk", lastName: "Learner", email: "faruk@example.test", emailVerified: true };
const plans = [
  { id: "free", name: "Free", amount: 0, currency: "NGN", interval: null, activeCourses: 1, description: "A useful plan.", features: ["Course progress"] },
  { id: "growth", name: "Growth", amount: 250000, currency: "NGN", interval: "monthly", activeCourses: 3, description: "For consistent study.", features: ["Everything in Free"] },
  { id: "pro", name: "Pro", amount: 500000, currency: "NGN", interval: "monthly", activeCourses: 7, description: "More capacity.", features: ["Everything in Growth"] },
];
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

it("renders real billing usage and upgrade choices from the backend", async () => {
  const billing = { plan: "free", planName: "Free", price: 0, status: "free", activeCourses: { used: 1, limit: 1, remaining: 0 }, usage: { ai_summary: { used: 2, limit: 5, remaining: 3 }, ask_ai: { used: 1, limit: 5, remaining: 4 }, study_notes: { used: 0, limit: 1, remaining: 1 }, practice_quiz: { used: 0, limit: 1, remaining: 1 }, practical_question: { used: 0, limit: 1, remaining: 1 }, practical_feedback: { used: 0, limit: 1, remaining: 1 } } };
  const fetch = vi.fn().mockImplementation(async (path, options = {}) => options.method === "POST" ? ok({ authorizationUrl: "https://checkout.paystack.com/test", reference: "lh-test" }) : path.endsWith("/billing/plans") ? ok({ items: plans }) : ok(billing));
  vi.stubGlobal("fetch", fetch);
  mount(<Routes><Route path="/settings/:section?" element={<Settings />} /></Routes>, "/settings/billing");
  expect(await screen.findByText("Your usage")).toBeVisible();
  expect(screen.getByText("2 / 5")).toBeVisible();
  expect(screen.getByRole("button", { name: "Upgrade to Growth" })).toBeVisible();
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
    if (path.endsWith("/billing/plans")) return ok({ items: plans });
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

it("creates and lists authenticated support tickets from Settings", async () => {
  let created = false;
  const fetch = vi.fn().mockImplementation(async (path, options = {}) => {
    if (path.endsWith("/support/me") && options.method === "GET") return ok({ items: created ? [{ id: "507f1f77bcf86cd799439011", subject: "Certificate missing", category: "quiz_certificate", status: "open", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] : [], nextCursor: null });
    if (path.endsWith("/support") && options.method === "POST") { created = true; return { ok: true, status: 201, json: async () => ({ data: { requestId: "507f1f77bcf86cd799439011", message: "received" } }) }; }
    return ok({});
  });
  vi.stubGlobal("fetch", fetch);
  mount(<Routes><Route path="/settings/:section?" element={<Settings />} /></Routes>, "/settings/support");
  expect(await screen.findByText("No support tickets yet")).toBeVisible();
  fireEvent.click(screen.getAllByRole("button", { name: "Create Ticket" })[0]);
  fireEvent.change(screen.getByLabelText("Subject"), { target: { value: "Certificate missing" } });
  fireEvent.change(screen.getByLabelText("Category"), { target: { value: "quiz_certificate" } });
  fireEvent.change(screen.getByLabelText("Message"), { target: { value: "I completed the course but cannot find it." } });
  fireEvent.click(screen.getByRole("button", { name: "Submit Ticket" }));
  expect(await screen.findByText("Certificate missing")).toBeVisible();
  expect(fetch.mock.calls.some(([path, options]) => path.endsWith("/api/support") && options.method === "POST")).toBe(true);
});

it("opens a support conversation from a notification deep link and persists a reply", async () => {
  const id = "507f1f77bcf86cd799439011";
  const fetch = vi.fn().mockImplementation(async (path, options = {}) => {
    if (path.endsWith(`/support/me/${id}/reply`) && options.method === "POST") return ok({ message: "Reply sent." });
    if (path.endsWith(`/support/me/${id}`)) return ok({ request: { id, subject: "Billing question", category: "billing_subscription", status: "in_progress", message: "Please clarify my plan.", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), responses: [{ id: "r1", body: "We are checking it.", senderType: "ADMIN", sentAt: new Date().toISOString() }] } });
    if (path.includes("/support/me")) return ok({ items: [], nextCursor: null });
    return ok({});
  });
  vi.stubGlobal("fetch", fetch);
  mount(<Routes><Route path="/settings/:section?" element={<Settings />} /></Routes>, `/settings/support?ticket=${id}`);
  expect(await screen.findByRole("dialog", { name: /Ticket details|Billing question/ })).toBeVisible();
  expect(await screen.findByText("Parvis Support")).toBeVisible();
  fireEvent.change(screen.getByLabelText("Reply"), { target: { value: "Thank you for checking." } });
  fireEvent.click(screen.getByRole("button", { name: "Send Reply" }));
  await waitFor(() => expect(fetch.mock.calls.some(([path, options]) => path.endsWith(`/support/me/${id}/reply`) && options.method === "POST")).toBe(true));
});
