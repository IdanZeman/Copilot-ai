// Usage tracking system for design generations
import { db, auth, doc, setDoc, getDoc, collection, query, where, getDocs, serverTimestamp, addDoc } from './firebase-config.js';
import { showInfoNotification, showErrorNotification, showWarningNotification } from './notifications.js';

console.log('Usage tracker loaded successfully');

// Usage limits configuration
const USAGE_LIMITS = {
    HOURLY: 3,
    DAILY: 10
};

// Check if user can generate a design
export async function checkUsageLimit() {
    const user = auth.currentUser;
    if (!user) {
        console.log('No authenticated user found');
        showErrorNotification('שגיאה', 'אנא התחבר למערכת כדי לעצב');
        return false;
    }

    console.log('Checking usage limits for user:', user.uid);

    try {
        // Get user's usage document
        const userUsageRef = doc(db, 'usage', user.uid);
        const userUsageDoc = await getDoc(userUsageRef);
        
        if (!userUsageDoc.exists()) {
            console.log('No usage document found, allowing first use');
            return true;
        }

        const data = userUsageDoc.data();
        console.log('Checking usage against data:', data);

        // Get current date and hour for keys
        const now = new Date();
        const todayKey = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const currentHourKey = `${todayKey}_${now.getHours().toString().padStart(2, '0')}`; // YYYY-MM-DD_HH

        // Get usage from the maps
        const dailyUsageMap = data.dailyUsage || {};
        const hourlyUsageMap = data.hourlyUsage || {};
        
        const dailyUsed = dailyUsageMap[todayKey] || 0;
        const hourlyUsed = hourlyUsageMap[currentHourKey] || 0;

        console.log(`Current usage - Daily: ${dailyUsed}/${USAGE_LIMITS.DAILY}, Hourly: ${hourlyUsed}/${USAGE_LIMITS.HOURLY}`);

        // Check limits
        if (hourlyUsed >= USAGE_LIMITS.HOURLY) {
            showWarningNotification(`הגעת למגבלת השעתית של ${USAGE_LIMITS.HOURLY} עיצובים. אנא נסה שוב בעוד שעה.`);
            return false;
        }

        if (dailyUsed >= USAGE_LIMITS.DAILY) {
            showWarningNotification(`הגעת למגבלת היומית של ${USAGE_LIMITS.DAILY} עיצובים. אנא נסה שוב מחר.`);
            return false;
        }

        console.log('Usage check passed');
        return true;
    } catch (error) {
        console.error('Error checking usage limit:', error);
        showErrorNotification('שגיאה', 'בעיה בבדיקת מגבלות השימוש');
        return false;
    }
}

// Record a new design generation
export async function recordUsage() {
    const user = auth.currentUser;
    if (!user) {
        console.log('No authenticated user found for recording usage');
        return;
    }

    console.log('Recording usage for user:', user.uid);

    try {
        const now = new Date();
        const todayKey = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const currentHourKey = `${todayKey}_${now.getHours().toString().padStart(2, '0')}`; // YYYY-MM-DD_HH

        console.log(`Recording usage for day: ${todayKey}, hour: ${currentHourKey}`);

        // Get current usage document
        const userUsageRef = doc(db, 'usage', user.uid);
        const userUsageDoc = await getDoc(userUsageRef);
        
        let currentData = {};
        if (userUsageDoc.exists()) {
            currentData = userUsageDoc.data();
        }

        // Update the usage maps
        const dailyUsageMap = currentData.dailyUsage || {};
        const hourlyUsageMap = currentData.hourlyUsage || {};
        
        // Increment counters
        dailyUsageMap[todayKey] = (dailyUsageMap[todayKey] || 0) + 1;
        hourlyUsageMap[currentHourKey] = (hourlyUsageMap[currentHourKey] || 0) + 1;
        const totalUsage = (currentData.totalUsage || 0) + 1;

        // Update the document
        await setDoc(userUsageRef, {
            dailyUsage: dailyUsageMap,
            hourlyUsage: hourlyUsageMap,
            totalUsage: totalUsage,
            lastUpdate: serverTimestamp(),
            createdAt: currentData.createdAt || serverTimestamp()
        }, { merge: true });

        console.log(`Usage recorded - Daily: ${dailyUsageMap[todayKey]}, Hourly: ${hourlyUsageMap[currentHourKey]}, Total: ${totalUsage}`);
        
        // Update usage display if function exists
        if (window.updateUsageBadge) {
            window.updateUsageBadge();
        }

    } catch (error) {
        console.error('Error recording usage:', error);
    }
}

