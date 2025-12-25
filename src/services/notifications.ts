import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Student } from '../types';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// Belirli bir gün ve saate kadar kalan saniyeyi hesapla
function getSecondsUntilNextOccurrence(targetDay: number, targetHour: number, targetMinute: number): number {
    const now = new Date();
    const currentDay = now.getDay(); // 0: Pazar, 1: Pazartesi...

    let daysUntil = targetDay - currentDay;
    if (daysUntil < 0) {
        daysUntil += 7;
    }

    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + daysUntil);
    targetDate.setHours(targetHour, targetMinute, 0, 0);

    // Eğer bugün ve saat geçtiyse, gelecek haftaya al
    if (targetDate <= now) {
        targetDate.setDate(targetDate.getDate() + 7);
    }

    return Math.floor((targetDate.getTime() - now.getTime()) / 1000);
}

export const NotificationService = {
    async requestPermissions() {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        return finalStatus === 'granted';
    },

    async scheduleLessonNotifications(students: Student[], t: (key: string) => string) {
        // Önce tüm mevcut bildirimleri temizle
        await Notifications.cancelAllScheduledNotificationsAsync();

        for (const student of students) {
            if (student.schedule && student.schedule.length > 0) {
                for (const item of student.schedule) {
                    const [hour, minute] = item.time.split(':').map(Number);

                    // Ders vaktinden 15 dakika öncesini hesapla
                    let notifyHour = hour;
                    let notifyMinute = minute - 15;

                    if (notifyMinute < 0) {
                        notifyMinute += 60;
                        notifyHour -= 1;
                    }

                    if (notifyHour < 0) {
                        notifyHour += 24;
                    }

                    try {
                        // Android için: Belirli bir tarihe kadar saniye cinsinden bekle
                        // iOS için: Calendar trigger kullan
                        if (Platform.OS === 'android') {
                            const seconds = getSecondsUntilNextOccurrence(item.day, notifyHour, notifyMinute);

                            if (seconds > 0) {
                                await Notifications.scheduleNotificationAsync({
                                    content: {
                                        title: t('notifications.lessonTitle') || 'Ders Başlıyor!',
                                        body: `${student.fullName} - ${item.time} (${t('notifications.lessonBodyReminder') || '15 dakika kaldı'})`,
                                        data: { studentId: student.id },
                                        sound: true,
                                    },
                                    trigger: {
                                        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                                        seconds: seconds,
                                        repeats: false, // Android'de tekrarlamalı time interval desteklenmiyor, tek seferlik olacak
                                    },
                                });
                            }
                        } else {
                            // iOS için Calendar trigger
                            const triggerDay = item.day === 0 ? 1 : item.day + 1; // iOS weekday: 1=Pazar
                            await Notifications.scheduleNotificationAsync({
                                content: {
                                    title: t('notifications.lessonTitle') || 'Ders Başlıyor!',
                                    body: `${student.fullName} - ${item.time} (${t('notifications.lessonBodyReminder') || '15 dakika kaldı'})`,
                                    data: { studentId: student.id },
                                    sound: true,
                                },
                                trigger: {
                                    type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                                    weekday: triggerDay,
                                    hour: notifyHour,
                                    minute: notifyMinute,
                                    repeats: true,
                                } as any,
                            });
                        }
                    } catch (error) {
                        // Bildirim zamanlanamadıysa sessizce devam et
                        console.warn('Bildirim zamanlanamadı:', error);
                    }
                }
            }
        }
    },

    async cancelAllNotifications() {
        await Notifications.cancelAllScheduledNotificationsAsync();
    },
};
