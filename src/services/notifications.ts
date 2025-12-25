import * as Notifications from 'expo-notifications';
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

                    // Haftalık tekrarlayan bildirim kur
                    // item.day: 0: Pazar, 1: Pazartesi...
                    // Expo Notifications'ta weekday 1 (Pazar) - 7 (Cumartesi) arasındadır.
                    // Bizim sistemimizde 0: Pazar, 1: Pazartesi -> Expo weekday = item.day + 1
                    const triggerDay = item.day + 1;

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
                        } as any, // Use any to bypass version-specific type issues if any, though it should follow CalendarTriggerInput
                    });
                }
            }
        }
    },

    async cancelAllNotifications() {
        await Notifications.cancelAllScheduledNotificationsAsync();
    },
};
