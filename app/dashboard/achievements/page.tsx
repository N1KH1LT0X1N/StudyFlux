'use client';

import { useState, useEffect } from 'react';
import { Trophy, Lock, CheckCircle, Filter } from 'lucide-react';
import AchievementCard from '@/components/gamification/AchievementCard';

interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  tier: string;
  unlocked: boolean;
  unlockedAt: Date | null;
  progress: number;
  currentValue: number;
  targetValue: number;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/achievements');
      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = achievements.filter((achievement) => {
    if (filter === 'unlocked') return achievement.unlocked;
    if (filter === 'locked') return !achievement.unlocked;
    return true;
  });

  const stats = {
    total: achievements.length,
    unlocked: achievements.filter((a) => a.unlocked).length,
    locked: achievements.filter((a) => !a.unlocked).length,
    totalPoints: achievements
      .filter((a) => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0),
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">Achievements</h1>
          </div>
          <p className="text-gray-400">
            Unlock achievements by completing challenges and earning points.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Total Achievements</div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-4 border border-green-500/50">
            <div className="text-sm text-gray-400 mb-1">Unlocked</div>
            <div className="text-2xl font-bold text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              {stats.unlocked}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Locked</div>
            <div className="text-2xl font-bold text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-gray-500" />
              {stats.locked}
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg p-4 border border-yellow-500/50">
            <div className="text-sm text-gray-400 mb-1">Points Earned</div>
            <div className="text-2xl font-bold text-white">{stats.totalPoints}</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('unlocked')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'unlocked'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Unlocked ({stats.unlocked})
            </button>
            <button
              onClick={() => setFilter('locked')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'locked'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Locked ({stats.locked})
            </button>
          </div>
        </div>

        {/* Achievements Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading achievements...</p>
          </div>
        ) : filteredAchievements.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>No achievements found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                icon={achievement.icon}
                name={achievement.name}
                description={achievement.description}
                points={achievement.points}
                tier={achievement.tier}
                unlocked={achievement.unlocked}
                unlockedAt={achievement.unlockedAt}
                progress={achievement.progress}
                currentValue={achievement.currentValue}
                targetValue={achievement.targetValue}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
