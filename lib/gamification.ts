import { prisma } from './prisma';
import { POINTS_PER_LEVEL } from './constants';
import { checkAndAwardAchievements } from './achievements';

/**
 * Calculate level from total points
 * @param points - Total points
 * @returns Current level
 */
export function calculateLevel(points: number): number {
  return Math.floor(points / POINTS_PER_LEVEL) + 1;
}

/**
 * Get points needed for next level
 * @param currentPoints - Current total points
 * @returns Points needed to reach next level
 */
export function getPointsForNextLevel(currentPoints: number): number {
  const currentLevel = calculateLevel(currentPoints);
  const pointsForNextLevel = currentLevel * POINTS_PER_LEVEL;
  return pointsForNextLevel - currentPoints;
}

/**
 * Get progress percentage to next level
 * @param currentPoints - Current total points
 * @returns Progress percentage (0-100)
 */
export function getLevelProgress(currentPoints: number): number {
  const currentLevel = calculateLevel(currentPoints);
  const pointsInCurrentLevel = currentPoints - (currentLevel - 1) * POINTS_PER_LEVEL;
  const progress = (pointsInCurrentLevel / POINTS_PER_LEVEL) * 100;
  return Math.min(100, Math.max(0, progress));
}

/**
 * Central function to award points to a user
 * Awards points, updates level, creates history entry, checks achievements
 *
 * @param userId - User ID
 * @param action - Action that earned points (e.g., "upload_document")
 * @param points - Points to award
 * @param metadata - Optional metadata about the action
 */
export async function awardPoints(
  userId: string,
  action: string,
  points: number,
  metadata?: any
): Promise<{
  newPoints: number;
  newLevel: number;
  leveledUp: boolean;
  pointsAwarded: number;
}> {
  try {
    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true, level: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const oldLevel = user.level;
    const newPoints = user.points + points;
    const newLevel = calculateLevel(newPoints);
    const leveledUp = newLevel > oldLevel;

    // Update user in a transaction
    await prisma.$transaction([
      // Update user points, level, and lastActiveAt
      prisma.user.update({
        where: { id: userId },
        data: {
          points: newPoints,
          level: newLevel,
          lastActiveAt: new Date(),
        },
      }),
      // Create points history entry
      prisma.pointsHistory.create({
        data: {
          userId,
          action,
          points,
          metadata: metadata || {},
        },
      }),
    ]);

    // If user leveled up, create a notification
    if (leveledUp) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'level_up',
          title: '🎉 Level Up!',
          message: `Congratulations! You've reached level ${newLevel}!`,
          link: '/dashboard/progress',
        },
      });
    }

    // Check for achievements (don't await to avoid blocking)
    checkAndAwardAchievements(userId, action, metadata).catch((error) => {
      console.error('Error checking achievements:', error);
    });

    return {
      newPoints,
      newLevel,
      leveledUp,
      pointsAwarded: points,
    };
  } catch (error) {
    console.error('Error awarding points:', error);
    throw error;
  }
}

/**
 * Get user gamification stats
 * @param userId - User ID
 * @returns User stats including points, level, streak, etc.
 */
export async function getUserStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      points: true,
      level: true,
      streak: true,
      lastActiveAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    points: user.points,
    level: user.level,
    streak: user.streak,
    lastActiveAt: user.lastActiveAt,
    pointsForNextLevel: getPointsForNextLevel(user.points),
    levelProgress: getLevelProgress(user.points),
  };
}
