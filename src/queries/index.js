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
  sessions: ["account-sessions"],
  courses: (filters = {}) => ["courses", filters],
  course: (id) => ["course", id],
  learning: ["learning"],
  enrollment: (id) => ["enrollment", id],
  comments: (id, lessonId) => ["comments", id, lessonId || "course"],
  quiz: (id, lessonId) => ["quiz", id, lessonId || "course"],
  aiSummary: (id, lessonId, mode) => ["ai-summary", id, lessonId, mode],
  studyNotes: ["study-notes"],
  practiceQuizzes: ["practice-quizzes"],
  practicals: ["practicals"],
  billing: ["billing"],
  plans: ["billing-plans"],
  blog: (slug = "list") => ["blog", slug],
  achievements: ["achievements"],
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

export function useAiSummary(id, lessonId) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (mode) => {
      const key = keys.aiSummary(id, lessonId, mode);
      const existing = client.getQueryData(key);
      if (existing) return existing;
      const data = await api(`/ai/courses/${id}/lessons/${lessonId}/summary`, {
        method: "POST",
        body: { mode },
      });
      client.setQueryData(key, data);
      return data;
    },
  });
}

export const useAiExplain = (id, lessonId) =>
  useMutation({
    mutationFn: (question) =>
      api(`/ai/courses/${id}/lessons/${lessonId}/explain`, {
        method: "POST",
        body: { question },
      }),
  });

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

export const useSessions = () =>
  useQuery({
    queryKey: keys.sessions,
    queryFn: ({ signal }) => api("/auth/me/sessions", { signal }),
  });

export function useChangePassword() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body) => api("/auth/me/password", { method: "POST", body }),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.sessions }),
  });
}

export function useRevokeSessions() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (sessionId) =>
      api(`/auth/me/sessions${sessionId ? `/${sessionId}` : ""}`, {
        method: "DELETE",
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.sessions }),
  });
}

export const useSupportRequest = () =>
  useMutation({
    mutationFn: (body) => api("/support", { method: "POST", body }),
  });

export function useGenerateStudyNotes(courseId, lessonId) {
  return useMutation({ mutationFn: () => api(`/ai/courses/${courseId}/lessons/${lessonId}/study-notes/generate`, { method: "POST", body: {} }) });
}
export function useSaveStudyNote() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (body) => api("/ai/notes", { method: "POST", body }), onSuccess: () => client.invalidateQueries({ queryKey: keys.studyNotes }) });
}
export const useStudyNotes = () => useQuery({ queryKey: keys.studyNotes, queryFn: ({ signal }) => api("/ai/notes", { signal }) });
export function useNoteMutation(remove = false) {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, ...body }) => api(`/ai/notes/${id}`, { method: remove ? "DELETE" : "PATCH", ...(remove ? {} : { body }) }), onSuccess: () => client.invalidateQueries({ queryKey: keys.studyNotes }) });
}
export function useGeneratePracticeQuiz(courseId, lessonId) {
  const client = useQueryClient();
  return useMutation({ mutationFn: (body) => api(`/ai/courses/${courseId}/lessons/${lessonId}/practice-quizzes`, { method: "POST", body }), onSuccess: () => client.invalidateQueries({ queryKey: keys.practiceQuizzes }) });
}
export function usePracticeAttempt() { return useMutation({ mutationFn: ({ id, answers }) => api(`/ai/practice-quizzes/${id}/attempts`, { method: "POST", body: { answers } }) }); }
export const usePracticeQuizzes = () => useQuery({ queryKey: keys.practiceQuizzes, queryFn: ({ signal }) => api("/ai/practice-quizzes", { signal }) });
export function useGeneratePractical(courseId, lessonId) { const client = useQueryClient(); return useMutation({ mutationFn: (body) => api(`/ai/courses/${courseId}/lessons/${lessonId}/practicals`, { method: "POST", body }), onSuccess: () => client.invalidateQueries({ queryKey: keys.practicals }) }); }
export function usePracticalAttempt() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, ...body }) => api(`/ai/practicals/${id}/attempts`, { method: "POST", body }), onSuccess: () => client.invalidateQueries({ queryKey: keys.practicals }) }); }
export const usePracticals = () => useQuery({ queryKey: keys.practicals, queryFn: ({ signal }) => api("/ai/practicals", { signal }) });

export const usePlans = () => useQuery({ queryKey: keys.plans, queryFn: ({ signal }) => api("/billing/plans", { signal }), staleTime: 60 * 60000 });
export const useBlogPosts = () => useQuery({ queryKey: keys.blog(), queryFn: ({ signal }) => api("/blog/posts", { signal }), staleTime: 5 * 60000 });
export const useBlogPost = (slug) => useQuery({ queryKey: keys.blog(slug), queryFn: ({ signal }) => api(`/blog/posts/${encodeURIComponent(slug)}`, { signal }), enabled: Boolean(slug), staleTime: 5 * 60000 });
export const useBilling = (enabled = true) => useQuery({ queryKey: keys.billing, queryFn: ({ signal }) => api("/billing", { signal }), staleTime: 30000, enabled });
export function useCheckout() {
  return useMutation({ mutationFn: (payload) => api("/billing/checkout", { method: "POST", body: typeof payload === "string" ? { plan: payload } : payload }), onSuccess: ({ authorizationUrl }) => window.location.assign(authorizationUrl) });
}
export function useConfirmCheckout(reference) {
  const client = useQueryClient();
  return useQuery({ queryKey: ["billing-confirm", reference], queryFn: ({ signal }) => api(`/billing/confirm?reference=${encodeURIComponent(reference)}`, { signal }), enabled: Boolean(reference), retry: (count, error) => count < 4 && [409, 502, 503].includes(error.status), retryDelay: 1500, refetchInterval: (query) => query.state.status === "success" ? false : 2000, onSuccess: () => client.invalidateQueries({ queryKey: keys.billing }) });
}
export function useCancelSubscription() {
  const client = useQueryClient();
  return useMutation({ mutationFn: () => api("/billing/cancel", { method: "POST" }), onSuccess: (data) => client.setQueryData(keys.billing, data) });
}
export const useBillingManagement = () => useMutation({ mutationFn: () => api("/billing/management", { method: "POST" }), onSuccess: ({ url }) => window.location.assign(url) });
export const useAchievements = () => useQuery({ queryKey: keys.achievements, queryFn: ({ signal }) => api("/auth/me/achievements", { signal }), staleTime: 60 * 1000 });

