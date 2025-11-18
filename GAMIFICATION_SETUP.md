# StudyFlux Gamification System Setup Guide

## Phase 4 Implementation Complete

This guide will help you set up and use the gamification system (achievements, leaderboard, streaks, etc.).

## Prerequisites

- Database must be set up and running
- All dependencies installed (`npm install`)

## Setup Steps

### 1. Seed Achievement Data

Run the achievement seeder to populate the database with all available achievements:

```bash
npx ts-node prisma/seed-achievements.ts
```

This will create 19 achievements across 4 tiers (bronze, silver, gold, platinum):

**Streak Achievements:**
- First Upload (bronze, 10 pts) - Upload first document
- Week Warrior (silver, 50 pts) - 7-day streak
- Month Master (gold, 200 pts) - 30-day streak
- Century Streak (platinum, 1000 pts) - 100-day streak

**Document Achievements:**
- Bookworm (silver, 50 pts) - Upload 10 documents
- Knowledge Seeker (gold, 100 pts) - Upload 25 documents
- Library Builder (platinum, 250 pts) - Upload 50 documents

**Flashcard Achievements:**
- Flash Beginner (bronze, 20 pts) - Review 10 flashcards
- Flash Master (silver, 50 pts) - Review 100 flashcards
- Flash Legend (gold, 200 pts) - Review 500 flashcards

**Study Session Achievements:**
- Study Champion (gold, 150 pts) - Complete 10 study sessions
- Study Legend (platinum, 500 pts) - Complete 50 study sessions

**Quiz Achievements:**
- Quiz Master (gold, 100 pts) - Complete 10 quizzes

**Notes Achievements:**
- Note Taker (silver, 50 pts) - Create 50 notes

**Points Achievements:**
- Point Collector (gold, 100 pts) - Earn 1000 points
- Point Master (platinum, 500 pts) - Earn 5000 points

**Level Achievements:**
- Rising Star (silver, 100 pts) - Reach level 10
- Expert Learner (gold, 250 pts) - Reach level 25
- Master Scholar (platinum, 500 pts) - Reach level 50

### 2. Access New Features

After seeding, users can access:

- **Achievements Page**: `/dashboard/achievements`
  - View all achievements (locked and unlocked)
  - Filter by status (all, unlocked, locked)
  - Track progress toward locked achievements

- **Leaderboard Page**: `/dashboard/leaderboard`
  - View top 100 users
  - Filter by period (weekly, monthly, all-time)
  - See your rank

- **Notifications**: Bell icon in header
  - Achievement unlocked notifications
  - Level up notifications
  - Streak milestone notifications
  - Streak at-risk warnings

## How the System Works

### Points System

Users earn points by:
- Uploading documents: 10 points
- Generating summaries: 5 points
- Reviewing flashcards: 1-5 points (based on quality)
- Creating notes: 5 points
- Completing study sessions: 20 points per hour
- Completing quizzes: 10 points

### Level System

- Each level requires 100 points
- Level 1: 0-99 points
- Level 2: 100-199 points
- Level 3: 200-299 points
- And so on...

### Streak System

- Daily activity is tracked
- Streak increments if you're active each day
- Streak resets if you miss a day
- Bonus points awarded at milestones:
  - 7-day streak: 50 bonus points
  - 30-day streak: 200 bonus points
  - 100-day streak: 1000 bonus points

### Achievements

- Automatically awarded when conditions are met
- Award bonus points when unlocked
- Create notifications when unlocked
- Progress tracked for locked achievements

### Leaderboard

- Weekly: Based on points earned in last 7 days
- Monthly: Based on points earned in last 30 days
- All-time: Based on total points
- Cached for 1 minute to prevent spam
- Shows top 100 users
- Displays user's rank even if not in top 100

## API Endpoints

### Achievements
- `GET /api/achievements` - List all achievements with unlock status
- `GET /api/achievements/user` - List user's unlocked achievements

### Leaderboard
- `GET /api/leaderboard?period=weekly|monthly|alltime` - Get leaderboard

