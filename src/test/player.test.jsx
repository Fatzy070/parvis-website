import { it, expect, vi, afterEach } from "vitest";
import { render, act, fireEvent, screen } from "@testing-library/react";
import LessonPlayer from "../components/LessonPlayer";
const fixture = vi.hoisted(() => ({ props: null }));
vi.mock("react-youtube", () => ({
  default: (props) => {
    fixture.props = props;
    return <div data-testid="test-player" />;
  },
}));
afterEach(() => vi.useRealTimers());
it("resumes at persisted seconds, throttles playback writes, and saves on pause and end", () => {
  vi.useFakeTimers();
  const save = vi.fn();
  const complete = vi.fn();
  let seconds = 42;
  const player = { getCurrentTime: () => seconds, getPlayerState: () => 1 };
  const view = render(
    <LessonPlayer
      lesson={{ videoId: "abcdefghijk", title: "Test lesson" }}
      position={42}
      save={save}
      complete={complete}
    />,
  );
  expect(fixture.props.opts.playerVars.start).toBe(42);
  act(() => fixture.props.onReady({ target: player }));
  seconds = 50;
  act(() => vi.advanceTimersByTime(14000));
  expect(save).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(1000));
  expect(save).toHaveBeenLastCalledWith(50);
  seconds = 55;
  act(() => fixture.props.onPause({ target: player }));
  expect(save).toHaveBeenLastCalledWith(55);
  act(() => fixture.props.onEnd({ target: player }));
  expect(complete).toHaveBeenCalledOnce();
  view.unmount();
  const count = save.mock.calls.length;
  act(() => vi.advanceTimersByTime(30000));
  expect(save).toHaveBeenCalledTimes(count);
});
it("shows actionable player failure and retries", () => {
  render(
    <LessonPlayer
      lesson={{ videoId: "abcdefghijk", title: "Test lesson" }}
      save={vi.fn()}
      complete={vi.fn()}
    />,
  );
  act(() => fixture.props.onError());
  expect(screen.getByRole("alert")).toHaveTextContent("couldn’t be played");
  fireEvent.click(screen.getByRole("button", { name: "Retry player" }));
  expect(screen.getByTestId("test-player")).toBeVisible();
});

it("times out an unavailable player API instead of leaving a permanent skeleton", () => {
  vi.useFakeTimers();
  render(
    <LessonPlayer
      lesson={{ videoId: "abcdefghijk", title: "Test lesson" }}
      save={vi.fn()}
      complete={vi.fn()}
    />,
  );
  expect(screen.getByRole("status")).toHaveAccessibleName(
    "Preparing video player",
  );
  act(() => vi.advanceTimersByTime(20000));
  expect(screen.getByRole("alert")).toHaveTextContent("couldn’t be played");
  expect(screen.getByRole("button", { name: "Retry player" })).toBeVisible();
});
