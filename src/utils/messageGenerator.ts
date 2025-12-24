import { Lesson, Student } from '../types';

export const generateReportMessage = (student: Student, allLessons: Lesson[], t: any, currency: string, defaultLink?: string) => {
    // 1. Find student lessons and sort NEWEST to OLDEST
    const studentLessons = allLessons
        .filter(l => l.studentId === student.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const latestLesson = studentLessons[0];
    const meetingLink = student.customMeetingLink || defaultLink;
    const isOnline = latestLesson?.lessonType === 'Online';

    let unpaidLessons: Lesson[] = [];

    if (student.balance > 0) {
        let collectedAmount = 0;
        for (const lesson of studentLessons) {
            if (collectedAmount < student.balance) {
                unpaidLessons.push(lesson);
                collectedAmount += lesson.fee || 0;
            } else {
                break;
            }
        }
    } else {
        unpaidLessons = studentLessons.slice(0, 1);
    }

    const topicsStr = unpaidLessons.length > 0
        ? unpaidLessons.map(l => `- ${new Date(l.date).toLocaleDateString()}: ${l.topic || t('attendance.whatsapp.topicReview')} (${l.fee} ${currency})`).join('\n')
        : t('common.noData');

    let headerText = "";
    let balanceText = "";

    if (student.balance > 0) {
        headerText = t('attendance.whatsapp.headerUnpaid');
        balanceText = t('attendance.whatsapp.totalPending', { amount: student.balance, currency });
    } else {
        headerText = t('attendance.whatsapp.headerPaid');
        balanceText = student.balance === 0
            ? t('attendance.whatsapp.noBalance')
            : t('attendance.whatsapp.extraBalance', { amount: Math.abs(student.balance), currency });
    }

    const linkText = (isOnline && meetingLink) ? `\n\n${t('students.meetingLink')}: ${meetingLink}` : "";

    return `${t('attendance.whatsapp.summary', { name: student.fullName })}\n\n${headerText}\n${topicsStr}\n\n${balanceText}${linkText}\n\n${t('attendance.whatsapp.footer')}`;
};