// Get current usage statistics
export async function getUsageStats() {
    const user = auth.currentUser;
    if (!user) return null;

    try {
        console.log('Getting usage stats for user:', user.uid);

        // Get user's usage document
        const userUsageRef = doc(db, 'usage', user.uid);
        const userUsageDoc = await getDoc(userUsageRef);
        
        if (!userUsageDoc.exists()) {
            console.log('No usage document found, returning fresh limits');
            return {
                hourly: {
                    used: 0,
                    limit: USAGE_LIMITS.HOURLY,
                    remaining: USAGE_LIMITS.HOURLY
                },
                daily: {
                    used: 0,
                    limit: USAGE_LIMITS.DAILY,
                    remaining: USAGE_LIMITS.DAILY
                },
                total: 0
            };
        }

        const data = userUsageDoc.data();
        console.log('Usage document data:', data);

        // Get current date and hour for keys
        const now = new Date();
        const todayKey = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const currentHourKey = `${todayKey}_${now.getHours().toString().padStart(2, '0')}`; // YYYY-MM-DD_HH

        console.log(`Current time keys - Today: ${todayKey}, Hour: ${currentHourKey}`);

        // Get usage from the maps
        const dailyUsageMap = data.dailyUsage || {};
        const hourlyUsageMap = data.hourlyUsage || {};
        
        const dailyUsed = dailyUsageMap[todayKey] || 0;
        const hourlyUsed = hourlyUsageMap[currentHourKey] || 0;
        const totalUsage = data.totalUsage || 0;

        console.log(`Usage found - Daily: ${dailyUsed}, Hourly: ${hourlyUsed} (for hour ${currentHourKey}), Total: ${totalUsage}`);
        console.log('Available hourly keys:', Object.keys(hourlyUsageMap));
        console.log('Available daily keys:', Object.keys(dailyUsageMap));

        return {
            hourly: {
                used: hourlyUsed,
                limit: USAGE_LIMITS.HOURLY,
                remaining: Math.max(0, USAGE_LIMITS.HOURLY - hourlyUsed)
            },
            daily: {
                used: dailyUsed,
                limit: USAGE_LIMITS.DAILY,
                remaining: Math.max(0, USAGE_LIMITS.DAILY - dailyUsed)
            },
            total: totalUsage
        };

    } catch (error) {
        console.error('Error getting usage stats:', error);
        return null;
    }
}

