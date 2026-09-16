import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { keys, usePreferences } from "../queries";
import { api } from "../api/client";
import {
  Button,
  FormError,
  PageHeading,
  ErrorState,
  PageSkeleton,
} from "../components/UI";
function PreferencesForm({ preferences }) {
  const client = useQueryClient();
  const [draft, setDraft] = useState(preferences);
  const save = useMutation({
    mutationFn: () =>
      api("/auth/me/notification-preferences", {
        method: "PATCH",
        body: draft,
      }),
    onSuccess: (data) => {
      client.setQueryData(keys.preferences, data);
      client.invalidateQueries({ queryKey: keys.session });
    },
  });
  return (
    <form
      className="profile-card form-stack"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate();
      }}
    >
      {[
        [
          "email",
          "Email notifications",
          "Course updates and enrollment emails.",
        ],
        [
          "inApp",
          "In-app notifications",
          "Updates in your LearnHub notification inbox.",
        ],
      ].map(([key, label, description]) => (
        <label className="preference-row" key={key}>
          <span>
            <strong>{label}</strong>
            <span className="muted">{description}</span>
          </span>
          <input
            type="checkbox"
            checked={draft[key]}
            onChange={(event) => {
              setDraft({ ...draft, [key]: event.target.checked });
              save.reset();
            }}
          />
        </label>
      ))}
      <p className="field-hint">
        Verification, password reset, welcome and security emails remain
        enabled. Turning off in-app updates stops new optional notifications;
        existing notifications stay in your inbox.
      </p>
      <FormError error={save.error} />
      {save.isSuccess && (
        <p className="notice" role="status">
          Your notification preferences have been saved.
        </p>
      )}
      <Button type="submit" pending={save.isPending}>
        Save preferences
      </Button>
    </form>
  );
}
export default function Settings() {
  const query = usePreferences();
  return (
    <div className="container section profile-page">
      <PageHeading
        eyebrow="YOUR PREFERENCES"
        title="Make space for what matters."
      >
        Choose how LearnHub keeps you updated.
      </PageHeading>
      {query.isPending ? (
        <PageSkeleton />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={query.refetch} />
      ) : (
        <PreferencesForm preferences={query.data.preferences} />
      )}
    </div>
  );
}
