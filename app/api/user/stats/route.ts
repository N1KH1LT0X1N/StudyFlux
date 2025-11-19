import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserStats } from '@/lib/gamification';

/**
 * GET /api/user/stats
 * Get user's gamification stats (points, level, streak, etc.)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getUserStats(session.user.id);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