// Show usage information in a beautiful popup
export async function showUsageInfo() {
    const stats = await getUsageStats();
    if (!stats) {
        showErrorNotification('שגיאה', 'לא ניתן לטעון נתוני השימוש');
        return;
    }

    // Get additional info for better display
    const user = auth.currentUser;
    if (!user) return;

    try {
        const userUsageRef = doc(db, 'usage', user.uid);
        const userUsageDoc = await getDoc(userUsageRef);
        const data = userUsageDoc.data() || {};
        
        const now = new Date();
        const todayKey = now.toISOString().split('T')[0];
        const currentHour = now.getHours();
        
        // Get usage for last few hours
        const hourlyUsageMap = data.hourlyUsage || {};
        let recentHoursInfo = '';
        
        for (let h = currentHour - 2; h <= currentHour + 1; h++) {
            if (h >= 0 && h <= 23) {
                const hourKey = `${todayKey}_${h.toString().padStart(2, '0')}`;
                const usage = hourlyUsageMap[hourKey] || 0;
                const timeLabel = h === currentHour ? `${h}:00 (עכשיו)` : 
                                h === currentHour - 1 ? `${h}:00 (שעה קודמת)` : `${h}:00`;
                const bgColor = usage > 0 ? 'rgba(39, 174, 96, 0.3)' : 'rgba(255,255,255,0.1)';
                const textColor = usage > 0 ? '#ffffff' : '#ffffff';
                recentHoursInfo += `<div style="margin: 8px 0; padding: 10px; background: ${bgColor}; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);">
                    <strong style="color: ${textColor}; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">${timeLabel}:</strong> 
                    <span style="color: ${textColor}; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">${usage}/3 עיצובים</span>
                </div>`;
            }
        }

        const message = `
            <div style="text-align: right; line-height: 1.6; font-weight: 500;">
                <div style="margin-bottom: 15px; text-align: center;">
                    <strong style="color: #ffffff; font-size: 16px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">📊 סטטיסטיקת השימוש</strong>
                </div>
                
                <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.2);">
                    <div style="color: #ffffff; font-weight: bold; font-size: 14px; text-shadow: 1px 1px 3px rgba(0,0,0,0.8);">⏰ שעה נוכחית (${currentHour}:00):</div>
                    <div style="font-size: 16px; font-weight: bold; color: #ffffff; text-shadow: 1px 1px 3px rgba(0,0,0,0.8);">${stats.hourly.used}/${stats.hourly.limit} עיצובים</div>
                    <div style="color: #ffffff; font-size: 13px; font-weight: 500; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">נותרו: <strong>${stats.hourly.remaining}</strong></div>
                </div>
                
                <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.2);">
                    <div style="color: #ffffff; font-weight: bold; font-size: 14px; text-shadow: 1px 1px 3px rgba(0,0,0,0.8);">� שימוש היום:</div>
                    <div style="font-size: 16px; font-weight: bold; color: #ffffff; text-shadow: 1px 1px 3px rgba(0,0,0,0.8);">${stats.daily.used}/${stats.daily.limit} עיצובים</div>
                    <div style="color: #ffffff; font-size: 13px; font-weight: 500; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">נותרו: <strong>${stats.daily.remaining}</strong></div>
                </div>
                
                <div style="background: rgba(39, 174, 96, 0.4); padding: 12px; border-radius: 8px; border: 2px solid rgba(39, 174, 96, 0.6);">
                    <div style="color: #ffffff; font-weight: bold; font-size: 14px; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); text-align: center;">🎯 סה"כ עיצובים: <span style="font-size: 18px;">${stats.total}</span></div>
                </div>
            </div>
        `;

        showInfoNotification('נתוני השימוש שלך', message);
        
    } catch (error) {
        console.error('Error showing detailed usage info:', error);
        // Fallback to simple display
        const fallbackMessage = `
            <div style="text-align: right; line-height: 1.6;">
                <div style="margin-bottom: 15px;">
                    <strong style="color: #ffffff;">📊 סטטיסטיקת השימוש שלך</strong>
                </div>
                
                <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; margin-bottom: 10px;">
                    <div style="color: #3498db; font-weight: bold;">⏰ שימוש בשעה הנוכחית:</div>
                    <div>${stats.hourly.used} מתוך ${stats.hourly.limit} עיצובים</div>
                    <div style="color: #ecf0f1; font-size: 14px;">נותרו: ${stats.hourly.remaining} עיצובים</div>
                </div>
                
                <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; margin-bottom: 10px;">
                    <div style="color: #3498db; font-weight: bold;">📅 שימוש היום:</div>
                    <div>${stats.daily.used} מתוך ${stats.daily.limit} עיצובים</div>
                    <div style="color: #ecf0f1; font-size: 14px;">נותרו: ${stats.daily.remaining} עיצובים</div>
                </div>
                
                <div style="background: rgba(39, 174, 96, 0.2); padding: 10px; border-radius: 8px;">
                    <div style="color: #27ae60; font-weight: bold;">🎯 סה"כ עיצובים שיצרת:</div>
                    <div style="font-size: 18px; font-weight: bold; color: #ffffff;">${stats.total}</div>
                </div>
            </div>
        `;

        showInfoNotification('נתוני השימוש שלך', fallbackMessage);
    }
}
