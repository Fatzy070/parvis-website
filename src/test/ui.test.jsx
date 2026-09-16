import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { EmptyState, ErrorState, CourseCard, Button } from "../components/UI";
import Protected from "../components/Protected";
import Quiz from "../components/Quiz";
import { keys } from "../queries";
const client = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
afterEach(() => vi.unstubAllGlobals());
describe("honest content states", () => {
  it("provides an actionable empty state without invented data", () => {
    render(
      <MemoryRouter>
        <EmptyState title="No courses yet" to="/courses">
          Find a real course to begin.
        </EmptyState>
      </MemoryRouter>,
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", "/courses");
  });
  it("provides a working retry action", () => {
    const retry = vi.fn();
    render(
      <ErrorState error={new Error("Network unavailable")} retry={retry} />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(retry).toHaveBeenCalledOnce();
    expect(screen.getByRole("alert")).toHaveTextContent("Network unavailable");
  });
  it("uses thumbnails rather than embedded video players for discovery", () => {
    const { container } = render(
      <MemoryRouter>
        <CourseCard
          course={{
            id: "test",
            title: "Test only",
            author: "Test creator",
            category: "Test",
            videoCount: 2,
            thumbnail: "https://example.test/img.png",
          }}
        />
      </MemoryRouter>,
    );
    expect(container.querySelector("iframe")).toBeNull();
    expect(container.querySelector("img")).toHaveAttribute("loading", "lazy");
  });
  it("disables duplicate mutation submissions", () => {
    render(<Button pending>Submit</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
  it("does not mistake session network failure for signed-out state", async () => {
    const c = client();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Network unavailable")),
    );
    render(
      <QueryClientProvider client={c}>
        <MemoryRouter>
          <Protected />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to connect",
    );
    expect(screen.getByRole("button", { name: "Try again" })).toBeVisible();
  });
  it("renders a genuine missing-quiz state", () => {
    const c = client();
    c.setQueryData(keys.quiz("test"), { quiz: null, attempts: [] });
    render(
      <QueryClientProvider client={c}>
        <Quiz courseId="test" />
      </QueryClientProvider>,
    );
    expect(screen.getByText("No quiz here yet")).toBeInTheDocument();
    expect(screen.queryByRole("radio")).toBeNull();
  });
});
