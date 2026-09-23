import { afterEach, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AccountMenu from "../components/AccountMenu";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import Notifications from "../pages/Notifications";
import { keys } from "../queries";
const user = {
  id: "user-1",
  firstName: "Faruk",
  lastName: "Learner",
  email: "faruk@example.test",
  emailVerified: true,
  portfolioUrl: "",
};
const ok = (data) => ({ ok: true, status: 200, json: async () => ({ data }) });
function mount(content) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  client.setQueryData(keys.session, user);
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>{content}</MemoryRouter>
    </QueryClientProvider>,
  );
  return client;
}
afterEach(() => vi.unstubAllGlobals());
it("account menu opens, navigates with arrows, closes with Escape and restores focus", async () => {
  const logout = { mutate: vi.fn() };
  mount(<AccountMenu user={user} logout={logout} />);
  const trigger = screen.getByRole("button", { name: "Open account menu" });
  fireEvent.click(trigger);
  expect(
    await screen.findByRole("menuitem", { name: "Profile" }),
  ).toHaveFocus();
  fireEvent.keyDown(document.activeElement, { key: "ArrowDown" });
  expect(screen.getByRole("menuitem", { name: "Settings" })).toHaveFocus();
  fireEvent.keyDown(document.activeElement, { key: "End" });
  expect(screen.getByRole("menuitem", { name: "Sign out" })).toHaveFocus();
  fireEvent.keyDown(document.activeElement, { key: "Escape" });
  expect(screen.queryByRole("menu")).toBeNull();
  expect(trigger).toHaveFocus();
});
it("account dropdown closes outside and on navigation and uses the existing logout mutation", async () => {
  const logout = { mutate: vi.fn() };
  mount(
    <Routes>
      <Route path="/" element={<AccountMenu user={user} logout={logout} />} />
      <Route path="/profile" element={<h1>Profile destination</h1>} />
    </Routes>,
  );
  const open = () =>
    fireEvent.click(screen.getByRole("button", { name: "Open account menu" }));
  open();
  fireEvent.pointerDown(document.body);
  expect(screen.queryByRole("menu")).toBeNull();
  open();
  fireEvent.click(screen.getByRole("menuitem", { name: "Sign out" }));
  expect(logout.mutate).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole("menuitem", { name: "Profile" }));
  expect(await screen.findByText("Profile destination")).toBeVisible();
});
it("profile uploads multipart to Parvis and immediately updates user and comment caches", async () => {
  const updated = {
    ...user,
    avatarUrl: "https://images.example/avatar.webp",
    image: "https://images.example/avatar.webp",
  };
  const fetch = vi.fn().mockResolvedValue(ok({ user: updated }));
  vi.stubGlobal("fetch", fetch);
  const client = mount(<Profile />);
  client.setQueryData(keys.comments("course"), {
    pages: [
      {
        items: [
          { id: "comment", author: { id: user.id, name: "Faruk", image: "" } },
        ],
      },
    ],
    pageParams: [null],
  });
  expect(screen.queryByLabelText("Profile image URL")).toBeNull();
  const file = new File(["test image bytes"], "avatar.png", {
    type: "image/png",
  });
  fireEvent.change(screen.getByLabelText("Change profile picture"), {
    target: { files: [file] },
  });
  expect(
    await screen.findByText("Your profile picture has been updated."),
  ).toBeVisible();
  const avatarCall = fetch.mock.calls.find(([path]) => /\/api\/auth\/me\/avatar$/.test(path));
  expect(avatarCall).toBeDefined();
  expect(avatarCall[1].body).toBeInstanceOf(FormData);
  expect(avatarCall[1].headers["Content-Type"]).toBeUndefined();
  expect(client.getQueryData(keys.session).avatarUrl).toBe(updated.avatarUrl);
  expect(
    client.getQueryData(keys.comments("course")).pages[0].items[0].author.image,
  ).toBe(updated.avatarUrl);
});
it("profile blocks unsupported files and shows useful upload failure", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  mount(<Profile />);
  fireEvent.change(screen.getByLabelText("Change profile picture"), {
    target: {
      files: [new File(["<svg/>"], "bad.svg", { type: "image/svg+xml" })],
    },
  });
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "PNG, JPEG, or WebP",
  );
  expect(fetch.mock.calls.some(([path]) => /\/api\/auth\/me\/avatar$/.test(path))).toBe(false);
});
it("settings reads server preferences, saves switches, and reports success", async () => {
  const fetch = vi.fn().mockImplementation(async (_path, options) =>
    ok({
      preferences:
        options.method === "PATCH"
          ? JSON.parse(options.body)
          : { email: true, inApp: true },
    }),
  );
  vi.stubGlobal("fetch", fetch);
  mount(<Settings />);
  const email = await screen.findByRole("checkbox", {
    name: /Email notifications/,
  });
  fireEvent.click(email);
  fireEvent.click(
    screen.getByRole("checkbox", { name: /In-app notifications/ }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Save preferences" }));
  expect(
    await screen.findByText("Your notification preferences have been saved."),
  ).toBeVisible();
  expect(
    JSON.parse(fetch.mock.calls.find(([, o]) => o.method === "PATCH")[1].body),
  ).toEqual({ email: false, inApp: false });
});
it("settings failure remains visible and retryable", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Offline")));
  mount(<Settings />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Unable to connect",
  );
  expect(screen.getByRole("button", { name: "Try again" })).toBeVisible();
});
it("notifications shows an honest empty state", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(ok({ items: [], nextCursor: null })),
  );
  mount(<Notifications />);
  expect(await screen.findByText("You’re all caught up")).toBeVisible();
  expect(screen.queryByText("You’re enrolled")).toBeNull();
});
it("notifications renders real API records and marks them read", async () => {
  const fetch = vi.fn().mockResolvedValue(
    ok({
      items: [
        {
          id: "123",
          title: "You’re enrolled",
          body: "Your real course",
          href: "/learn/course",
          createdAt: new Date().toISOString(),
        },
      ],
      nextCursor: null,
    }),
  );
  vi.stubGlobal("fetch", fetch);
  mount(<Notifications />);
  expect(await screen.findByText("Your real course")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Mark as read" }));
  await waitFor(() =>
    expect(
      fetch.mock.calls.some(
        ([path, options]) =>
          path.endsWith("/api/notifications/123/read") &&
          options.method === "PATCH",
      ),
    ).toBe(true),
  );
});
it("notification API failure never becomes an empty inbox", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Offline")));
  mount(<Notifications />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Unable to connect",
  );
  expect(screen.queryByText("You’re all caught up")).toBeNull();
});
