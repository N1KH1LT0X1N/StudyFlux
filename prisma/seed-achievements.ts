import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const achievements = [
  {
    key: 'first_upload',
    name: 'First Upload',
    description: 'Upload your first document',
    icon: '📄',
    points: 10,
    tier: 'bronze',
    condition: {
      type: 'documents',
      value: 1,
    },
  },
  {
    key: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    points: 50,
    tier: 'silver',
    condition: {
      type: 'streak',
      value: 7,
    },
  },
  {
    key: 'month_master',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: '🌟',
    points: 200,
    tier: 'gold',
    condition: {
      type: 'streak',
      value: 30,
    },
  },
  {
    key: 'century_streak',
    name: 'Century Streak',
    description: 'Maintain a 100-day streak',
    icon: '💯',
    points: 1000,
    tier: 'platinum',
    condition: {
      type: 'streak',
      value: 100,
    },
  },
  {
    key: 'bookworm',
    name: 'Bookworm',
    description: 'Upload 10 documents',
    icon: '📚',
    points: 50,
    tier: 'silver',
    condition: {
      type: 'documents',
      value: 10,
    },
  },
  {
    key: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    description: 'Upload 25 documents',
    icon: '🎓',
    points: 100,
    tier: 'gold',
    condition: {
      type: 'documents',
      value: 25,
    },
  },
  {
    key: 'library_builder',
    name: 'Library Builder',
    description: 'Upload 50 documents',
    icon: '🏛️',
    points: 250,
    tier: 'platinum',
    condition: {
      type: 'documents',
      value: 50,
    },
  },
  {
    key: 'flash_beginner',
    name: 'Flash Beginner',
    description: 'Review 10 flashcards',
    icon: '⚡',
    points: 20,
    tier: 'bronze',
    condition: {
      type: 'flashcards_reviewed',
      value: 10,
    },
  },
  {
    key: 'flash_master',
    name: 'Flash Master',
    description: 'Review 100 flashcards',
    icon: '💫',
    points: 50,
    tier: 'silver',
    condition: {
      type: 'flashcards_reviewed',
      value: 100,
    },
  },
  {
    key: 'flash_legend',
    name: 'Flash Legend',
    description: 'Review 500 flashcards',
    icon: '✨',
    points: 200,
    tier: 'gold',
    condition: {
      type: 'flashcards_reviewed',
      value: 500,
    },
  },
  {
    key: 'study_champion',
    name: 'Study Champion',
    description: 'Complete 10 study sessions',
    icon: '🏆',
    points: 150,
    tier: 'gold',
    condition: {
      type: 'study_sessions',
      value: 10,
    },
  },
  {
    key: 'study_legend',
    name: 'Study Legend',
    description: 'Complete 50 study sessions',
    icon: '👑',
    points: 500,
    tier: 'platinum',
    condition: {
      type: 'study_sessions',
      value: 50,
    },
  },
  {
    key: 'quiz_master',
    name: 'Quiz Master',
    description: 'Complete 10 quizzes',
    icon: '🎯',
    points: 100,
    tier: 'gold',
    condition: {
      type: 'quizzes_completed',
      value: 10,
    },
  },
  {
    key: 'note_taker',
    name: 'Note Taker',
    description: 'Create 50 notes',
    icon: '📝',
    points: 50,
    tier: 'silver',
    condition: {
      type: 'notes_created',
      value: 50,
    },
  },
  {
    key: 'point_collector',
    name: 'Point Collector',
    description: 'Earn 1000 points',
    icon: '💰',
    points: 100,
    tier: 'gold',
    condition: {
      type: 'points',
      value: 1000,
    },
  },
  {
    key: 'point_master',
    name: 'Point Master',
    description: 'Earn 5000 points',
    icon: '💎',
    points: 500,
    tier: 'platinum',
    condition: {
      type: 'points',
      value: 5000,
    },
  },
  {
    key: 'level_10',
    name: 'Rising Star',
    description: 'Reach level 10',
    icon: '⭐',
    points: 100,
    tier: 'silver',
    condition: {
      type: 'level',
      value: 10,
    },
  },
  {
    key: 'level_25',
    name: 'Expert Learner',
    description: 'Reach level 25',
    icon: '🌠',
    points: 250,
    tier: 'gold',
    condition: {
      type: 'level',
      value: 25,
    },
  },
  {
    key: 'level_50',
    name: 'Master Scholar',
    description: 'Reach level 50',
    icon: '🎖️',
    points: 500,
    tier: 'platinum',
    condition: {
      type: 'level',
      value: 50,
    },
  },
];

async function main() {
  console.log('Seeding achievements...');

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: achievement,
      create: achievement,
    });
  }

  console.log(`Seeded ${achievements.length} achievements`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
