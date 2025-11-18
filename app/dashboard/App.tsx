'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Upload,
  Brain,
  BookOpen,
  TrendingUp,
  Award,
  Flame,
  Target,
  FileText,
  Play,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface UserStats {
  points: number;
  level: number;
  streak: number;
  dueFlashcards: number;
  totalDocuments: number;
  totalFlashcards: number;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
  recentAchievements: Array<{
    id: string;
    name: string;
    icon: string;
    unlockedAt: string;
  }>;
}

function App() {
  const router = useRouter();
  const { data: session } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [statsRes, flashcardsRes, docsRes, achievementsRes] = await Promise.all([
        fetch('/api/user/stats'),
        fetch('/api/flashcards?dueOnly=true&limit=1'),
        fetch('/api/documents'),
        fetch('/api/achievements/user?limit=3'),
      ]);

      const [statsData, flashcardsData, docsData, achievementsData] = await Promise.all([
        statsRes.json(),
        flashcardsRes.json(),
        docsRes.json(),
        achievementsRes.json(),
      ]);

      setStats({
        points: statsData.points || 0,
        level: statsData.level || 1,
        streak: statsData.streak || 0,
        dueFlashcards: flashcardsData.dueCount || 0,
        totalDocuments: docsData.documents?.length || 0,
        totalFlashcards: statsData.totalFlashcards || 0,
        recentActivities: [],
        recentAchievements: achievementsData.achievements?.slice(0, 3) || [],
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {session?.user?.name || 'Learner'}!
          </h1>
          <p className="text-gray-400">
            Ready to continue your learning journey?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-blue-200" />
              <span className="text-sm text-blue-200">Level {stats?.level}</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats?.points}</div>
            <div className="text-sm text-blue-200">Total Points</div>
          </div>

          <div className="bg-gradient-to-br from-orange-900 to-orange-700 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-8 h-8 text-orange-200" />
              <span className="text-sm text-orange-200">Streak</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats?.streak}</div>
            <div className="text-sm text-orange-200">Days Active</div>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-purple-700 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Brain className="w-8 h-8 text-purple-200" />
              <span className="text-sm text-purple-200">Flashcards</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats?.dueFlashcards}</div>
            <div className="text-sm text-purple-200">Due Today</div>
          </div>
        </div>

        {/* Due Today Widget */}
        {stats && stats.dueFlashcards > 0 && (
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 border border-indigo-700 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-500 p-3 rounded-full">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Flashcards Due for Review
                  </h3>
                  <p className="text-gray-300">
                    You have {stats.dueFlashcards} flashcard{stats.dueFlashcards !== 1 ? 's' : ''} waiting for review. Keep your knowledge fresh!
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/flashcards/review?dueOnly=true"
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                <TrendingUp className="w-5 h-5" />
                Review Now
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/dashboard/documents"
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-blue-500 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500/10 p-3 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <Upload className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Upload Document</h3>
                    <p className="text-sm text-gray-400">
                      Upload and analyze your study materials
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/dashboard/flashcards/review"
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-purple-500 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-purple-500/10 p-3 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                    <Brain className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Review Flashcards</h3>
                    <p className="text-sm text-gray-400">
                      Practice with spaced repetition
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/dashboard/study"
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-green-500 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-green-500/10 p-3 rounded-lg group-hover:bg-green-500/20 transition-colors">
                    <Play className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Start Study Session</h3>
                    <p className="text-sm text-gray-400">
                      Track your focused study time
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/dashboard/quizzes"
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-yellow-500 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-yellow-500/10 p-3 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                    <FileText className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Take a Quiz</h3>
                    <p className="text-sm text-gray-400">
                      Test your knowledge with AI quizzes
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Achievements */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Achievements</h2>
              <Link
                href="/dashboard/achievements"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {stats?.recentAchievements && stats.recentAchievements.length > 0 ? (
                stats.recentAchievements.map((achievement: any) => (
                  <div
                    key={achievement.id}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{achievement.achievement.icon}</div>
                      <div>
                        <h3 className="font-semibold">
                          {achievement.achievement.name}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
                  <Award className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    No achievements yet. Keep learning!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Your Progress */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-500 mb-2">
                {stats?.totalDocuments || 0}
              </div>
              <div className="text-sm text-gray-400">Documents Uploaded</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-500 mb-2">
                {stats?.totalFlashcards || 0}
              </div>
              <div className="text-sm text-gray-400">Flashcards Created</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500 mb-2">
                {stats?.level || 1}
              </div>
              <div className="text-sm text-gray-400">Current Level</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
