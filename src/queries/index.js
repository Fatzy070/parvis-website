import {
  QueryClient,
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { api, search } from "../api/client";
export const keys = {
  session: ["session"],
  preferences: ["notification-preferences"],
  notifications: ["notifications"],
  courses: (filters = {}) => ["courses", filters],
  course: (id) => ["course", id],
  learning: ["learning"],
  enrollment: (id) => ["enrollment", id],
  comments: (id, lessonId) => ["comments", id, lessonId || "course"],
  quiz: (id, lessonId) => ["quiz", id, lessonId || "course"],
};
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      retry: (count, error) =>
        count < 1 && (error.status === 0 || error.status >= 500),
      refetchOnWindowFocus: true,
    },
    mutations: { retry: false },
  },
});
export const useSession = () =>
  useQuery({
    queryKey: keys.session,
    queryFn: async ({ signal }) => {
      try {
        return (await api("/auth/me", { signal })).user;
      } catch (error) {
        if (error.status === 401) return null;
        throw error;
      }
    },
    retry: false,
    staleTime: 60000,
  });
export const useCourses = (filters = {}) =>
  useQuery({
    queryKey: keys.courses(filters),
    queryFn: ({ signal }) => api(`/courses${search(filters)}`, { signal }),
    staleTime: 5 * 60000,
  });
export const useCourse = (id) =>
  useQuery({
    queryKey: keys.course(id),
    queryFn: ({ signal }) =>
      api(`/courses/${encodeURIComponent(id)}`, { signal }),
    staleTime: 5 * 60000,
    enabled: Boolean(id),
  });
export const useLearning = () =>
  useInfiniteQuery({
    queryKey: keys.learning,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      api(`/my-learning?page=${pageParam}`, { signal }),
    getNextPageParam: (page) => (page.hasMore ? page.page + 1 : undefined),
  });
export const useEnrollment = (id, enabled = true) =>
  useQuery({
    queryKey: keys.enrollment(id),
    queryFn: ({ signal }) => api(`/courses/${id}/enrollment`, { signal }),
    enabled,
    staleTime: 30000,
  });
export function useEnroll(id) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => api(`/courses/${id}/enrollment`, { method: "POST" }),
    onSuccess: (data) => {
      client.setQueryData(keys.enrollment(id), data);
      client.invalidateQueries({ queryKey: keys.notifications });
      return client.invalidateQueries({ queryKey: keys.learning });
    },
  });
}
export function useUnenroll(id) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => api(`/courses/${id}/enrollment`, { method: "DELETE" }),
    onSuccess: () => {
      client.setQueryData(keys.enrollment(id), { enrollment: null });
      return client.invalidateQueries({ queryKey: keys.learning });
    },
  });
}
export function useProgress(id) {
  const client = useQueryClient();
  return useMutation({
    scope: { id: `progress-${id}` },
    mutationFn: ({ lessonId, ...body }) =>
      api(`/courses/${id}/progress/${lessonId}`, { method: "PUT", body }),
    onSuccess: (data) => {
      client.setQueryData(keys.enrollment(id), data);
      client.invalidateQueries({ queryKey: keys.learning });
    },
  });
}
export const useComments = (id, lessonId) =>
  useInfiniteQuery({
    queryKey: keys.comments(id, lessonId),
    initialPageParam: null,
    queryFn: ({ pageParam, signal }) =>
      api(`/courses/${id}/comments${search({ lessonId, cursor: pageParam })}`, {
        signal,
      }),
    getNextPageParam: (page) => page.nextCursor || undefined,
    staleTime: 30000,
  });
export function useCommentMutation(id, lessonId, remove = false) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (value) =>
      api(`/courses/${id}/comments${remove ? `/${value}` : ""}`, {
        method: remove ? "DELETE" : "POST",
        ...(remove ? {} : { body: { body: value, lessonId } }),
      }),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: keys.comments(id, lessonId) }),
  });
}
export const useQuiz = (id, lessonId) =>
  useQuery({
    queryKey: keys.quiz(id, lessonId),
    queryFn: ({ signal }) =>
      api(`/courses/${id}/quiz${search({ lessonId })}`, { signal }),
  });
export function useQuizAttempt(id, lessonId) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body) =>
      api(`/courses/${id}/quiz/attempts`, { method: "POST", body }),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: keys.quiz(id, lessonId) }),
  });
}

export function updateUserCache(client, user) {
  client.setQueryData(keys.session, user);
  client.setQueriesData({ queryKey: ["comments"] }, (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map((comment) =>
              comment.author?.id === user.id
                ? {
                    ...comment,
                    author: {
                      ...comment.author,
                      name: `${user.firstName} ${user.lastName}`.trim(),
                      image: user.avatarUrl || user.image,
                    },
                  }
                : comment,
            ),
          })),
        }
      : data,
  );
  return client.invalidateQueries({ queryKey: ["comments"] });
}
export const usePreferences = () =>
  useQuery({
    queryKey: keys.preferences,
    queryFn: ({ signal }) =>
      api("/auth/me/notification-preferences", { signal }),
  });
export const useNotifications = () =>
  useInfiniteQuery({
    queryKey: keys.notifications,
    initialPageParam: null,
    queryFn: ({ pageParam, signal }) =>
      api(`/notifications${search({ cursor: pageParam })}`, { signal }),
    getNextPageParam: (page) => page.nextCursor || undefined,
  });
