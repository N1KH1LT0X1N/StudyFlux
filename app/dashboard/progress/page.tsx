"use client";

import { useEffect, useState } from "react";
import { Clock, FileText, MessageSquare, BookOpen, Target } from "lucide-react";
import StatsCard from "@/components/analytics/StatsCard";
import StudyChart from "@/components/analytics/StudyChart";
import { format, subDays, startOfDay } from "date-fns";
import { toast } from "sonner";

interface ProgressData {
  totalStudyTime: number;
  totalDocuments: number;
  totalQuestions: number;
  totalFlashcards: number;
  weeklyStudyTime: number;
  monthlyStudyTime: number;
  studyTimeData: Array<{ date: string; value: number }>;
  documentsData: Array<{ date: string; value: number }>;
}

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [timeRange, setTimeRange] = useState<7 | 30>(7);

  useEffect(() => {
    fetchProgressData();
  }, [timeRange]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);

      // Fetch study sessions
      const sessionsResponse = await fetch(
        `/api/study-sessions?limit=100`
      );
      if (!sessionsResponse.ok) throw new Error("Failed to fetch sessions");
      const sessionsData = await sessionsResponse.json();

      // Fetch documents
      const documentsResponse = await fetch("/api/documents");
      if (!documentsResponse.ok) throw new Error("Failed to fetch documents");
      const documentsData = await documentsResponse.json();

      // Process data for charts
      const studyTimeByDate: Record<string, number> = {};
      const documentsByDate: Record<string, number> = {};

      // Initialize all dates in range with 0
      for (let i = 0; i < timeRange; i++) {
        const date = format(subDays(new Date(), i), "MMM dd");
        studyTimeByDate[date] = 0;
        documentsByDate[date] = 0;
      }

      // Calculate total study time and aggregate by date
      let totalStudyTime = 0;
      let totalQuestions = 0;
      let totalFlashcards = 0;
      let weeklyStudyTime = 0;
      let monthlyStudyTime = 0;

      const now = new Date();
      const weekAgo = subDays(now, 7);
      const monthAgo = subDays(now, 30);

      sessionsData.sessions.forEach((session: any) => {
        const sessionDate = new Date(session.startedAt);
        const dateKey = format(sessionDate, "MMM dd");

        totalStudyTime += session.duration;
        totalQuestions += session.questionsAsked;
        totalFlashcards += session.flashcardsReviewed;

        // Add to weekly/monthly totals
        if (sessionDate >= weekAgo) {
          weeklyStudyTime += session.duration;
        }
        if (sessionDate >= monthAgo) {
          monthlyStudyTime += session.duration;
        }

        // Add to chart data if within range
        if (sessionDate >= subDays(now, timeRange)) {
          studyTimeByDate[dateKey] =
            (studyTimeByDate[dateKey] || 0) + session.duration / 60; // Convert to minutes
        }
      });

      // Count documents by upload date
      documentsData.documents.forEach((doc: any) => {
        const docDate = new Date(doc.uploadedAt);
        const dateKey = format(docDate, "MMM dd");

        if (docDate >= subDays(now, timeRange)) {
          documentsByDate[dateKey] = (documentsByDate[dateKey] || 0) + 1;
        }
      });

      // Convert to array format for charts (reverse to show oldest first)
      const studyTimeData = Object.entries(studyTimeByDate)
        .map(([date, value]) => ({
          date,
          value: Math.round(value),
        }))
        .reverse();

      const documentsChartData = Object.entries(documentsByDate)
        .map(([date, value]) => ({
          date,
          value,
        }))
        .reverse();

      setProgressData({
        totalStudyTime,
        totalDocuments: documentsData.documents.length,
        totalQuestions,
        totalFlashcards,
        weeklyStudyTime,
        monthlyStudyTime,
        studyTimeData,
        documentsData: documentsChartData,
      });
    } catch (error) {
      console.error("Error fetching progress data:", error);
      toast.error("Failed to load progress data");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Progress Dashboard
          </h1>
          <p className="text-gray-600">
            Track your learning journey and achievements
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={Clock}
            label="Total Study Time"
            value={formatTime(progressData?.totalStudyTime || 0)}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-100"
          />
          <StatsCard
            icon={FileText}
            label="Documents Uploaded"
            value={progressData?.totalDocuments || 0}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatsCard
            icon={MessageSquare}
            label="Questions Asked"
            value={progressData?.totalQuestions || 0}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatsCard
            icon={BookOpen}
            label="Flashcards Reviewed"
            value={progressData?.totalFlashcards || 0}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
        </div>

        {/* Time Period Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              This Week
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Study Time</span>
                <span className="font-semibold text-gray-900">
                  {formatTime(progressData?.weeklyStudyTime || 0)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      ((progressData?.weeklyStudyTime || 0) / (7 * 3600)) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">
                Goal: 7 hours per week
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              This Month
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Study Time</span>
                <span className="font-semibold text-gray-900">
                  {formatTime(progressData?.monthlyStudyTime || 0)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      ((progressData?.monthlyStudyTime || 0) / (30 * 3600)) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">
                Goal: 30 hours per month
              </p>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTimeRange(7)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              timeRange === 7
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange(30)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              timeRange === 30
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Last 30 Days
          </button>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <StudyChart
            data={progressData?.studyTimeData || []}
            type="line"
            title="Study Time (minutes)"
            color="#4f46e5"
          />
          <StudyChart
            data={progressData?.documentsData || []}
            type="bar"
            title="Documents Uploaded"
            color="#3b82f6"
          />
        </div>

        {/* Goals Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-gray-900">Daily Goals</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">Daily Study Goal: 1 hour</span>
                <span className="text-sm font-medium text-gray-600">
                  {Math.min(
                    Math.round(
                      ((progressData?.weeklyStudyTime || 0) / 7 / 3600) * 100
                    ),
                    100
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      ((progressData?.weeklyStudyTime || 0) / 7 / 3600) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Keep studying daily to maintain your streak and earn more points!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
