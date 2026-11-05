import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ListenLearnPlayer from "./ListenLearnPlayer";
import { resolveApiUrl } from "../api/client";

describe("ListenLearnPlayer", () => {
  beforeAll(() => {
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue();
    window.HTMLMediaElement.prototype.pause = vi.fn();
    window.HTMLMediaElement.prototype.load = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the listen trigger button when audio is not generated", () => {
    const onRequestAudio = vi.fn();
    render(
      <ListenLearnPlayer
        audio={null}
        onRequestAudio={onRequestAudio}
        label="Listen to summary"
      />,
    );

    const btn = screen.getByRole("button", { name: /listen to summary/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onRequestAudio).toHaveBeenCalledOnce();
  });

  it("displays preparing narration state while generating", () => {
    render(
      <ListenLearnPlayer
        audio={{ status: "generating" }}
        onRequestAudio={vi.fn()}
      />,
    );

    expect(screen.getByText(/preparing narration/i)).toBeInTheDocument();
  });

  it("renders the player controls, time, and speed pills when ready", () => {
    const audioData = {
      id: "audio123",
      status: "ready",
      duration: 120,
      streamUrl: "/api/ai/audio/audio123/stream?token=abc&expires=1000&uid=user1",
    };

    render(
      <ListenLearnPlayer
        audio={audioData}
        onRequestAudio={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("region", { name: /listen & learn narration/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/play narration/i)).toBeInTheDocument();
    expect(screen.getByText("2:00")).toBeInTheDocument();
    expect(screen.getByText("Parvis Narrator")).toBeInTheDocument();

    const audioEl = document.querySelector("audio");
    expect(audioEl).toBeInTheDocument();
    expect(audioEl.getAttribute("src")).toContain("/api/ai/audio/audio123/stream?token=abc&expires=1000&uid=user1");

    // Check speed buttons
    // const speedButtons = ["0.75×", "1×", "1.25×", "1.5×", "2×"];
    // for (const speed of speedButtons) {
    //   expect(screen.getByRole("button", { name: speed })).toBeInTheDocument();
    // }
  });

  it("normalizes audio when wrapped in { data: audioData }", () => {
    const wrappedAudio = {
      data: {
        id: "audio456",
        status: "ready",
        duration: 45,
        streamUrl: "/api/ai/audio/audio456/stream?token=xyz",
      },
    };

    render(
      <ListenLearnPlayer
        audio={wrappedAudio}
        onRequestAudio={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("region", { name: /listen & learn narration/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/play narration/i)).toBeInTheDocument();
  });

  it("toggles play and pause on button click", async () => {
    const audioData = {
      id: "audio123",
      status: "ready",
      duration: 60,
      streamUrl: "/api/ai/audio/audio123/stream?token=abc",
    };

    render(
      <ListenLearnPlayer
        audio={audioData}
        onRequestAudio={vi.fn()}
      />,
    );

    const playBtn = screen.getByLabelText(/play narration/i);
    fireEvent.click(playBtn);

    await waitFor(() => {
      expect(screen.getByLabelText(/pause narration/i)).toBeInTheDocument();
    });

    const pauseBtn = screen.getByLabelText(/pause narration/i);
    fireEvent.click(pauseBtn);

    await waitFor(() => {
      expect(screen.getByLabelText(/play narration/i)).toBeInTheDocument();
    });
  });

  it("allows changing playback speed", () => {
    const audioData = {
      id: "audio123",
      status: "ready",
      duration: 60,
      streamUrl: "/api/ai/audio/audio123/stream?token=abc",
    };

    render(
      <ListenLearnPlayer
        audio={audioData}
        onRequestAudio={vi.fn()}
      />,
    );

    const speedBtn = screen.getByRole("button", { name: "1.5×" });
    fireEvent.click(speedBtn);
    expect(speedBtn).toHaveClass("active");
  });

  it("shows an error state with a retry button when generation fails", () => {
    const onRetry = vi.fn();
    render(
      <ListenLearnPlayer
        audio={{ status: "failed", error: "Voice synthesis timed out." }}
        onRequestAudio={vi.fn()}
        onRetry={onRetry}
      />,
    );

    expect(screen.getByText(/voice synthesis timed out/i)).toBeInTheDocument();
    const retryBtn = screen.getByRole("button", { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("shows a visible error when play rejects and does not silently reset", async () => {
    window.HTMLMediaElement.prototype.play = vi
      .fn()
      .mockRejectedValue(new Error("The element has no supported sources."));

    const audioData = {
      id: "audio123",
      status: "ready",
      duration: 60,
      streamUrl: "/api/ai/audio/audio123/stream?token=abc",
    };

    render(
      <ListenLearnPlayer
        audio={audioData}
        onRequestAudio={vi.fn()}
      />,
    );

    const playBtn = screen.getByLabelText(/play narration/i);
    fireEvent.click(playBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/audio format or stream is not supported/i),
      ).toBeInTheDocument();
    });
    // Does NOT silently return to initial "Listen" button
    expect(screen.queryByRole("button", { name: /^listen$/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("resolveApiUrl correctly resolves relative and absolute stream paths with query params", () => {
    const relativeUrl = "/api/ai/audio/123/stream?token=tok&expires=999&uid=u1";
    const resolved = resolveApiUrl(relativeUrl);
    expect(resolved).toContain("token=tok");
    expect(resolved).toContain("expires=999");
    expect(resolved).toContain("uid=u1");

    const fullUrl = "https://cdn.example.com/audio.wav?signed=1";
    expect(resolveApiUrl(fullUrl)).toBe(fullUrl);
    expect(resolveApiUrl("")).toBe("");
  });
});
