import { useState } from "react";
import { Trash2, Send } from "lucide-react";
import { useComments, useCommentMutation } from "../queries";
import { Button, EmptyState, ErrorState, FormError, Skeleton } from "./UI";
import Avatar from "./Avatar";
export default function Discussion({ courseId, lessonId }) {
  const query = useComments(courseId, lessonId);
  const add = useCommentMutation(courseId, lessonId);
  const remove = useCommentMutation(courseId, lessonId, true);
  const [body, setBody] = useState("");
  const comments = query.data?.pages.flatMap((page) => page.items) || [];
  return (
    <section className="discussion">
      <h2>Learn together.</h2>
      <p className="muted">
        Ask a question, share an insight, or help someone connect the dots.
      </p>
      <form
        className="comment-form"
        onSubmit={(event) => {
          event.preventDefault();
          add.mutate(body, { onSuccess: () => setBody("") });
        }}
      >
        <label htmlFor="comment">Add to the discussion</label>
        <textarea
          id="comment"
          rows={3}
          maxLength={2000}
          minLength={1}
          required
          placeholder="What’s on your mind?"
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        <div className="row-between">
          <span className="muted">
            {body.length}/2000 · Be thoughtful. Be kind.
          </span>
          <Button type="submit" pending={add.isPending} disabled={!body.trim()}>
            <Send size={16} />
            Post comment
          </Button>
        </div>
        <FormError error={add.error} />
      </form>
      <FormError error={remove.error} />
      {query.isPending ? (
        <Skeleton cards={1} />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={query.refetch} />
      ) : !comments.length ? (
        <EmptyState title="Be the first to start a conversation">
          A good question can be the beginning of a great discussion.
        </EmptyState>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <article className="comment" key={comment.id}>
              <Avatar user={comment.author} />
              <div className="comment-content">
                <div className="row-between">
                  <div>
                    <strong>{comment.author?.name || "Former learner"}</strong>
                    <time dateTime={comment.createdAt}>
                      {new Date(comment.createdAt).toLocaleString()}
                    </time>
                  </div>
                  {comment.canDelete && (
                    <button
                      className="icon-button"
                      aria-label="Delete your comment"
                      disabled={remove.isPending}
                      onClick={() => remove.mutate(comment.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <p>{comment.body}</p>
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
          Earlier comments
        </Button>
      )}
    </section>
  );
}
