import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Auth from "../pages/Auth";
import ResetAuthorization from "../components/ResetAuthorization";
import { keys } from "../queries";
vi.mock("@react-oauth/google", () => ({ GoogleLogin: () => null }));
const response = (data, status = 200) => ({
  ok: status < 400,
  status,
  json: async () => (status < 400 ? { data } : { error: data }),
});
function mount(path, state) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  client.setQueryData(keys.session, null);
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[{ pathname: path, state }]}>
        <Routes>
          {[
            "login",
            "register",
            "verify-email",
            "forgot-password",
            "verify-reset-code",
          ].map((mode) => (
            <Route
              key={mode}
              path={`/${mode}`}
              element={<Auth key={mode} mode={mode} />}
            />
          ))}
          <Route element={<ResetAuthorization />}>
            <Route
              path="/reset-password"
              element={<Auth mode="reset-password" />}
            />
          </Route>
          <Route path="/my-learning" element={<h1>Learning application</h1>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return client;
}
afterEach(() => {
  vi.unstubAllGlobals();
  sessionStorage.clear();
});
describe("authentication flow boundaries", () => {
  it("verified login sends only credentials and goes straight to the app, even with stale verification state", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(response({ user: { id: "1", emailVerified: true } }));
    vi.stubGlobal("fetch", fetch);
    sessionStorage.setItem(
      "learnhub-verification-email",
      "unrelated@example.test",
    );
    mount("/login", { from: "/verify-email" });
    expect(screen.getByLabelText("Email address")).toHaveValue("");
    expect(screen.queryByLabelText("Verification code")).toBeNull();
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "verified@example.test" },
    });
    fireEvent.change(screen.getByLabelText("Password", { exact: true }), {
      target: { value: "valid-password" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Sign in", exact: true }),
    );
    expect(await screen.findByText("Learning application")).toBeVisible();
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      email: "verified@example.test",
      password: "valid-password",
    });
  });
  it("only an explicit unverified response routes login to Verify Email", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response(
          {
            code: "VERIFICATION_REQUIRED",
            email: "pending@example.test",
            message: "Verify your email before signing in.",
          },
          403,
        ),
      ),
    );
    mount("/login");
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "pending@example.test" },
    });
    fireEvent.change(screen.getByLabelText("Password", { exact: true }), {
      target: { value: "valid-password" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Sign in", exact: true }),
    );
    expect(
      await screen.findByRole("button", { name: "Verify email", exact: true }),
    ).toBeVisible();
    expect(screen.getByLabelText("Verification code")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Send a new code" }),
    ).toBeEnabled();
  });
  it("forgot password opens code verification without exposing the password form", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response({
          message: "If that account exists, a reset code has been sent.",
          retryAfter: 60,
        }),
      ),
    );
    mount("/forgot-password");
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "learner@example.test" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reset code" }));
    expect(
      await screen.findByRole("button", { name: "Verify reset code" }),
    ).toBeVisible();
    expect(screen.queryByLabelText("New password")).toBeNull();
    expect(screen.getByRole("button", { name: /Resend in/ })).toBeDisabled();
  });
  it("wrong reset codes keep the learner on Verify Code", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          response(
            { code: "INVALID_CODE", message: "That code is incorrect." },
            400,
          ),
        ),
    );
    mount("/verify-reset-code", { email: "learner@example.test" });
    fireEvent.change(screen.getByLabelText("Verification code"), {
      target: { value: "000000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify reset code" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("incorrect");
    expect(screen.queryByLabelText("New password")).toBeNull();
  });
  it("resending a reset code uses password recovery, not signup verification", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(response({ message: "Code sent.", retryAfter: 60 }));
    vi.stubGlobal("fetch", fetch);
    mount("/verify-reset-code", { email: "learner@example.test" });
    fireEvent.click(screen.getByRole("button", { name: "Send a new code" }));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(fetch.mock.calls[0][0]).toMatch(/\/api\/auth\/forgot-password$/);
  });
  it("direct reset navigation requires a server-approved grant even if local state claims success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(response({ authorized: false })),
    );
    sessionStorage.setItem("learnhub-reset-email", "learner@example.test");
    mount("/reset-password", { authorized: true });
    expect(screen.queryByLabelText("New password")).toBeNull();
    expect(
      await screen.findByRole("button", { name: "Send reset code" }),
    ).toBeVisible();
  });
  it("reset authorization network errors offer retry and never show the password form", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Network unavailable")),
    );
    mount("/reset-password");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to connect",
    );
    expect(screen.queryByLabelText("New password")).toBeNull();
    expect(screen.getByRole("button", { name: "Try again" })).toBeVisible();
  });
  it("authorized reset shows only new and confirm password, checks mismatch, then clears authorization and returns to login", async () => {
    const fetch = vi.fn().mockImplementation(async (path) =>
      path.endsWith("reset-authorization")
        ? response({
            authorized: true,
            expiresAt: new Date(Date.now() + 600000).toISOString(),
          })
        : response({
            message: "Password updated. Sign in with your new password.",
          }),
    );
    vi.stubGlobal("fetch", fetch);
    mount("/reset-password", { email: "learner@example.test" });
    const password = await screen.findByLabelText("New password");
    expect(screen.queryByLabelText("Email address")).toBeNull();
    expect(screen.queryByLabelText("Verification code")).toBeNull();
    fireEvent.change(password, { target: { value: "new-long-password" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "mismatched-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Passwords must match",
    );
    expect(fetch).toHaveBeenCalledTimes(1);
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "new-long-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));
    expect(
      await screen.findByText(
        "Password updated. Sign in with your new password.",
      ),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Sign in", exact: true }),
    ).toBeVisible();
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({
      password: "new-long-password",
      confirmPassword: "new-long-password",
    });
  });
  it("authorization rejected at submission removes the reset form", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (path) =>
        path.endsWith("reset-authorization")
          ? response({
              authorized: true,
              expiresAt: new Date(Date.now() + 600000).toISOString(),
            })
          : response(
              {
                code: "RESET_AUTHORIZATION_REQUIRED",
                message: "Verify a new reset code.",
              },
              403,
            ),
      ),
    );
    mount("/reset-password");
    fireEvent.change(await screen.findByLabelText("New password"), {
      target: { value: "new-long-password" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "new-long-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));
    expect(
      await screen.findByRole("button", { name: "Send reset code" }),
    ).toBeVisible();
    expect(screen.queryByLabelText("New password")).toBeNull();
  });
});
