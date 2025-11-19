import { prisma } from './prisma';
import { POINTS } from './constants';

/**
 * Check if two dates are the same day (UTC)
 */
function isSameDay(date1: Date, date2: Date): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
}

/**
 * Check if date1 is yesterday compared to date2 (UTC)
 */
function isYesterday(date1: Date, date2: Date): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const yesterday = new Date(d2);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return isSameDay(d1, yesterday);
}

/**
 * Update user's daily streak
 * Call this on every user activity
 *
 * @param userId - User ID
 * @returns New streak count
 */
export async function updateStreak(userId: string): Promise<number> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        streak: true,
        lastActiveAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const now = new Date();
    const lastActive = user.lastActiveAt;
    let newStreak = user.streak;
    let streakBonusPoints = 0;
    let streakMilestone: number | null = null;

    // Check streak status
    if (isSameDay(lastActive, now)) {
      // Same day - no change to streak, just update lastActiveAt
      await prisma.user.update({
        where: { id: userId },
        data: { lastActiveAt: now },
      });
      return newStreak;
    } else if (isYesterday(lastActive, now)) {
      // Yesterday - increment streak
      newStreak = user.streak + 1;
    } else {
      // More than 1 day ago - reset streak
      newStreak = 1;
    }

    // Check for streak milestones and award bonus points
    if (newStreak === 7) {
      streakBonusPoints = POINTS.STREAK_BONUS_7;
      streakMilestone = 7;
    } else if (newStreak === 30) {
      streakBonusPoints = POINTS.STREAK_BONUS_30;
      streakMilestone = 30;
    } else if (newStreak === 100) {
      streakBonusPoints = POINTS.STREAK_BONUS_100;
      streakMilestone = 100;
    }

    // Update user streak and lastActiveAt
    const updateData: any = {
      streak: newStreak,
      lastActiveAt: now,
    };

    // If there's a streak bonus, add points
    if (streakBonusPoints > 0) {
      updateData.points = {
        increment: streakBonusPoints,
      };
    }

    // Update in transaction
    const operations: any[] = [
      prisma.user.update({
        where: { id: userId },
        data: updateData,
      }),
    ];

    // Create points history for streak bonus
    if (streakBonusPoints > 0) {
      operations.push(
        prisma.pointsHistory.create({
          data: {
            userId,
            action: `streak_bonus_${streakMilestone}`,
            points: streakBonusPoints,
            metadata: {
              streak: newStreak,
              milestone: streakMilestone,
            },
          },
        })
      );

      // Create notification for streak milestone
      operations.push(
        prisma.notification.create({
          data: {
            userId,
            type: 'streak_milestone',
            title: `🔥 ${newStreak}-Day Streak!`,
            message: `Amazing! You've maintained a ${newStreak}-day streak and earned ${streakBonusPoints} bonus points!`,
            link: '/dashboard/progress',
          },
        })
      );
    }

    await prisma.$transaction(operations);

    return newStreak;
  } catch (error) {
    console.error('Error updating streak:', error);
    throw error;
  }
}

/**
 * Check if user's streak is at risk (hasn't been active today)
 * @param userId - User ID
 * @returns true if streak is at risk
 */
export async function isStreakAtRisk(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastActiveAt: true, streak: true },
  });

  if (!user || user.streak === 0) {
    return false;
  }

  const now = new Date();
  const lastActive = user.lastActiveAt;

  // If last active was yesterday and it's been more than 20 hours, streak is at risk
  if (isYesterday(lastActive, now)) {
    const hoursSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
    return hoursSinceActive >= 20;
  }

  // If last active was before yesterday, streak is already broken
  return !isSameDay(lastActive, now) && !isYesterday(lastActive, now);
}

/**
 * Send streak risk notification to users
 * This should be called by a cron job daily
 */
export async function sendStreakRiskNotifications(): Promise<void> {
  try {
    // Get users with active streaks
    const users = await prisma.user.findMany({
      where: {
        streak: { gt: 0 },
      },
      select: {
        id: true,
        streak: true,
        lastActiveAt: true,
      },
    });

    const now = new Date();

    for (const user of users) {
      const atRisk = await isStreakAtRisk(user.id);

      if (atRisk) {
        // Check if we've already sent a notification today
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: user.id,
            type: 'streak_risk',
            createdAt: {
              gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            },
          },
        });

        if (!existingNotification) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              type: 'streak_risk',
              title: '⚠️ Streak at Risk!',
              message: `Your ${user.streak}-day streak is at risk! Log in today to keep it going.`,
              link: '/dashboard',
            },
          });
        }
      }
    }
  } catch (error) {
    console.error('Error sending streak risk notifications:', error);
  }
}
