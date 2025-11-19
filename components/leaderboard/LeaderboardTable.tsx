'use client';

import { Trophy, Medal, Award, Flame } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string | null;
  image: string | null;
  points: number;
  level: number;
  streak: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  highlightUserId?: string;
}

const getRankBadge = (rank: number) => {
  if (rank === 1) {
    return <Trophy className="h-5 w-5 text-yellow-400" />;
  } else if (rank === 2) {
    return <Medal className="h-5 w-5 text-gray-400" />;
  } else if (rank === 3) {
    return <Award className="h-5 w-5 text-orange-600" />;
  } else if (rank <= 10) {
    return (
      <div className="h-5 w-5 flex items-center justify-center bg-indigo-600 rounded-full text-white text-xs font-bold">
        {rank}
      </div>
    );
  } else {
    return (
      <div className="h-5 w-5 flex items-center justify-center text-gray-500 text-xs">
        {rank}
      </div>
    );
  }
};

const getRankColor = (rank: number) => {
  if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50';
  if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50';
  if (rank === 3) return 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-500/50';
  if (rank <= 10) return 'bg-indigo-500/10 border-indigo-500/30';
  return 'bg-gray-800/50 border-gray-700/50';
};

export default function LeaderboardTable({
  entries,
  highlightUserId,
}: LeaderboardTableProps) {
  const { data: session } = useSession();
  const currentUserId = highlightUserId || session?.user?.id;

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No leaderboard data available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const isCurrentUser = entry.userId === currentUserId;
        const rankColor = getRankColor(entry.rank);

        return (
          <div
            key={entry.userId}
            className={`
              flex items-center gap-4 p-4 rounded-lg border transition-all
              ${rankColor}
              ${isCurrentUser ? 'ring-2 ring-indigo-500 shadow-lg scale-105' : ''}
            `}
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-12 flex justify-center">
              {getRankBadge(entry.rank)}
            </div>

            {/* Avatar */}
            <div className="flex-shrink-0">
              {entry.image ? (
                <img
                  src={entry.image}
                  alt={entry.name || 'User'}
                  className="h-12 w-12 rounded-full border-2 border-gray-700"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg border-2 border-gray-700">
                  {(entry.name || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Name */}
            <div className="flex-grow min-w-0">
              <div className="font-bold text-white truncate">
                {entry.name || 'Anonymous User'}
                {isCurrentUser && (
                  <span className="ml-2 text-xs text-indigo-400">(You)</span>
                )}
              </div>
              <div className="text-sm text-gray-400">Level {entry.level}</div>
            </div>

            {/* Streak */}
            {entry.streak > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-orange-400 font-medium">
                  {entry.streak}
                </span>
              </div>
            )}

            {/* Points */}
            <div className="text-right">
              <div className="text-lg font-bold text-white">
                {entry.points.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">points</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
