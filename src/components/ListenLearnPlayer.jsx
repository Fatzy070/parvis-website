import { useState, useRef, useEffect, useCallback } from "react";
import {
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "./UI";
import { resolveApiUrl } from "../api/client";

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

function formatTime(seconds) {
  if (!seconds || Number.isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export default function ListenLearnPlayer({
  audio,
  onRequestAudio,
  isRequesting = false,
  onRetry,
  label = "Listen",
  compact = false,
}) {
  // Normalize audio object: handles both raw result or { data: result }
  const resolvedAudio = audio?.data || audio;
  const rawStreamUrl = resolvedAudio?.streamUrl;
  const resolvedStreamUrl = resolveApiUrl(rawStreamUrl);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(resolvedAudio?.duration || 0);
  // const [playbackRate, setPlaybackRate] = useState(1);
  const [playerError, setPlayerError] = useState(null);

  const audioRef = useRef(null);

  // Sync duration from audio prop if available
  useEffect(() => {
    if (resolvedAudio?.duration && !duration) {
      setDuration(resolvedAudio.duration);
    }
  }, [resolvedAudio?.duration, duration]);

  // Reset playback position if stream URL changes to a different source
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    setPlayerError(null);
  }, [resolvedStreamUrl]);

  // Clean up audio on unmount safely without mutating DOM attributes
  useEffect(() => {
    const el = audioRef.current;
    return () => {
      if (el) {
        try {
          if (typeof el.pause === "function") el.pause();
        } catch {
          // Ignore unmount pause errors
        }
      }
    };
  }, []);

  const togglePlay = useCallback(async () => {
    const el = audioRef.current;
    if (!el) return;

    setPlayerError(null);

    if (isPlaying) {
      try {
        if (typeof el.pause === "function") el.pause();
      } catch {
        // Ignore pause errors
      }
      setIsPlaying(false);
    } else {
      try {
        if (typeof el.play === "function") {
          const promise = el.play();
          if (promise !== undefined) {
            await promise;
          }
        }
        setIsPlaying(true);
      } catch (err) {
        if (err?.name !== "AbortError") {
          setIsPlaying(false);
          setPlayerError(
            err?.message?.includes("supported")
              ? "Audio format or stream is not supported by your browser."
              : "Playback could not start. Please retry.",
          );
        }
      }
    }
  }, [isPlaying]);

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // const changeSpeed = (speed) => {
  //   setPlaybackRate(speed);
  //   if (audioRef.current) {
  //     audioRef.current.playbackRate = speed;
  //   }
  // };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      if (
        audioDuration &&
        !Number.isNaN(audioDuration) &&
        Number.isFinite(audioDuration)
      ) {
        setDuration(audioDuration);
      }
      // audioRef.current.playbackRate = playbackRate;
    }
  };

  const handleError = () => {
    setIsPlaying(false);
    const mediaError = audioRef.current?.error;
    let message = "Unable to play audio stream. Please retry.";
    if (mediaError) {
      if (mediaError.code === 2) {
        message = "A network error prevented audio playback. Please retry.";
      } else if (mediaError.code === 3) {
        message = "Audio decoding failed. Please retry.";
      } else if (mediaError.code === 4) {
        message = "Audio stream could not be loaded. Please retry.";
      }
    }
    setPlayerError(message);
  };

  // 1. Initial State: Audio not yet requested/generated
  if (!resolvedAudio && !isRequesting) {
    return (
      <div className={`listen-learn-container ${compact ? "compact" : ""}`}>
        <Button
          type="button"
          className="secondary listen-btn"
          onClick={onRequestAudio}
        >
          <Volume2 size={16} />
          {label}
        </Button>
      </div>
    );
  }

  // 2. Generating State
  if (isRequesting || resolvedAudio?.status === "generating") {
    return (
      <div
        className={`listen-learn-container generating ${compact ? "compact" : ""}`}
      >
        <div className="listen-generating-badge">
          <Loader2 size={16} className="spin-icon" />
          <span>Preparing narration…</span>
        </div>
      </div>
    );
  }

  // 3. Failed State (Generation failure or Playback failure)
  if (resolvedAudio?.status === "failed" || playerError) {
    return (
      <div
        className={`listen-learn-container failed ${compact ? "compact" : ""}`}
      >
        <div className="listen-error-message">
          <AlertCircle size={16} />
          <span>
            {playerError || resolvedAudio?.error || "Audio generation failed."}
          </span>
        </div>
        <Button
          type="button"
          className="secondary small"
          onClick={() => {
            setPlayerError(null);
            if (playerError && audioRef.current && resolvedStreamUrl) {
              // Playback error with existing audio: attempt reload without regenerating
              try {
                audioRef.current.load();
                audioRef.current
                  .play()
                  .then(() => setIsPlaying(true))
                  .catch(() => {
                    if (onRetry) onRetry();
                    else if (onRequestAudio) onRequestAudio();
                  });
              } catch {
                if (onRetry) onRetry();
                else if (onRequestAudio) onRequestAudio();
              }
            } else if (onRetry) {
              onRetry();
            } else if (onRequestAudio) {
              onRequestAudio();
            }
          }}
        >
          <RotateCcw size={14} />
          Retry
        </Button>
      </div>
    );
  }

  // 4. Ready State: Full Audio Player
  if (resolvedAudio?.status === "ready" && resolvedStreamUrl) {
    return (
      <div
        className={`listen-learn-player ${compact ? "compact" : ""}`}
        role="region"
        aria-label="Listen & Learn Narration"
      >
        <audio
          ref={audioRef}
          src={resolvedStreamUrl}
          preload="metadata"
          crossOrigin="anonymous"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={() => setPlayerError(null)}
          onPlaying={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={handleEnded}
          onError={handleError}
        />

        <div className="player-top-row">
          <div className="player-meta">
            <span className="player-tag">Listen &amp; Learn</span>
            <span className="narrator-name">Parvis Narrator</span>
          </div>
          {/* <div className="speed-selector" aria-label="Playback speed">
            {SPEEDS.map((speed) => (
              <button
                key={speed}
                type="button"
                className={`speed-pill ${playbackRate === speed ? "active" : ""}`}
                onClick={() => changeSpeed(speed)}
                aria-pressed={playbackRate === speed}
              >
                {speed}×
              </button>
            ))}
          </div> */}
        </div>

        <div className="player-controls-row">
          <button
            type="button"
            className="play-pause-btn"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause narration" : "Play narration"}
          >
            {isPlaying ? (
              <Pause size={18} />
            ) : (
              <Play size={18} className="play-icon-offset" />
            )}
          </button>

          <div className="scrubber-wrapper">
            <input
              type="range"
              className="player-slider"
              min="0"
              max={duration || 1}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              aria-label="Audio scrubber"
            />
            <div className="time-display">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
