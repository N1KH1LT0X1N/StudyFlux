"use client";

import { useState, useEffect } from "react";
import { Play, Pause, Square, Clock } from "lucide-react";

interface SessionTimerProps {
  sessionId?: string;
  onEnd?: (duration: number) => void;
  autoStart?: boolean;
}

export default function SessionTimer({
  sessionId,
  onEnd,
  autoStart = false,
}: SessionTimerProps) {
  const [duration, setDuration] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work");

  // Pomodoro settings (in seconds)
  const WORK_TIME = 25 * 60; // 25 minutes
  const BREAK_TIME = 5 * 60; // 5 minutes

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);

        // Auto-switch between work and break (Pomodoro)
        if (mode === "work" && duration >= WORK_TIME) {
          // Work time is complete, switch to break
          setMode("break");
          setDuration(0);
          // Optional: Play a sound or notification
        } else if (mode === "break" && duration >= BREAK_TIME) {
          // Break time is complete, switch back to work
          setMode("work");
          setDuration(0);
          // Optional: Play a sound or notification
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isPaused, duration, mode]);

  // Auto-save session data periodically
  useEffect(() => {
    if (!sessionId || !isRunning) return;

    const saveInterval = setInterval(() => {
      updateSession(duration);
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [sessionId, isRunning, duration]);

  const updateSession = async (currentDuration: number) => {
    if (!sessionId) return;

    try {
      await fetch(`/api/study-sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: currentDuration,
        }),
      });
    } catch (error) {
      console.error("Error updating session:", error);
    }
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = async () => {
    setIsRunning(false);
    setIsPaused(false);

    if (sessionId) {
      await updateSession(duration);
    }

    if (onEnd) {
      onEnd(duration);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getProgress = () => {
    const total = mode === "work" ? WORK_TIME : BREAK_TIME;
    return (duration / total) * 100;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === "work" ? "Study Time" : "Break Time"}
          </h3>
        </div>

        {/* Timer Display */}
        <div className="text-5xl font-bold text-indigo-600 mb-4">
          {formatTime(duration)}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all ${
              mode === "work" ? "bg-indigo-600" : "bg-green-600"
            }`}
            style={{ width: `${Math.min(getProgress(), 100)}%` }}
          ></div>
        </div>

        {/* Pomodoro Info */}
        <p className="text-sm text-gray-600">
          {mode === "work"
            ? `Work session: ${Math.floor(WORK_TIME / 60)} minutes`
            : `Break time: ${Math.floor(BREAK_TIME / 60)} minutes`}
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Play className="w-4 h-4" />
            Start
          </button>
        ) : (
          <>
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
            >
              <Pause className="w-4 h-4" />
              {isPaused ? "Resume" : "Pause"}
            </button>
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          </>
        )}
      </div>
    </div>
  );
}
