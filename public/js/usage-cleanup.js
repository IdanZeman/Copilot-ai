// Usage cleanup service - removes old usage data to prevent database bloat
import { db, collection, getDocs, doc, updateDoc, deleteDoc } from './firebase-config.js';

console.log('Usage cleanup service loaded');

// Configuration
const CLEANUP_CONFIG = {
    // Keep data for 7 days
    RETENTION_DAYS: 7,
    // Run cleanup when user logs in (every session)
    AUTO_CLEANUP: true
};

// Clean up old usage data for a specific user
export async function cleanupUserUsageData(userId) {
    if (!userId) {
        console.log('No user ID provided for cleanup');
        return;
    }

    console.log('Starting usage cleanup for user:', userId);

    try {
        const userUsageRef = doc(db, 'usage', userId);
        const userUsageDoc = await getDocs(collection(db, 'usage'));
        
        // Get the specific user document
        const userDoc = userUsageDoc.docs.find(doc => doc.id === userId);
        
        if (!userDoc || !userDoc.exists()) {
            console.log('No usage document found for user');
            return;
        }

        const data = userDoc.data();
        const dailyUsageMap = data.dailyUsage || {};
        const hourlyUsageMap = data.hourlyUsage || {};

        // Calculate cutoff date (7 days ago)
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_CONFIG.RETENTION_DAYS);
        const cutoffDateString = cutoffDate.toISOString().split('T')[0]; // YYYY-MM-DD

        console.log(`Cleaning data older than: ${cutoffDateString}`);

        // Clean daily usage data
        const cleanedDailyUsage = {};
        let dailyKeysRemoved = 0;
        
        Object.keys(dailyUsageMap).forEach(dateKey => {
            if (dateKey >= cutoffDateString) {
                cleanedDailyUsage[dateKey] = dailyUsageMap[dateKey];
            } else {
                dailyKeysRemoved++;
            }
        });

        // Clean hourly usage data
        const cleanedHourlyUsage = {};
        let hourlyKeysRemoved = 0;
        
        Object.keys(hourlyUsageMap).forEach(hourKey => {
            // Extract date from hour key (format: YYYY-MM-DD_HH)
            const dateFromHour = hourKey.split('_')[0];
            if (dateFromHour >= cutoffDateString) {
                cleanedHourlyUsage[hourKey] = hourlyUsageMap[hourKey];
            } else {
                hourlyKeysRemoved++;
            }
        });

        // Update the document only if there's something to clean
        if (dailyKeysRemoved > 0 || hourlyKeysRemoved > 0) {
            await updateDoc(userUsageRef, {
                dailyUsage: cleanedDailyUsage,
                hourlyUsage: cleanedHourlyUsage,
                lastCleanup: new Date(),
                cleanupStats: {
                    lastCleanupDate: new Date().toISOString(),
                    dailyKeysRemoved: dailyKeysRemoved,
                    hourlyKeysRemoved: hourlyKeysRemoved
                }
            });

            console.log(`Cleanup completed - Removed ${dailyKeysRemoved} daily keys and ${hourlyKeysRemoved} hourly keys`);
        } else {
            console.log('No old data to cleanup');
        }

    } catch (error) {
        console.error('Error during cleanup:', error);
    }
}

// Clean up old usage data for all users (admin function)
export async function cleanupAllUsageData() {
    console.log('Starting cleanup for all users');

    try {
        const usageSnapshot = await getDocs(collection(db, 'usage'));
        let totalUsersProcessed = 0;
        let totalKeysRemoved = 0;

        for (const userDoc of usageSnapshot.docs) {
            const userId = userDoc.id;
            const data = userDoc.data();
            
            if (!data.dailyUsage && !data.hourlyUsage) {
                continue; // Skip users with no usage data
            }

            const dailyUsageMap = data.dailyUsage || {};
            const hourlyUsageMap = data.hourlyUsage || {};

            // Calculate cutoff date
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_CONFIG.RETENTION_DAYS);
            const cutoffDateString = cutoffDate.toISOString().split('T')[0];

            // Clean daily usage data
            const cleanedDailyUsage = {};
            let dailyKeysRemoved = 0;
            
            Object.keys(dailyUsageMap).forEach(dateKey => {
                if (dateKey >= cutoffDateString) {
                    cleanedDailyUsage[dateKey] = dailyUsageMap[dateKey];
                } else {
                    dailyKeysRemoved++;
                }
            });

            // Clean hourly usage data
            const cleanedHourlyUsage = {};
            let hourlyKeysRemoved = 0;
            
            Object.keys(hourlyUsageMap).forEach(hourKey => {
                const dateFromHour = hourKey.split('_')[0];
                if (dateFromHour >= cutoffDateString) {
                    cleanedHourlyUsage[hourKey] = hourlyUsageMap[hourKey];
                } else {
                    hourlyKeysRemoved++;
                }
            });

            // Update if needed
            if (dailyKeysRemoved > 0 || hourlyKeysRemoved > 0) {
                await updateDoc(doc(db, 'usage', userId), {
                    dailyUsage: cleanedDailyUsage,
                    hourlyUsage: cleanedHourlyUsage,
                    lastCleanup: new Date()
                });

                totalKeysRemoved += dailyKeysRemoved + hourlyKeysRemoved;
            }

            totalUsersProcessed++;
        }

        console.log(`Global cleanup completed - Processed ${totalUsersProcessed} users, removed ${totalKeysRemoved} old keys`);

    } catch (error) {
        console.error('Error during global cleanup:', error);
    }
}

// Auto-cleanup when user logs in (if enabled)
export async function autoCleanupOnLogin(userId) {
    if (!CLEANUP_CONFIG.AUTO_CLEANUP || !userId) {
        return;
    }

    try {
        // Check if cleanup was done recently (within last 24 hours)
        const userUsageRef = doc(db, 'usage', userId);
        const userUsageDoc = await getDocs(collection(db, 'usage'));
        const userDoc = userUsageDoc.docs.find(doc => doc.id === userId);
        
        if (userDoc && userDoc.exists()) {
            const data = userDoc.data();
            const lastCleanup = data.lastCleanup;
            
            if (lastCleanup) {
                const lastCleanupDate = lastCleanup.toDate ? lastCleanup.toDate() : new Date(lastCleanup);
                const hoursSinceCleanup = (new Date() - lastCleanupDate) / (1000 * 60 * 60);
                
                if (hoursSinceCleanup < 24) {
                    console.log('Cleanup was done recently, skipping auto-cleanup');
                    return;
                }
            }
        }

        // Perform cleanup
        await cleanupUserUsageData(userId);
        
    } catch (error) {
        console.error('Error during auto-cleanup:', error);
    }
}

// Get cleanup statistics
export async function getCleanupStats(userId) {
    if (!userId) return null;

    try {
        const userUsageRef = doc(db, 'usage', userId);
        const userUsageDoc = await getDocs(collection(db, 'usage'));
        const userDoc = userUsageDoc.docs.find(doc => doc.id === userId);
        
        if (!userDoc || !userDoc.exists()) {
            return null;
        }

        const data = userDoc.data();
        return {
            lastCleanup: data.lastCleanup,
            cleanupStats: data.cleanupStats,
            totalDailyKeys: Object.keys(data.dailyUsage || {}).length,
            totalHourlyKeys: Object.keys(data.hourlyUsage || {}).length
        };

    } catch (error) {
        console.error('Error getting cleanup stats:', error);
        return null;
    }
}
