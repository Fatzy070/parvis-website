import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { keys, useNotifications } from "../queries";
import { api } from "../api/client";
import {
  Button,
  EmptyState,
  ErrorState,
  FormError,
  PageHeading,
  PageSkeleton,
} from "../components/UI";
import { SEO } from "../components/SEO";

export default function Notifications() {
  const query = useNotifications();
  const client = useQueryClient();
  const read = useMutation({
    mutationFn: (id) => api(`/notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.notifications }),
  });
  const items = query.data?.pages.flatMap((page) => page.items) || [];
  return (
    <div className="container section profile-page">
      <SEO title="Notifications | Parvis" noindex />
      <PageHeading eyebrow="YOUR UPDATES" title="Notifications">
        The latest from your learning journey.
      </PageHeading>
      <FormError error={read.error} />
      {query.isPending ? (
        <PageSkeleton />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={query.refetch} />
      ) : !items.length ? (
        <EmptyState title="You’re all caught up">
          Your learning updates will appear here.{" "}
          <Link className="text-link" to="/settings">
            Manage notification preferences
          </Link>
        </EmptyState>
      ) : (
        <div className="notifications-list">
          {items.map((item) => (
            <article
              className={`profile-card notification-card ${item.readAt ? "" : "unread"}`}
              key={item.id}
            >
              <h2>{item.title}</h2>
              <time className="muted" dateTime={item.createdAt}>
                {new Date(item.createdAt).toLocaleString()}
              </time>
              <p>{item.body}</p>
              <div className="row-between">
                <Link className="text-link" to={item.href}>
                  View details
                </Link>
                {!item.readAt && (
                  <Button
                    className="secondary small"
                    pending={read.isPending && read.variables === item.id}
                    onClick={() => read.mutate(item.id)}
                  >
                    Mark as read
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {query.hasNextPage && (
        <Button
          className="secondary"
          pending={query.isFetchingNextPage}
          onClick={() => query.fetchNextPage()}
        >
          Earlier notifications
        </Button>
      )}
    </div>
  );
}