### Notifications
- `GET /api/notifications?limit=20&unread=true` - List notifications
- `PATCH /api/notifications` - Mark as read
- `DELETE /api/notifications?id=<id>` - Delete notification

### User Stats
- `GET /api/user/stats` - Get user's gamification stats

## Components

### Gamification Components
- `AchievementCard` - Display achievement with progress
- `AchievementUnlock` - Toast notification for unlocking
- `LevelBadge` - Display level and XP progress
- `StreakDisplay` - Display daily streak with milestones

### Leaderboard Components
- `LeaderboardTable` - Table of rankings
- `PodiumDisplay` - Visual podium for top 3
- `NotificationBell` - Notification dropdown in header

## Library Functions

### `/lib/gamification.ts`
- `calculateLevel(points)` - Calculate level from points
- `getPointsForNextLevel(points)` - Points needed for next level
- `getLevelProgress(points)` - Progress % to next level
- `awardPoints(userId, action, points, metadata)` - Award points (central function)
- `getUserStats(userId)` - Get user gamification stats

### `/lib/streak.ts`
- `updateStreak(userId)` - Update daily streak (call on every activity)
- `isStreakAtRisk(userId)` - Check if streak is at risk
- `sendStreakRiskNotifications()` - Send notifications (cron job)

### `/lib/achievements.ts`
- `checkAndAwardAchievements(userId, action, metadata)` - Check and award achievements
- `getAchievementProgress(userId)` - Get all achievements with progress

### `/lib/leaderboard.ts`
- `getLeaderboard(period, limit)` - Get leaderboard entries
- `getUserRank(userId, period)` - Get user's rank
- `isUserInTop10(userId)` - Check if user is in top 10

## Integration

All existing API routes have been updated to use the gamification system:

1. **Document Upload** (`/api/upload`)
   - Awards points using `awardPoints()`
   - Updates streak using `updateStreak()`

2. **Summary Generation** (`/api/documents/[id]/summary`)
   - Awards points for completing summary
   - Updates streak

3. **Flashcard Review** (`/api/flashcards/[id]/review`)
   - Awards points based on review quality
   - Updates streak
   - Checks for achievements

4. **Note Creation** (`/api/notes`)
   - Awards points for creating notes
   - Updates streak

5. **Study Session Completion** (`/api/study-sessions/[id]`)
   - Awards points based on duration
   - Updates streak
   - Checks for achievements

## Cron Jobs (Optional)

Set up a cron job to run daily:

```bash
# Send streak risk notifications daily at 8 PM
0 20 * * * curl http://your-domain/api/cron/streak-notifications
```

You'll need to create `/api/cron/streak-notifications/route.ts` that calls `sendStreakRiskNotifications()`.

## Testing

1. **Test Achievement Unlocking**:
   - Upload a document → Should unlock "First Upload"
   - Upload 10 documents → Should unlock "Bookworm"
   - Review flashcards → Progress toward flashcard achievements

2. **Test Streak System**:
   - Perform any activity daily
   - Check streak increments
   - Miss a day → Streak resets

3. **Test Leaderboard**:
   - Earn points
   - Check your rank updates
   - View weekly/monthly/all-time rankings

4. **Test Notifications**:
   - Unlock achievement → Check notification
   - Level up → Check notification
   - Reach streak milestone → Check notification

## Troubleshooting

**Achievements not unlocking?**
- Check that seed script ran successfully
- Verify achievement conditions in database
- Check server logs for errors

**Streak not updating?**
- Ensure `updateStreak()` is called on user activities
- Check user's `lastActiveAt` field in database
- Verify timezone handling (uses UTC)

**Leaderboard not showing data?**
- Ensure users have earned points
- Check cache (wait 1 minute for refresh)
- Verify database queries return data

## Next Steps

Future enhancements (not implemented in Phase 4):
- Social features (follow/unfollow)
- Deck sharing
- Real-time leaderboard updates
- Email notifications
- Streak freeze (premium feature)
- Custom achievement creation
- Team/group leaderboards
