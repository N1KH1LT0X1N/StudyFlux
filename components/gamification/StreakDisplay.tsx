'use client';

import { Flame, AlertTriangle, Zap } from 'lucide-react';

interface StreakDisplayProps {
  streak: number;
  lastActiveAt?: Date;
  compact?: boolean;
}

export default function StreakDisplay({
  streak,
  lastActiveAt,
  compact = false,
}: StreakDisplayProps) {
  // Check if streak is at risk (last active was yesterday and it's been more than 20 hours)
  const isAtRisk = () => {
    if (!lastActiveAt || streak === 0) return false;

    const now = new Date();
    const lastActive = new Date(lastActiveAt);
    const hoursSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);

    // Check if last active was yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const isSameDay = (d1: Date, d2: Date) => {
      return (
        d1.getUTCFullYear() === d2.getUTCFullYear() &&
        d1.getUTCMonth() === d2.getUTCMonth() &&
        d1.getUTCDate() === d2.getUTCDate()
      );
    };

    return isSameDay(lastActive, yesterday) && hoursSinceActive >= 20;
  };

  // Get next milestone
  const getNextMilestone = () => {
    if (streak < 7) return { value: 7, name: 'Week Warrior' };
    if (streak < 30) return { value: 30, name: 'Month Master' };
    if (streak < 100) return { value: 100, name: 'Century Streak' };
    return null;
  };

  const milestone = getNextMilestone();
  const atRisk = isAtRisk();

  // Compact version
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Flame className={`h-5 w-5 ${streak > 0 ? 'text-orange-500' : 'text-gray-500'}`} />
        <span className="text-sm font-medium text-white">
          {streak} day{streak !== 1 ? 's' : ''}
        </span>
        {atRisk && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
      </div>
    );
  }

  // Full version
  return (
    <div className="rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-500/50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className={`h-6 w-6 ${streak > 0 ? 'text-orange-500 animate-pulse' : 'text-gray-500'}`} />
          <h3 className="text-lg font-bold text-white">Daily Streak</h3>
        </div>
        {atRisk && (
          <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded text-yellow-400 text-xs font-bold">
            <AlertTriangle className="h-3 w-3" />
            At Risk!
          </div>
        )}
      </div>

      {/* Streak Count */}
      <div className="mb-4">
        <div className="text-4xl font-bold text-white mb-1">
          {streak} {streak === 1 ? 'Day' : 'Days'}
        </div>
        <p className="text-sm text-gray-300">
          {streak === 0 ? (
            'Start your streak today!'
          ) : streak < 7 ? (
            'Keep it up! You\'re building momentum.'
          ) : streak < 30 ? (
            'Great job! You\'re on fire!'
          ) : streak < 100 ? (
            'Incredible! You\'re a streak master!'
          ) : (
            'Legendary! You\'re unstoppable!'
          )}
        </p>
      </div>

      {/* Progress to next milestone */}
      {milestone && (
        <div>
          <div className="flex justify-between text-xs text-gray-300 mb-2">
            <span>Progress to {milestone.name}</span>
            <span>{streak} / {milestone.value}</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
              style={{ width: `${(streak / milestone.value) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
            <Zap className="h-3 w-3" />
            <span>{milestone.value - streak} more days to unlock achievement!</span>
          </div>
        </div>
      )}

      {/* Warning message if at risk */}
      {atRisk && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
          <p className="text-sm text-yellow-400">
            <strong>Warning:</strong> Your streak is at risk! Log in and stay active today to keep it going.
          </p>
        </div>
      )}

      {/* Streak freeze (premium feature placeholder) */}
      {streak >= 7 && (
        <div className="mt-4 p-3 bg-gray-800/50 border border-gray-700 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Streak Freeze</p>
              <p className="text-xs text-gray-500">Protect your streak (Premium)</p>
            </div>
            <div className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded">
              PREMIUM
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
