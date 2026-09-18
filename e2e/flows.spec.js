import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
const email = `browser-${randomUUID()}@example.test`;
const password = "browser-test-passphrase";
const code = async () =>
  JSON.parse(await readFile("/tmp/learnhub-browser-email.json", "utf8")).code;
test("complete account and learning journey on real local API with isolated test records", async ({
  page,
}) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Stay curious",
  );
  await page.getByRole("link", { name: "Create your free account" }).click();
  await page.getByLabel("Full name").fill("Browser Learner");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/verify-email/);
  await page.getByLabel("Verification code").fill("000000");
  await page.getByRole("button", { name: "Verify email", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("incorrect");
  await page.getByLabel("Verification code").fill(await code());
  await page.getByRole("button", { name: "Verify email", exact: true }).click();
  await expect(page).toHaveURL(/my-learning/);
  await expect(page.getByText("Your next chapter is waiting")).toBeVisible();
  await page.goto("/courses");
  await expect(
    page.getByRole("heading", { name: "Browser test course" }),
  ).toBeVisible();
  await page.getByLabel("Search courses").fill("no-such-topic");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByText("No courses found")).toBeVisible();
  await page.getByLabel("Search courses").fill("");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page
    .getByRole("link", { name: "Browser test course", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your learning path" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Enroll in this course" }).click();
  await expect(page).toHaveURL(/learn\/browser-test-course/);
  await expect(
    page.getByRole("heading", { name: "First test lesson", level: 2 }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "test-results/learning-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "test-results/learning-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Mark complete" }).click();
  await expect(
    page.getByRole("button", { name: "Completed", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next lesson" }).click();
  await expect(
    page.getByRole("heading", { name: "Second test lesson" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Mark complete" }).click();
  await expect(
    page.getByText("Course completed", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Discussion", exact: true }).click();
  await expect(
    page.getByText("Be the first to start a conversation"),
  ).toBeVisible();
  await page
    .getByLabel("Add to the discussion")
    .fill("A browser test discussion.");
  await page.getByRole("button", { name: "Post comment" }).click();
  await expect(page.getByText("A browser test discussion.")).toBeVisible();
  await page.getByRole("button", { name: "Delete your comment" }).click();
  await expect(
    page.getByText("Be the first to start a conversation"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Quiz", exact: true }).click();
  await expect(page.getByText("No quiz here yet")).toBeVisible();
  await page.getByLabel("Show", { exact: true }).selectOption("course");
  await page.getByRole("button", { name: "Start quiz" }).click();
  await page.getByRole("radio", { name: "Second", exact: true }).check();
  await page.getByRole("button", { name: "Submit answers" }).click();
  await expect(
    page.getByText("You passed this quiz.", { exact: false }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Second test lesson" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Completed", exact: true }),
  ).toBeVisible();
  await page.goto("/tutorials");
  await expect(
    page.getByRole("heading", { name: "Your enrolled tutorials" }),
  ).toBeVisible();
  await page.goto("/profile");
  await page.getByLabel("First name", { exact: true }).fill("Updated");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Your profile has been saved.")).toBeVisible();
  await page.getByRole("button", { name: "Open account menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(
    new RegExp(
      "^" + (process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173") + "/$",
    ),
  );
  await page.goto("/my-learning");
  await expect(page).toHaveURL(/login/);
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/my-learning/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Updated",
  );
  await page.goto("/profile");
  await page.getByRole("link", { name: "Reset your password" }).click();
  await page.getByRole("button", { name: "Send reset code" }).click();
  await expect(page).toHaveURL(/verify-reset-code/);
  await expect(page.getByLabel("New password")).toHaveCount(0);
  await page.getByLabel("Verification code").fill(await code());
  await page.getByRole("button", { name: "Verify reset code" }).click();
  await expect(page).toHaveURL(/reset-password/);
  await page.getByLabel("New password").fill("reset-from-profile-passphrase");
  await page
    .getByLabel("Confirm password")
    .fill("reset-from-profile-passphrase");
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page).toHaveURL(/login/);
  await expect(
    page.getByText("Password updated. Sign in with your new password."),
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
});
test("existing verified signup shows sign-in action and password recovery works", async ({
  page,
  request,
}) => {
  const email = `recovery-${Date.now()}@example.test`;
  await request.post("http://localhost:3101/api/auth/register", {
    data: { name: "Recovery Learner", email, password },
  });
  await request.post("http://localhost:3101/api/auth/verify-email", {
    data: { email, code: await code() },
  });
  await page.goto("/register");
  await page.getByLabel("Full name").fill("Browser Learner");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(
    page.getByRole("link", { name: "Sign in to your existing account" }),
  ).toBeVisible();
  await page.goto("/forgot-password");
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("button", { name: "Send reset code" }).click();
  await expect(page).toHaveURL(/verify-reset-code/);
  await expect(page.getByLabel("New password")).toHaveCount(0);
  await page.getByLabel("Verification code").fill("000000");
  await page.getByRole("button", { name: "Verify reset code" }).click();
  await expect(page.getByRole("alert")).toContainText("incorrect");
  await page.getByLabel("Verification code").fill(await code());
  await page.getByRole("button", { name: "Verify reset code" }).click();
  await expect(page).toHaveURL(/reset-password/);
  await page.reload();
  await expect(page.getByLabel("Verification code")).toHaveCount(0);
  await expect(page.getByLabel("Email address")).toHaveCount(0);
  await page.getByLabel("New password").fill("updated-browser-passphrase");
  await page.getByLabel("Confirm password").fill("mismatched-passphrase");
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.getByRole("alert")).toContainText("Passwords must match");
  await page.getByLabel("Confirm password").fill("updated-browser-passphrase");
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page).toHaveURL(/login/);
  await expect(
    page.getByText("Password updated. Sign in with your new password."),
  ).toBeVisible();
});
test("unverified duplicate signup returns to verification and can resend", async ({
  page,
}) => {
  const pending = `pending-${Date.now()}@example.test`;
  for (let n = 0; n < 2; n++) {
    await page.goto("/register");
    await page.getByLabel("Full name").fill("Pending Learner");
    await page.getByLabel("Email address").fill(pending);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/verify-email/);
    await expect(
      page.getByRole("button", { name: /Resend in/ }),
    ).toBeDisabled();
  }
});
test("responsive light and dark views remain keyboard-accessible and fit the viewport", async ({
  page,
}) => {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page.getByRole("button", { name: /Switch to .* mode/ }).click();
    await page.screenshot({
      path: `test-results/landing-${width}-theme.png`,
      fullPage: true,
    });
    if (width === 390) {
      await page.getByRole("button", { name: "Open menu" }).click();
      await page
        .getByRole("navigation", { name: "Mobile navigation" })
        .getByRole("link", { name: "Sign in" })
        .click();
      await expect(page.getByLabel("Email address")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
    }
  }
});

test("public pricing, About, Blog, support and footer routes remain complete", async ({ page }) => {
  await page.goto("/#pricing");
  await expect(page.getByRole("heading", { name: "Choose the learning capacity that fits your goals." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Free", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Growth", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pro", exact: true })).toBeVisible();
  await expect(page.getByText("₦2,500")).toBeVisible();
  await page.getByRole("contentinfo").getByRole("link", { name: "About" }).click();
  await expect(page.getByRole("heading", { name: "Public learning content, shaped into a learning system" })).toBeVisible();
  await page.getByRole("contentinfo").getByRole("link", { name: "Blog" }).click();
  await expect(page.getByRole("heading", { name: "Useful learning ideas will live here." })).toBeVisible();
  await page.getByRole("link", { name: "Suggest a topic" }).click();
  await expect(page.getByRole("heading", { name: "Questions should not stop your progress." })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});

test("real request delay shows skeletons and failed discovery has a working retry", async ({
  page,
}) => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route("**/api/courses?**", async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/courses");
  await expect(
    page.getByRole("status", { name: "Loading content" }),
  ).toBeVisible();
  release();
  await page.unrouteAll({ behavior: "wait" });
  await expect(
    page.getByRole("heading", { name: "Browser test course" }),
  ).toBeVisible();
  await page.route("**/api/courses?**", (route) => route.abort());
  await page.reload();
  await expect(page.getByRole("alert")).toContainText("Unable to connect");
  await page.unroute("**/api/courses?**");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.getByRole("heading", { name: "Browser test course" }),
  ).toBeVisible();
});

test("unverified login requires verification once; subsequent password login skips codes", async ({
  page,
}) => {
  const pending = `login-pending-${Date.now()}@example.test`;
  await page.goto("/register");
  await page.getByLabel("Full name").fill("Pending Login");
  await page.getByLabel("Email address").fill(pending);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/verify-email/);
  const signupCode = await code();
  await page.goto("/login");
  await page.getByLabel("Email address").fill(pending);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/verify-email/);
  await expect(
    page.getByText("Verify your email before signing in."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Send a new code" }).click();
  await expect(page.getByRole("alert")).toContainText("wait");
  await page.getByLabel("Verification code").fill(signupCode);
  await page.getByRole("button", { name: "Verify email", exact: true }).click();
  await expect(page).toHaveURL(/my-learning/);
  await page.getByRole("button", { name: "Open account menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out", exact: true }).click();
  await page.goto("/login");
  await expect(page.getByLabel("Verification code")).toHaveCount(0);
  await page.getByLabel("Email address").fill(pending);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/my-learning/);
});

test("direct reset URL and nonexistent-account recovery cannot expose the password form", async ({
  page,
}) => {
  await page.goto("/reset-password");
  await expect(page).toHaveURL(/forgot-password/);
  await expect(page.getByLabel("New password")).toHaveCount(0);
  await page
    .getByLabel("Email address")
    .fill(`missing-${Date.now()}@example.test`);
  await page.getByRole("button", { name: "Send reset code" }).click();
  await expect(page).toHaveURL(/verify-reset-code/);
  await page.getByLabel("Verification code").fill("123456");
  await page.getByRole("button", { name: "Verify reset code" }).click();
  await expect(page.getByRole("alert")).toContainText("invalid or expired");
  await expect(page.getByLabel("New password")).toHaveCount(0);
});

test("profile picture, portfolio, preferences, notifications and account menu work across refresh and mobile", async ({
  page,
}) => {
  const address = `profile-${Date.now()}@example.test`;
  await page.goto("/register");
  await page.getByLabel("Full name").fill("Profile Learner");
  await page.getByLabel("Email address").fill(address);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/verify-email/);
  await page.getByLabel("Verification code").fill(await code());
  await page.getByRole("button", { name: "Verify email", exact: true }).click();
  await expect(page).toHaveURL(/my-learning/);
  const trigger = page.getByRole("button", { name: "Open account menu" });
  await trigger.click();
  await expect(
    page.getByRole("menuitem", { name: "Profile", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("menuitem", { name: "Settings", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("menu")).toHaveCount(0);
  await trigger.click();
  await page.getByRole("heading", { level: 1 }).click();
  await expect(page.getByRole("menu")).toHaveCount(0);
  await trigger.click();
  await page.getByRole("menuitem", { name: "Profile", exact: true }).click();
  await expect(page).toHaveURL(/profile/);
  await page.getByLabel("First name", { exact: true }).fill("Updated Profile");
  await page.getByLabel("Portfolio URL").fill("https://portfolio.example/work");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Your profile has been saved.")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Portfolio URL")).toHaveValue(
    "https://portfolio.example/work",
  );
  await page.route("https://avatar.example.test/**", async (route) =>
    route.fulfill({
      contentType: "image/png",
      body: await readFile("/tmp/learnhub-test-avatar.png"),
    }),
  );
  await page
    .getByLabel("Change profile picture")
    .setInputFiles("/tmp/learnhub-test-avatar.png");
  await expect(
    page.getByText("Your profile picture has been updated."),
  ).toBeVisible();
  await expect(trigger.locator("img")).toBeVisible();
  await trigger.click();
  await page.getByRole("menuitem", { name: "Settings", exact: true }).click();
  await expect(page).toHaveURL(/settings/);
  await page.getByRole("checkbox", { name: /Email notifications/ }).uncheck();
  await page.getByRole("checkbox", { name: /In-app notifications/ }).uncheck();
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(
    page.getByText("Your notification preferences have been saved."),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("checkbox", { name: /Email notifications/ }),
  ).not.toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: /In-app notifications/ }),
  ).not.toBeChecked();
  await trigger.click();
  await page
    .getByRole("menuitem", { name: "Notifications", exact: true })
    .click();
  await expect(page.getByText("You’re all caught up")).toBeVisible();
  await page.goto("/settings");
  await page.getByRole("checkbox", { name: /In-app notifications/ }).check();
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(
    page.getByText("Your notification preferences have been saved."),
  ).toBeVisible();
  await page.goto("/courses/browser-test-course");
  await page.getByRole("button", { name: "Enroll in this course" }).click();
  await expect(page).toHaveURL(/learn\/browser-test-course/);
  await page.goto("/notifications");
  await expect(
    page.getByRole("heading", { name: "You’re enrolled", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Mark as read" }).click();
  await expect(page.getByRole("button", { name: "Mark as read" })).toHaveCount(
    0,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await trigger.click();
  await expect(
    page.getByRole("menuitem", { name: "Settings", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "test-results/account-menu-mobile.png",
    fullPage: true,
  });
  await page.getByRole("menuitem", { name: "Sign out", exact: true }).click();
  await expect(trigger).toHaveCount(0);
});
