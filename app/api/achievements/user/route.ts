import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/achievements/user
 * List user's unlocked achievements
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userAchievements = await prisma.userAchievement.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        achievement: true,
      },
      orderBy: {
        unlockedAt: 'desc',
      },
    });

    return NextResponse.json({
      achievements: userAchievements,
      count: userAchievements.length,
    });
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user achievements' },
      { status: 500 }
    );
  }
}
