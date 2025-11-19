"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Clock, MessageSquare, BookOpen, Calendar } from "lucide-react";
import SessionTimer from "@/components/study/SessionTimer";
import { toast } from "sonner";

interface StudySession {
  id: string;
  duration: number;
  questionsAsked: number;
  flashcardsReviewed: number;
  pointsEarned: number;
  startedAt: string;
  endedAt?: string;
  document?: {
    id: string;
    title: string;
  };
}

export default function StudyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionIdParam = searchParams.get("sessionId");

  const [currentSession, setCurrentSession] = useState<StudySession | null>(
    null
  );
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionIdParam) {
      fetchCurrentSession(sessionIdParam);
    }
    fetchRecentSessions();
  }, [sessionIdParam]);

  const fetchCurrentSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/study-sessions/${sessionId}`);
      if (!response.ok) throw new Error("Failed to fetch session");
      const data = await response.json();
      setCurrentSession(data.session);
    } catch (error) {
      console.error("Error fetching session:", error);
      toast.error("Failed to load study session");
    }
  };

  const fetchRecentSessions = async () => {
    try {
      const response = await fetch("/api/study-sessions?limit=5");
      if (!response.ok) throw new Error("Failed to fetch sessions");
      const data = await response.json();
      setRecentSessions(data.sessions);
    } catch (error) {
      console.error("Error fetching recent sessions:", error);
    }
  };

  const handleStartNewSession = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/study-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) throw new Error("Failed to start session");

      const data = await response.json();
      setCurrentSession(data.session);
      toast.success("Study session started!");
    } catch (error) {
      console.error("Error starting session:", error);
      toast.error("Failed to start study session");
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async (duration: number) => {
    if (!currentSession) return;

    try {
      const response = await fetch(`/api/study-sessions/${currentSession.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration,
          endSession: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to end session");

      const data = await response.json();

      if (data.pointsEarned > 0) {
        toast.success(`Session ended! You earned ${data.pointsEarned} points!`);
      } else {
        toast.success("Session ended!");
      }

      setCurrentSession(null);
      fetchRecentSessions();
    } catch (error) {
      console.error("Error ending session:", error);
      toast.error("Failed to end study session");
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Study Sessions</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Session */}
            {currentSession && !currentSession.endedAt ? (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Active Session
                </h2>
                {currentSession.document && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-indigo-700">
                      Studying: <strong>{currentSession.document.title}</strong>
                    </p>
                  </div>
                )}
                <SessionTimer
                  sessionId={currentSession.id}
                  onEnd={handleEndSession}
                  autoStart={true}
                />

                {/* Session Metrics */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Duration</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatDuration(currentSession.duration)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">Questions</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentSession.questionsAsked}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-sm">Flashcards</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentSession.flashcardsReviewed}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  No Active Session
                </h2>
                <p className="text-gray-600 mb-6">
                  Start a new study session to track your progress and earn points
                </p>
                <button
                  onClick={handleStartNewSession}
                  disabled={loading}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? "Starting..." : "Start New Session"}
                </button>
              </div>
            )}

            {/* Recent Sessions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Recent Sessions
              </h2>
              {recentSessions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No study sessions yet
                </p>
              ) : (
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          {session.document && (
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {session.document.title}
                            </h3>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(session.startedAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDuration(session.duration)}
                            </span>
                          </div>
                        </div>
                        {session.pointsEarned > 0 && (
                          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            +{session.pointsEarned} pts
                          </div>
                        )}
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>{session.questionsAsked} questions</span>
                        <span>{session.flashcardsReviewed} flashcards</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Tips */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">Pomodoro Technique</h3>
              <p className="text-sm text-gray-600 mb-4">
                Study effectively using the Pomodoro Technique:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">1.</span>
                  <span>Work for 25 minutes focused on your study material</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">2.</span>
                  <span>Take a 5-minute break to relax and recharge</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">3.</span>
                  <span>Repeat the cycle for maximum productivity</span>
                </li>
              </ul>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
              <h3 className="font-bold text-indigo-900 mb-2">Earn Points!</h3>
              <p className="text-sm text-indigo-700">
                Complete 1 hour of studying to earn 20 points. Keep going to level
                up!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
