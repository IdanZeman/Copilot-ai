// Usage Tracker Service - Manages API generation limits
import { auth, db } from './firebase-config';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  Timestamp 
} from 'firebase/firestore';

class UsageTracker {
  constructor() {
    this.HOURLY_LIMIT = parseInt(import.meta.env.VITE_HOURLY_GENERATION_LIMIT || '3');
    this.DAILY_LIMIT = parseInt(import.meta.env.VITE_DAILY_GENERATION_LIMIT || '10');
  }

  /**
   * Check if user can generate a new image
   * @returns {Promise<{canGenerate: boolean, reason?: string, hoursUntilReset?: number, nextReset?: Date}>}
   */
  async canUserGenerate() {
    try {
      if (!auth.currentUser) {
        return { canGenerate: false, reason: 'לא מחובר' };
      }

      const userId = auth.currentUser.uid;
      const now = new Date();
      const userUsageRef = doc(db, 'usage', userId);
      const userUsageDoc = await getDoc(userUsageRef);

      if (!userUsageDoc.exists()) {
        // First time user - create usage document
        await this.initializeUserUsage(userId);
        return { canGenerate: true };
      }

      const usage = userUsageDoc.data();
      const hourlyCount = this.getHourlyCount(usage, now);
      const dailyCount = this.getDailyCount(usage, now);

      // Check hourly limit
      if (hourlyCount >= this.HOURLY_LIMIT) {
        const nextHourlyReset = this.getNextHourlyReset(usage, now);
        const hoursUntilReset = Math.ceil((nextHourlyReset - now) / (1000 * 60 * 60));
        return {
          canGenerate: false,
          reason: `הגעת למגבלה השעתית (${this.HOURLY_LIMIT} גנרוטים בשעה)`,
          hoursUntilReset,
          nextReset: nextHourlyReset
        };
      }

      // Check daily limit
      if (dailyCount >= this.DAILY_LIMIT) {
        const nextDailyReset = this.getNextDailyReset(usage, now);
        return {
          canGenerate: false,
          reason: `הגעת למגבלה היומית (${this.DAILY_LIMIT} גנרוטים ליום)`,
          nextReset: nextDailyReset
        };
      }

      return { canGenerate: true };
    } catch (error) {
      console.error('Error checking usage limits:', error);
      // In case of error, allow generation but log the issue
      return { canGenerate: true };
    }
  }

  /**
   * Record a new image generation
   * @returns {Promise<void>}
   */
  async recordGeneration() {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const userId = auth.currentUser.uid;
      const now = new Date();
      const userUsageRef = doc(db, 'usage', userId);
      const userUsageDoc = await getDoc(userUsageRef);

      if (!userUsageDoc.exists()) {
        await this.initializeUserUsage(userId);
      }

      // Add the new generation to the arrays
      await updateDoc(userUsageRef, {
        generations: [...(userUsageDoc.data()?.generations || []), {
          timestamp: Timestamp.fromDate(now),
          success: true
        }],
        lastUpdated: Timestamp.fromDate(now)
      });
    } catch (error) {
      console.error('Error recording generation:', error);
      throw error;
    }
  }

  /**
   * Get user's current usage stats
   * @returns {Promise<{hourlyCount: number, dailyCount: number, hourlyLimit: number, dailyLimit: number}>}
   */
  async getUserUsageStats() {
    try {
      if (!auth.currentUser) {
        return {
          hourlyCount: 0,
          dailyCount: 0,
          hourlyLimit: this.HOURLY_LIMIT,
          dailyLimit: this.DAILY_LIMIT
        };
      }

      const userId = auth.currentUser.uid;
      const userUsageRef = doc(db, 'usage', userId);
      const userUsageDoc = await getDoc(userUsageRef);

      if (!userUsageDoc.exists()) {
        return {
          hourlyCount: 0,
          dailyCount: 0,
          hourlyLimit: this.HOURLY_LIMIT,
          dailyLimit: this.DAILY_LIMIT
        };
      }

      const usage = userUsageDoc.data();
      const now = new Date();

      return {
        hourlyCount: this.getHourlyCount(usage, now),
        dailyCount: this.getDailyCount(usage, now),
        hourlyLimit: this.HOURLY_LIMIT,
        dailyLimit: this.DAILY_LIMIT
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return {
        hourlyCount: 0,
        dailyCount: 0,
        hourlyLimit: this.HOURLY_LIMIT,
        dailyLimit: this.DAILY_LIMIT
      };
    }
  }

  // Private helper methods
  async initializeUserUsage(userId) {
    const userUsageRef = doc(db, 'usage', userId);
    await setDoc(userUsageRef, {
      userId,
      generations: [],
      createdAt: Timestamp.fromDate(new Date()),
      lastUpdated: Timestamp.fromDate(new Date())
    });
  }

  getHourlyCount(usage, now) {
    if (!usage.generations) return 0;
    
    const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));
    return usage.generations.filter(gen => {
      const genTime = gen.timestamp.toDate();
      return genTime > oneHourAgo;
    }).length;
  }

  getDailyCount(usage, now) {
    if (!usage.generations) return 0;
    
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    return usage.generations.filter(gen => {
      const genTime = gen.timestamp.toDate();
      return genTime > oneDayAgo;
    }).length;
  }

  getNextHourlyReset(usage, now) {
    if (!usage.generations || usage.generations.length === 0) {
      return new Date(now.getTime() + (60 * 60 * 1000));
    }

    // Find the oldest generation in the current hour
    const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));
    const recentGenerations = usage.generations
      .filter(gen => gen.timestamp.toDate() > oneHourAgo)
      .sort((a, b) => a.timestamp.toDate() - b.timestamp.toDate());

    if (recentGenerations.length === 0) {
      return new Date(now.getTime() + (60 * 60 * 1000));
    }

    // Next reset is one hour after the oldest recent generation
    const oldestRecent = recentGenerations[0].timestamp.toDate();
    return new Date(oldestRecent.getTime() + (60 * 60 * 1000));
  }

  getNextDailyReset(usage, now) {
    if (!usage.generations || usage.generations.length === 0) {
      return new Date(now.getTime() + (24 * 60 * 60 * 1000));
    }

    // Find the oldest generation in the current day
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const recentGenerations = usage.generations
      .filter(gen => gen.timestamp.toDate() > oneDayAgo)
      .sort((a, b) => a.timestamp.toDate() - b.timestamp.toDate());

    if (recentGenerations.length === 0) {
      return new Date(now.getTime() + (24 * 60 * 60 * 1000));
    }

    // Next reset is 24 hours after the oldest recent generation
    const oldestRecent = recentGenerations[0].timestamp.toDate();
    return new Date(oldestRecent.getTime() + (24 * 60 * 60 * 1000));
  }
}

export const usageTracker = new UsageTracker();
export default usageTracker;
