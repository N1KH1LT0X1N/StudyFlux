'use client';

import { Trophy, Award, Medal } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string | null;
  image: string | null;
  points: number;
  level: number;
  streak: number;
}

interface PodiumDisplayProps {
  top3: LeaderboardEntry[];
}

const PodiumPosition = ({
  entry,
  position,
}: {
  entry: LeaderboardEntry;
  position: 1 | 2 | 3;
}) => {
  const heights = {
    1: 'h-48',
    2: 'h-40',
    3: 'h-32',
  };

  const colors = {
    1: 'from-yellow-500 to-yellow-700',
    2: 'from-gray-400 to-gray-600',
    3: 'from-orange-600 to-orange-800',
  };

  const icons = {
    1: <Trophy className="h-8 w-8 text-yellow-400" />,
    2: <Medal className="h-7 w-7 text-gray-400" />,
    3: <Award className="h-6 w-6 text-orange-600" />,
  };

  const avatarSizes = {
    1: 'h-20 w-20',
    2: 'h-16 w-16',
    3: 'h-14 w-14',
  };

  return (
    <div className="flex flex-col items-center">
      {/* User Avatar and Info */}
      <div className="flex flex-col items-center mb-4 z-10">
        {/* Avatar */}
        <div className={`relative mb-2 ${avatarSizes[position]}`}>
          {entry.image ? (
            <img
              src={entry.image}
              alt={entry.name || 'User'}
              className={`${avatarSizes[position]} rounded-full border-4 ${
                position === 1
                  ? 'border-yellow-400'
                  : position === 2
                  ? 'border-gray-400'
                  : 'border-orange-600'
              }`}
            />
          ) : (
            <div
              className={`${avatarSizes[position]} rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 ${
                position === 1
                  ? 'bg-yellow-600 border-yellow-400'
                  : position === 2
                  ? 'bg-gray-600 border-gray-400'
                  : 'bg-orange-700 border-orange-600'
              }`}
            >
              {(entry.name || 'U')[0].toUpperCase()}
            </div>
          )}

          {/* Rank Badge */}
          <div className="absolute -top-2 -right-2 bg-gray-900 rounded-full p-1 border-2 border-gray-700">
            {icons[position]}
          </div>
        </div>

        {/* Name */}
        <div className="text-center max-w-[120px]">
          <div className={`font-bold text-white truncate ${position === 1 ? 'text-lg' : 'text-sm'}`}>
            {entry.name || 'Anonymous'}
          </div>
          <div className="text-xs text-gray-400">Level {entry.level}</div>
        </div>

        {/* Points */}
        <div className={`mt-2 font-bold ${position === 1 ? 'text-lg' : 'text-sm'} text-white`}>
          {entry.points.toLocaleString()}
          <span className="text-xs text-gray-400 ml-1">pts</span>
        </div>
      </div>

      {/* Podium */}
      <div
        className={`
          w-full rounded-t-lg bg-gradient-to-b ${colors[position]}
          flex flex-col items-center justify-end pb-4
          ${heights[position]}
          relative overflow-hidden
        `}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent animate-shimmer" />

        {/* Rank number */}
        <div className="text-6xl font-bold text-white/30 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {position}
        </div>

        {/* Position label */}
        <div className="text-white font-bold text-sm z-10">
          {position === 1 ? '1st Place' : position === 2 ? '2nd Place' : '3rd Place'}
        </div>
      </div>
    </div>
  );
};

export default function PodiumDisplay({ top3 }: PodiumDisplayProps) {
  const first = top3.find((e) => e.rank === 1);
  const second = top3.find((e) => e.rank === 2);
  const third = top3.find((e) => e.rank === 3);

  if (!first && !second && !third) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <p>No top performers yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Celebration background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
        <div className="absolute top-0 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Podium layout: 2nd, 1st, 3rd */}
      <div className="grid grid-cols-3 gap-4 items-end max-w-4xl mx-auto">
        {/* 2nd Place */}
        <div className="flex justify-center">
          {second ? <PodiumPosition entry={second} position={2} /> : <div />}
        </div>

        {/* 1st Place (Center, Tallest) */}
        <div className="flex justify-center">
          {first ? <PodiumPosition entry={first} position={1} /> : <div />}
        </div>

        {/* 3rd Place */}
        <div className="flex justify-center">
          {third ? <PodiumPosition entry={third} position={3} /> : <div />}
        </div>
      </div>
    </div>
  );
}
