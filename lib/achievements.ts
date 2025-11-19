import { prisma } from './prisma';

interface AchievementCondition {
  type: string;
  value: number;
  field?: string;
}

interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  tier: string;
  condition: any;
  createdAt: Date;
}

/**
 * Check if a condition is met based on user stats
 */
async function checkCondition(
  userId: string,
  condition: AchievementCondition
): Promise<boolean> {
  try {
    switch (condition.type) {
      case 'streak': {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { streak: true },
        });
        return (user?.streak || 0) >= condition.value;
      }

      case 'documents': {
        const count = await prisma.document.count({
          where: { userId },
        });
        return count >= condition.value;
      }

      case 'flashcards_reviewed': {
        const count = await prisma.pointsHistory.count({
          where: {
            userId,
            action: 'review_flashcard',
          },
        });
        return count >= condition.value;
      }

      case 'study_sessions': {
        const count = await prisma.studySession.count({
          where: {
            userId,
            endedAt: { not: null },
          },
        });
        return count >= condition.value;
      }

      case 'quizzes_completed': {
        const count = await prisma.quizAttempt.count({
          where: { userId },
        });
        return count >= condition.value;
      }

      case 'notes_created': {
        const count = await prisma.note.count({
          where: { userId },
        });
        return count >= condition.value;
      }

      case 'points': {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { points: true },
        });
        return (user?.points || 0) >= condition.value;
      }

      case 'level': {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { level: true },
        });
        return (user?.level || 1) >= condition.value;
      }

      default:
        console.warn(`Unknown achievement condition type: ${condition.type}`);
        return false;
    }
  } catch (error) {
    console.error('Error checking condition:', error);
    return false;
  }
}

/**
 * Check and award achievements to a user
 * Called after significant actions (upload, review, etc.)
 *
 * @param userId - User ID
 * @param action - Action that triggered the check
 * @param metadata - Optional metadata about the action
 * @returns Array of newly awarded achievements
 */
export async function checkAndAwardAchievements(
  userId: string,
  action: string,
  metadata?: any
): Promise<Achievement[]> {
  try {
    // Get all achievements
    const allAchievements = await prisma.achievement.findMany();

    // Get user's already unlocked achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });

    const unlockedIds = new Set(userAchievements.map((ua: any) => ua.achievementId));
    const newlyAwarded: Achievement[] = [];

    // Check each achievement
    for (const achievement of allAchievements) {
      // Skip if already unlocked
      if (unlockedIds.has(achievement.id)) {
        continue;
      }

      const condition = achievement.condition as AchievementCondition;

      // Check if condition is met
      const conditionMet = await checkCondition(userId, condition);

      if (conditionMet) {
        // Award the achievement
        try {
          // Create user achievement record
          await prisma.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.id,
            },
          });

          // Award points for the achievement
          await prisma.user.update({
            where: { id: userId },
            data: {
              points: {
                increment: achievement.points,
              },
            },
          });

          // Create points history
          await prisma.pointsHistory.create({
            data: {
              userId,
              action: 'achievement_unlocked',
              points: achievement.points,
              metadata: {
                achievementId: achievement.id,
                achievementName: achievement.name,
              },
            },
          });

          // Create notification
          await prisma.notification.create({
            data: {
              userId,
              type: 'achievement_unlocked',
              title: '🏆 Achievement Unlocked!',
              message: `You've unlocked "${achievement.name}" and earned ${achievement.points} points!`,
              link: '/dashboard/achievements',
            },
          });

          newlyAwarded.push(achievement);
        } catch (error) {
          // Handle duplicate achievement (race condition)
          if (
            error instanceof Error &&
            error.message.includes('Unique constraint')
          ) {
            console.log(`Achievement ${achievement.id} already awarded to user ${userId}`);
          } else {
            console.error('Error awarding achievement:', error);
          }
        }
      }
    }

    return newlyAwarded;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}

/**
 * Get achievement progress for a user
 * Shows how close they are to unlocking each achievement
 */
export async function getAchievementProgress(userId: string) {
  try {
    const allAchievements = await prisma.achievement.findMany({
      orderBy: [{ tier: 'asc' }, { points: 'asc' }],
    });

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: {
        unlockedAt: 'desc',
      },
    });

    const unlockedIds = new Set(userAchievements.map((ua: any) => ua.achievementId));

    // Calculate progress for locked achievements
    const achievementsWithProgress = await Promise.all(
      allAchievements.map(async (achievement: any) => {
        const isUnlocked = unlockedIds.has(achievement.id);
        let progress = 0;
        let currentValue = 0;
        let targetValue = 0;

        if (!isUnlocked) {
          const condition = achievement.condition as AchievementCondition;
          targetValue = condition.value;

          // Get current progress
          switch (condition.type) {
            case 'streak': {
              const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { streak: true },
              });
              currentValue = user?.streak || 0;
              break;
            }
            case 'documents': {
              currentValue = await prisma.document.count({
                where: { userId },
              });
              break;
            }
            case 'flashcards_reviewed': {
              currentValue = await prisma.pointsHistory.count({
                where: {
                  userId,
                  action: 'review_flashcard',
                },
              });
              break;
            }
            case 'study_sessions': {
              currentValue = await prisma.studySession.count({
                where: {
                  userId,
                  endedAt: { not: null },
                },
              });
              break;
            }
            case 'quizzes_completed': {
              currentValue = await prisma.quizAttempt.count({
                where: { userId },
              });
              break;
            }
            case 'notes_created': {
              currentValue = await prisma.note.count({
                where: { userId },
              });
              break;
            }
            case 'points': {
              const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { points: true },
              });
              currentValue = user?.points || 0;
              break;
            }
            case 'level': {
              const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { level: true },
              });
              currentValue = user?.level || 1;
              break;
            }
          }

          progress = Math.min(100, (currentValue / targetValue) * 100);
        } else {
          progress = 100;
        }

        const unlockedData = userAchievements.find(
          (ua: any) => ua.achievementId === achievement.id
        );

        return {
          ...achievement,
          unlocked: isUnlocked,
          unlockedAt: unlockedData?.unlockedAt || null,
          progress,
          currentValue,
          targetValue: isUnlocked ? currentValue : targetValue,
        };
      })
    );

    return achievementsWithProgress;
  } catch (error) {
    console.error('Error getting achievement progress:', error);
    throw error;
  }
}
