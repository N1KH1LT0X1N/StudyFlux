import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAchievementProgress } from '@/lib/achievements';

/**
 * GET /api/achievements
 * List all achievements with user's unlock status and progress
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const achievements = await getAchievementProgress(session.user.id);

    return NextResponse.json({
      achievements,
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}
