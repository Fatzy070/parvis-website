import { afterEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AiStudyAssistant from "../components/AiStudyAssistant";

afterEach(() => vi.unstubAllGlobals());

const renderAssistant = () => {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <AiStudyAssistant courseId="test-course" lessonId="abcdefghijk" />
    </QueryClientProvider>,
  );
};

it("requests AI only after learner action and renders honest generated content", async () => {
  const fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      data: {
        mode: "short",
        content: "A real provider response.",
        cached: false,
      },
    }),
  });
  vi.stubGlobal("fetch", fetch);
  renderAssistant();
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Short summary" }));
  expect(await screen.findByText("A real provider response.")).toBeVisible();
  expect(fetch).toHaveBeenCalledOnce();
  const [, request] = fetch.mock.calls[0];
  expect(JSON.parse(request.body)).toEqual({ mode: "short" });
  expect(request.body).not.toContain("youtube");
  expect(screen.getByText(/may occasionally contain mistakes/i)).toBeVisible();
});

it("validates lesson questions and shows API failures without fallback content", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({
        error: {
          code: "AI_UNAVAILABLE",
          message: "Study assistant unavailable.",
        },
      }),
    }),
  );
  renderAssistant();
  const button = screen.getByRole("button", { name: "Ask AI" });
  expect(button).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Ask about this lesson"), {
    target: { value: "Explain this concept" },
  });
  fireEvent.click(button);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Study assistant unavailable.",
  );
  expect(screen.queryByText("A real provider response.")).toBeNull();
});

it("generates editable study notes and saves them through Parvis", async () => {
  const fetch = vi.fn().mockImplementation(async (path) => ({
    ok: true,
    status: path.endsWith("/ai/notes") ? 201 : 200,
    json: async () => ({ data: path.endsWith("/ai/notes") ? { note: { id: "note-1" } } : { title: "Trusted lesson — Study Notes", content: "# Overview\nOriginal notes", cached: false, aiModel: "test-model", promptVersion: "lesson-v1" } }),
  }));
  vi.stubGlobal("fetch", fetch);
  renderAssistant();
  fireEvent.click(screen.getByRole("button", { name: "Generate Study Notes" }));
  const editor = await screen.findByLabelText("Study notes");
  fireEvent.change(editor, { target: { value: "# Overview\nMy edited notes" } });
  fireEvent.click(screen.getByRole("button", { name: "Save to My Learning" }));
  expect(await screen.findByText("Study note saved.")).toBeVisible();
  const save = fetch.mock.calls.find(([path]) => path.endsWith("/api/ai/notes"));
  expect(JSON.parse(save[1].body).content).toContain("My edited notes");
  expect(JSON.stringify(fetch.mock.calls)).not.toContain("youtube.com");
});
