import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CheckCircle2, Save } from "lucide-react";
import { useSession, updateUserCache, useAchievements } from "../queries";

import { api } from "../api/client";
import Avatar from "../components/Avatar";
import { Button, FormError, PageHeading } from "../components/UI";
export default function Profile() {
  const { data: user } = useSession();
  const client = useQueryClient();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName || "");
  const [portfolioUrl, setPortfolioUrl] = useState(user.portfolioUrl || "");
  const save = useMutation({
    mutationFn: () =>
      api("/auth/me", {
        method: "PATCH",
        body: { firstName, lastName, portfolioUrl },
      }),
    onSuccess: (data) => updateUserCache(client, data.user),
  });
  const upload = useMutation({
    mutationFn: async (file) => {
      if (
        !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
        file.size > 5 * 1024 * 1024
      )
        throw new Error(
          "Choose a PNG, JPEG, or WebP image no larger than 5 MB.",
        );
      const form = new FormData();
      form.append("avatar", file);
      return api("/auth/me/avatar", { method: "POST", body: form });
    },
    onSuccess: (data) => updateUserCache(client, data.user),
  });
  return (
    <div className="container section profile-page">
      <PageHeading eyebrow="YOUR ACCOUNT" title="Make yourself at home.">
        A few details that make LearnHub yours.
      </PageHeading>
      <div className="profile-card">
        <div className="profile-summary">
          <Avatar user={user} className="profile-initials" />
          <div>
            <h2>
              {user.firstName} {user.lastName}
            </h2>
            <p className="muted">{user.email}</p>
            <span className="verified">
              <CheckCircle2 size={15} />
              Verified email
            </span>
          </div>
        </div>
        <div className="avatar-upload">
          <label>
            Change profile picture
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={upload.isPending || save.isPending}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) upload.mutate(file);
                event.target.value = "";
              }}
            />
          </label>
          <p className="field-hint">
            PNG, JPEG, or WebP, up to 5 MB. Your photo saves when the upload
            completes.
          </p>
          {upload.isPending && <p role="status">Uploading your photo…</p>}
          {upload.isSuccess && (
            <p className="notice" role="status">
              Your profile picture has been updated.
            </p>
          )}
          <FormError error={upload.error} />
        </div>
        <form
          className="form-stack"
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate();
          }}
        >
          <div className="form-columns">
            <label>
              First name
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                autoComplete="given-name"
                required
                maxLength={80}
              />
            </label>
            <label>
              Last name
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                autoComplete="family-name"
                maxLength={80}
              />
            </label>
          </div>
          <label>
            Portfolio URL
            <input
              type="url"
              value={portfolioUrl}
              onChange={(event) => setPortfolioUrl(event.target.value)}
              autoComplete="url"
              placeholder="https://your-website.com"
              maxLength={2048}
            />
            <span className="field-hint">
              Your personal website or portfolio. Optional.
            </span>
          </label>
          <FormError error={save.error} />
          {save.isSuccess && (
            <p className="notice" role="status">
              Your profile has been saved.
            </p>
          )}
          <Button
            pending={save.isPending}
            disabled={upload.isPending}
            type="submit"
          >
            <Save size={17} />
            Save changes
          </Button>
        </form>
      </div>
      <div className="account-note">
        <h2>Account security</h2>
        <p className="muted">
          Need a new password? We’ll send a reset code to your email.
        </p>
        <Link
          className="text-link"
          to="/forgot-password"
          state={{ email: user.email }}
        >
          Reset your password
        </Link>
      </div>

      <AchievementsSection />
    </div>
  );
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function AchievementsSection() {
  const { data, isPending } = useAchievements();
  const achievements = data?.data?.achievements || [];

  return (
    <div className="account-note" style={{ marginTop: "24px" }}>
      <h2>Achievements</h2>
      <p className="muted">
        Monthly recognition awarded by LearnHub for your learning activity, consistency, and performance.
      </p>

      {isPending ? (
        <p className="muted">Loading achievements…</p>
      ) : achievements.length === 0 ? (
        <p className="muted" style={{ fontStyle: "italic" }}>
          No approved achievements yet. Keep learning consistently!
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginTop: "16px" }}>
          {achievements.map((item) => {
            const monthName = MONTH_NAMES[item.month - 1] || "";
            const snap = item.metricsSnapshot || {};

            return (
              <div
                key={item._id}
                style={{
                  padding: "16px",
                  borderRadius: "10px",
                  backgroundColor: "var(--bg-subtle, #fafaf6)",
                  border: "1px solid var(--border-color, #dce2d9)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "24px" }}>🏆</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px", color: "var(--brand-primary, #176354)" }}>
                      {item.title}
                    </h3>
                    <small className="muted">
                      {monthName} {item.year}
                    </small>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text-secondary, #667069)" }}>
                  Recognized for outstanding learning activity, consistency, and performance during {monthName} {item.year}.
                </p>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "8px",
                    fontSize: "12px",
                    color: "var(--color-text-primary, #22382f)",
                  }}
                >
                  {snap.activeDays > 0 && <span>🔥 {snap.activeDays} active days</span>}
                  {snap.uniqueQuizzes > 0 && <span>📝 {snap.uniqueQuizzes} unique quizzes</span>}
                  {snap.qualifyingQuizAverage > 0 && <span>🎯 {snap.qualifyingQuizAverage}% avg</span>}
                  {snap.uniquePracticals > 0 && <span>💻 {snap.uniquePracticals} practicals</span>}
                  {snap.coursesCompleted > 0 && <span>🎓 {snap.coursesCompleted} courses</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

