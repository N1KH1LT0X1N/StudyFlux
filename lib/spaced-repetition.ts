/**
 * SM-2 Spaced Repetition Algorithm
 * Based on SuperMemo 2 algorithm
 * Reference: https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm
 */

export interface SM2Result {
  repetitions: number;
  easinessFactor: number;
  interval: number;
  nextReview: Date;
}

/**
 * Calculate next review parameters using SM-2 algorithm
 * @param quality - Quality of recall (0-5)
 *   0: Complete blackout
 *   1: Incorrect response, but correct one seemed familiar
 *   2: Incorrect response, but correct one seemed easy to recall
 *   3: Correct response, but required significant difficulty
 *   4: Correct response, after some hesitation
 *   5: Perfect response
 * @param repetitions - Number of consecutive correct responses
 * @param easinessFactor - Current easiness factor (default: 2.5)
 * @param interval - Current interval in days (default: 1)
 * @returns Updated SM-2 parameters and next review date
 */
export function calculateNextReview(
  quality: number,
  repetitions: number,
  easinessFactor: number,
  interval: number
): SM2Result {
  // Validate quality rating (0-5)
  if (quality < 0 || quality > 5) {
    throw new Error("Quality must be between 0 and 5");
  }

  let newRepetitions = repetitions;
  let newEasinessFactor = easinessFactor;
  let newInterval = interval;

  // Calculate new easiness factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  newEasinessFactor =
    easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Ensure easiness factor doesn't go below minimum (1.3)
  if (newEasinessFactor < 1.3) {
    newEasinessFactor = 1.3;
  }

  // If quality < 3, the answer was incorrect or too difficult
  // Reset repetitions and interval
  if (quality < 3) {
    newRepetitions = 0;
    newInterval = 1;
  } else {
    // Correct response, increment repetitions
    newRepetitions = repetitions + 1;

    // Calculate new interval based on repetitions
    if (newRepetitions === 1) {
      newInterval = 1; // First repetition: 1 day
    } else if (newRepetitions === 2) {
      newInterval = 6; // Second repetition: 6 days
    } else {
      // Subsequent repetitions: previous interval * easiness factor
      newInterval = Math.round(interval * newEasinessFactor);
    }
  }

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    repetitions: newRepetitions,
    easinessFactor: newEasinessFactor,
    interval: newInterval,
    nextReview,
  };
}

/**
 * Check if a flashcard is due for review
 * @param nextReview - Next review date
 * @returns True if the flashcard is due for review
 */
export function isDueForReview(nextReview: Date): boolean {
  return new Date() >= nextReview;
}

/**
 * Get the difficulty label based on interval
 * @param interval - Interval in days
 * @returns Difficulty label
 */
export function getDifficultyLabel(interval: number): string {
  if (interval <= 1) return "New";
  if (interval <= 7) return "Learning";
  if (interval <= 30) return "Young";
  return "Mature";
}

/**
 * Calculate retention rate based on easiness factor
 * @param easinessFactor - Current easiness factor
 * @returns Estimated retention rate as percentage
 */
export function estimateRetentionRate(easinessFactor: number): number {
  // Simple estimation: higher EF = higher retention
  // EF ranges from 1.3 to ~2.5+
  // Map to 50% - 95% retention rate
  const minEF = 1.3;
  const maxEF = 2.5;
  const minRetention = 50;
  const maxRetention = 95;

  const normalizedEF = Math.min(Math.max(easinessFactor, minEF), maxEF);
  const retention =
    minRetention +
    ((normalizedEF - minEF) / (maxEF - minEF)) * (maxRetention - minRetention);

  return Math.round(retention);
}
