'use client';

import { useState, useEffect } from 'react';
import { Trophy, RefreshCw, TrendingUp } from 'lucide-react';
import PodiumDisplay from '@/components/leaderboard/PodiumDisplay';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string | null;
  image: string | null;
  points: number;
  level: number;
  streak: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  period: string;
  userRank: number | null;
  cached: boolean;
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'alltime'>('alltime');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeaderboard();

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchLeaderboard(true);
    }, 60000);

    return () => clearInterval(interval);
  }, [period]);

  const fetchLeaderboard = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const response = await fetch(`/api/leaderboard?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setData(data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchLeaderboard();
  };

  const top3 = data?.leaderboard.slice(0, 3) || [];
  const rest = data?.leaderboard.slice(3) || [];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-400" />
              <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          <p className="text-gray-400">
            See how you rank against other learners.
          </p>
        </div>

        {/* Period Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === 'weekly'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === 'monthly'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setPeriod('alltime')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === 'alltime'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All-Time
          </button>
        </div>

        {/* User Rank */}
        {data?.userRank && (
          <div className="mb-8 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-indigo-400" />
                <div>
                  <p className="text-sm text-gray-400">Your Rank</p>
                  <p className="text-2xl font-bold text-white">#{data.userRank}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">
                  {data.userRank <= 10
                    ? 'Top 10!'
                    : data.userRank <= 100
                    ? 'Top 100!'
                    : 'Keep climbing!'}
                </p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading leaderboard...</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {top3.length > 0 && (
              <div className="mb-12">
                <PodiumDisplay top3={top3} />
              </div>
            )}

            {/* Rest of Leaderboard */}
            {rest.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">
                  {top3.length > 0 ? 'Rankings 4-100' : 'Top Rankings'}
                </h2>
                <LeaderboardTable entries={rest} />
              </div>
            )}

            {/* No data */}
            {data?.leaderboard.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No leaderboard data available yet.</p>
                <p className="text-sm mt-2">Be the first to earn points!</p>
              </div>
            )}
          </>
        )}

        {/* Cache indicator */}
        {data?.cached && (
          <div className="mt-8 text-center text-xs text-gray-500">
            Data cached - refreshes every minute
          </div>
        )}
      </div>
    </div>
  );
}
