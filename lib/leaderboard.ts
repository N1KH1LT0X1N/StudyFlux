import { prisma } from './prisma';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string | null;
  image: string | null;
  points: number;
  level: number;
  streak: number;
}

/**
 * Get leaderboard for a specific period
 * @param period - 'weekly', 'monthly', or 'alltime'
 * @param limit - Maximum number of entries to return
 * @returns Array of leaderboard entries
 */
export async function getLeaderboard(
  period: 'weekly' | 'monthly' | 'alltime' = 'alltime',
  limit: number = 100
): Promise<LeaderboardEntry[]> {
  try {
    let users;

    if (period === 'alltime') {
      // All-time leaderboard based on total points
      users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          image: true,
          points: true,
          level: true,
          streak: true,
        },
        orderBy: {
          points: 'desc',
        },
        take: limit,
      });
    } else {
      // Weekly or monthly leaderboard based on recent points
      const now = new Date();
      let startDate: Date;

      if (period === 'weekly') {
        // Last 7 days
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
      } else {
        // Last 30 days
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
      }

      // Get points earned in the period, grouped by user
      const pointsInPeriod = await prisma.pointsHistory.groupBy({
        by: ['userId'],
        _sum: {
          points: true,
        },
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        orderBy: {
          _sum: {
            points: 'desc',
          },
        },
        take: limit,
      });

      // Get user details for the top scorers
      const userIds = pointsInPeriod.map((p: any) => p.userId);
      const userDetails = await prisma.user.findMany({
        where: {
          id: {
            in: userIds,
          },
        },
        select: {
          id: true,
          name: true,
          image: true,
          points: true,
          level: true,
          streak: true,
        },
      });

      // Create a map for quick lookup
      const userMap = new Map(userDetails.map((u: any) => [u.id, u]));

      // Combine points in period with user details
      users = pointsInPeriod
        .map((p: any) => {
          const user = userMap.get(p.userId);
          if (!user) return null;

          return {
            ...user,
            periodPoints: p._sum.points || 0,
          };
        })
        .filter((u: any) => u !== null) as any[];
    }

    // Add rank to each entry
    const leaderboard: LeaderboardEntry[] = users.map((user: any, index: number) => ({
      rank: index + 1,
      userId: user.id,
      name: user.name,
      image: user.image,
      points: period === 'alltime' ? user.points : (user as any).periodPoints,
      level: user.level,
      streak: user.streak,
    }));

    return leaderboard;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
}

/**
 * Get user's rank on the leaderboard
 * @param userId - User ID
 * @param period - 'weekly', 'monthly', or 'alltime'
 * @returns User's rank (1-indexed) or null if not ranked
 */
export async function getUserRank(
  userId: string,
  period: 'weekly' | 'monthly' | 'alltime' = 'alltime'
): Promise<number | null> {
  try {
    if (period === 'alltime') {
      // Count users with more points
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { points: true },
      });

      if (!user) return null;

      const higherRankedCount = await prisma.user.count({
        where: {
          points: {
            gt: user.points,
          },
        },
      });

      return higherRankedCount + 1;
    } else {
      // For weekly/monthly, calculate points in period
      const now = new Date();
      let startDate: Date;

      if (period === 'weekly') {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
      } else {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
      }

      // Get user's points in period
      const userPoints = await prisma.pointsHistory.aggregate({
        _sum: {
          points: true,
        },
        where: {
          userId,
          createdAt: {
            gte: startDate,
          },
        },
      });

      const userPeriodPoints = userPoints._sum.points || 0;

      // Count users with more points in the period
      const allUserPoints = await prisma.pointsHistory.groupBy({
        by: ['userId'],
        _sum: {
          points: true,
        },
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      });

      const higherRankedCount = allUserPoints.filter(
        (up: any) => (up._sum.points || 0) > userPeriodPoints
      ).length;

      return higherRankedCount + 1;
    }
  } catch (error) {
    console.error('Error getting user rank:', error);
    return null;
  }
}

/**
 * Check if user reached top 10 for the achievement
 * @param userId - User ID
 * @returns true if user is in top 10 all-time
 */
export async function isUserInTop10(userId: string): Promise<boolean> {
  const rank = await getUserRank(userId, 'alltime');
  return rank !== null && rank <= 10;
}
