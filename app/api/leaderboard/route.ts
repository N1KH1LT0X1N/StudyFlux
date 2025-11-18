import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getLeaderboard, getUserRank } from '@/lib/leaderboard';

// Cache for 1 minute to prevent spam
let cache: {
  [key: string]: {
    data: any;
    timestamp: number;
  };
} = {};

const CACHE_DURATION = 60 * 1000; // 1 minute

/**
 * GET /api/leaderboard?period=weekly|monthly|alltime
 * Get leaderboard for the specified period
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = (searchParams.get('period') || 'alltime') as
      | 'weekly'
      | 'monthly'
      | 'alltime';

    // Validate period
    if (!['weekly', 'monthly', 'alltime'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Must be weekly, monthly, or alltime' },
        { status: 400 }
      );
    }

    const cacheKey = `leaderboard_${period}`;
    const now = Date.now();

    // Check cache
    if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
      const cachedData = cache[cacheKey].data;

      // Get current user's rank (not cached, as it's user-specific)
      const userRank = await getUserRank(session.user.id, period);

      return NextResponse.json({
        ...cachedData,
        userRank,
        cached: true,
      });
    }

    // Fetch fresh data
    const leaderboard = await getLeaderboard(period, 100);
    const userRank = await getUserRank(session.user.id, period);

    // Update cache
    cache[cacheKey] = {
      data: { leaderboard, period },
      timestamp: now,
    };

    return NextResponse.json({
      leaderboard,
      period,
      userRank,
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
