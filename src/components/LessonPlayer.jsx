import { useEffect, useRef, useState } from "react";
import YouTube from "react-youtube";
import { Button, FormError } from "./UI";
export default function LessonPlayer({
  lesson,
  position,
  save,
  complete,
  pending,
  error,
}) {
  const player = useRef(null);
  const initialPosition = useRef(position || 0);
  const saveRef = useRef(save);
  const [playerError, setPlayerError] = useState(false);
  const [ready, setReady] = useState(false);
  const [retry, setRetry] = useState(0);
  const lastPosition = useRef(initialPosition.current);
  useEffect(() => {
    saveRef.current = save;
  }, [save]);
  useEffect(() => {
    if (ready || playerError) return;
    const timeout = setTimeout(() => {
      player.current = null;
      setPlayerError(true);
    }, 20000);
    return () => clearTimeout(timeout);
  }, [ready, playerError, retry]);
  useEffect(() => {
    const flush = () => {
      const p = player.current;
      if (!p) return;
      try {
        const value = p.getCurrentTime();
        if (
          Number.isFinite(value) &&
          Math.abs(value - lastPosition.current) >= 2
        ) {
          lastPosition.current = value;
          saveRef.current(value);
        }
      } catch {
        /* Player may have been destroyed during navigation. */
      }
    };
    const timer = setInterval(() => {
      try {
        if (player.current?.getPlayerState() === 1) flush();
      } catch {
        /* Ignore a player being replaced. */
      }
    }, 15000);
    const hidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", hidden);
    return () => {
      flush();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, []);
  const paused = (event) => {
    const value = event.target.getCurrentTime();
    if (Number.isFinite(value)) {
      lastPosition.current = value;
      saveRef.current(value);
    }
  };
  return (
    <>
      <div className="video-frame">
        {!ready && !playerError && (
          <div
            className="video-loading skeleton"
            role="status"
            aria-label="Preparing video player"
          />
        )}
        {playerError ? (
          <div className="player-error" role="alert">
            <h3>This video couldn’t be played.</h3>
            <p>
              YouTube may be unavailable or the creator may have restricted
              embedding.
            </p>
            <Button
              className="secondary"
              onClick={() => {
                setPlayerError(false);
                setReady(false);
                setRetry(retry + 1);
              }}
            >
              Retry player
            </Button>
            <a
              href={`https://www.youtube.com/watch?v=${lesson.videoId}`}
              target="_blank"
              rel="noreferrer"
            >
              Open on YouTube
            </a>
          </div>
        ) : (
          <YouTube
            key={retry}
            videoId={lesson.videoId}
            title={lesson.title}
            opts={{
              width: "100%",
              height: "100%",
              playerVars: {
                autoplay: 0,
                rel: 0,
                start: Math.floor(initialPosition.current),
              },
            }}
            onReady={(event) => {
              player.current = event.target;
              setReady(true);
            }}
            onPause={paused}
            onEnd={(event) => {
              paused(event);
              complete();
            }}
            onError={() => {
              player.current = null;
              setPlayerError(true);
            }}
          />
        )}
      </div>
      <div className="save-status" aria-live="polite">
        {pending
          ? "Saving progress…"
          : error
            ? "Progress could not be saved."
            : "Progress saves as you learn."}
      </div>
      <FormError error={error} />
      {error && (
        <Button
          className="secondary"
          onClick={() => saveRef.current(lastPosition.current)}
        >
          Retry saving progress
        </Button>
      )}
    </>
  );
}
