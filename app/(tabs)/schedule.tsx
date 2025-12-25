import { useRouter } from 'expo-router';
import { ChevronLeft, Lock, Share2 } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Dimensions, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../src/constants/Colors';
import { useData } from '../../src/context/DataContext';

// 08:00 - 23:00 (15 saat) + Header ve Footer için yer hesabı
const START_HOUR = 8;
const END_HOUR = 23; // 22:00 dahil -> 23 slotu bitişi
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_SHORTS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

// Ekran boyutlarına göre dinamik hesaplama
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = 100; // Üst başlık alanı
const TAB_BAR_HEIGHT = 85; // Alt menü payı
const CHART_PADDING = 12;
const AVAILABLE_HEIGHT = SCREEN_HEIGHT - HEADER_HEIGHT - TAB_BAR_HEIGHT - 60; // 60px güvenlik payı

// Hücre boyut hesabı
const HOUR_COL_WIDTH = 32;
const CELL_GAP = 3;
const COLS = 7;
const CELL_WIDTH = (SCREEN_WIDTH - HOUR_COL_WIDTH - (CHART_PADDING * 2) - ((COLS - 1) * CELL_GAP)) / COLS;
const ROWS = HOURS.length;
const CELL_HEIGHT = Math.min((AVAILABLE_HEIGHT - 30) / ROWS, 40); // Max 40px yükseklik

interface BlockedSlot {
    day: number;
    hour: number;
}

interface LessonSlot {
    day: number;
    hour: number;
    studentName: string;
    studentId: string;
}

export default function ScheduleScreen() {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const { students, settings, teacher, updateSettings } = useData();
    const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>(settings.blockedSlots || []);

    const themeColor = teacher?.themeColor || Colors.primary;
    const isEnglish = i18n.language === 'en';
    const dayLabels = isEnglish ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : DAY_SHORTS;

    const lessonSlots = useMemo<LessonSlot[]>(() => {
        const slots: LessonSlot[] = [];
        students.forEach(student => {
            if (student.schedule && student.schedule.length > 0) {
                student.schedule.forEach(sch => {
                    const hour = parseInt(sch.time.split(':')[0], 10);
                    const dayIndex = sch.day === 0 ? 6 : sch.day - 1;
                    slots.push({
                        day: dayIndex,
                        hour,
                        studentName: student.fullName,
                        studentId: student.id,
                    });
                });
            }
        });
        return slots;
    }, [students]);

    const isBlocked = (day: number, hour: number) => {
        return blockedSlots.some(s => s.day === day && s.hour === hour);
    };

    const hasLesson = (day: number, hour: number) => {
        return lessonSlots.find(s => s.day === day && s.hour === hour);
    };

    const toggleBlock = async (day: number, hour: number) => {
        const lesson = hasLesson(day, hour);
        if (lesson) {
            router.push(`/student/${lesson.studentId}` as any);
            return;
        }

        let newBlocked: BlockedSlot[];
        if (isBlocked(day, hour)) {
            newBlocked = blockedSlots.filter(s => !(s.day === day && s.hour === hour));
        } else {
            newBlocked = [...blockedSlots, { day, hour }];
        }
        setBlockedSlots(newBlocked);
        await updateSettings({ ...settings, blockedSlots: newBlocked });
    };

    const handleShare = () => {
        const availableSlots: { day: number; hour: number }[] = [];
        DAYS.forEach((_, dayIndex) => {
            HOURS.forEach(hour => {
                if (!isBlocked(dayIndex, hour) && !hasLesson(dayIndex, hour)) {
                    availableSlots.push({ day: dayIndex, hour });
                }
            });
        });

        if (availableSlots.length === 0) {
            Alert.alert(t('common.error'), t('schedule.noAvailableSlots'));
            return;
        }

        let message = `${t('schedule.shareMessage')}\n`;
        let currentDay = -1;

        availableSlots.forEach(slot => {
            if (slot.day !== currentDay) {
                message += `\n*${t(`students.${DAYS[slot.day]}`)}*:\n`;
                currentDay = slot.day;
            }
            message += `• ${String(slot.hour).padStart(2, '0')}:00 - ${String(slot.hour + 1).padStart(2, '0')}:00\n`;
        });

        const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
        Linking.openURL(url).catch(() => Alert.alert(t('common.error'), 'WhatsApp error'));
    };

    const getCellStyle = (day: number, hour: number) => {
        const lesson = hasLesson(day, hour);
        if (lesson) {
            return {
                backgroundColor: themeColor,
                borderWidth: 0,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 1
            };
        }
        if (isBlocked(day, hour)) {
            return {
                backgroundColor: Colors.errorLight,
                borderWidth: 1,
                borderColor: 'transparent'
            };
        }
        return {
            backgroundColor: '#F3F4F6', // Default cell color (iosBg alternative)
            borderWidth: 0,
        };
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={Colors.iosBlue} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('schedule.title')}</Text>
                <TouchableOpacity onPress={handleShare} style={[styles.shareButton, { backgroundColor: themeColor + '15' }]}>
                    <Share2 size={20} color={themeColor} />
                </TouchableOpacity>
            </View>

            {/* Main Content Area - Full Screen Grid */}
            <View style={styles.chartContainer}>

                {/* Day Headers */}
                <View style={styles.headerRow}>
                    <View style={styles.hourHeaderPlaceholder} />
                    {dayLabels.map((day, i) => (
                        <View key={i} style={styles.dayHeaderCell}>
                            <Text style={styles.dayHeaderText}>{day}</Text>
                        </View>
                    ))}
                </View>

                {/* Grid */}
                <View style={styles.grid}>
                    {HOURS.map((hour, rowIndex) => (
                        <View key={hour} style={[styles.row, { marginBottom: rowIndex === ROWS - 1 ? 0 : CELL_GAP }]}>
                            {/* Hour Label */}
                            <View style={styles.hourLabelCell}>
                                <Text style={styles.hourText}>{hour}</Text>
                                <Text style={styles.hourSubText}>00</Text>
                            </View>

                            {/* Cells */}
                            {DAYS.map((_, dayIndex) => {
                                const lesson = hasLesson(dayIndex, hour);
                                return (
                                    <TouchableOpacity
                                        key={dayIndex}
                                        style={[styles.cell, getCellStyle(dayIndex, hour)]}
                                        onPress={() => toggleBlock(dayIndex, hour)}
                                        activeOpacity={0.7}
                                    >
                                        {lesson ? (
                                            <Text style={styles.lessonText}>
                                                {lesson.studentName.charAt(0).toUpperCase()}
                                            </Text>
                                        ) : isBlocked(dayIndex, hour) ? (
                                            <Lock size={12} color={Colors.error} />
                                        ) : null}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))}
                </View>

                {/* Legend Bottom */}
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: themeColor }]} />
                        <Text style={styles.legendText}>{t('schedule.lesson')}</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: Colors.errorLight }]} />
                        <Text style={styles.legendText}>{t('schedule.blocked')}</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' }]} />
                        <Text style={styles.legendText}>{t('schedule.available')}</Text>
                    </View>
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 12,
        backgroundColor: '#FFFFFF',
        zIndex: 10,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: Colors.text,
    },
    shareButton: {
        padding: 8,
        borderRadius: 8,
    },
    chartContainer: {
        flex: 1,
        paddingHorizontal: CHART_PADDING,
        paddingTop: 4,
    },
    headerRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    hourHeaderPlaceholder: {
        width: HOUR_COL_WIDTH,
    },
    dayHeaderCell: {
        width: CELL_WIDTH,
        alignItems: 'center',
        marginRight: CELL_GAP,
    },
    dayHeaderText: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.textSecondary,
        textTransform: 'uppercase',
    },
    grid: {
        flexDirection: 'column',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    hourLabelCell: {
        width: HOUR_COL_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 1,
    },
    hourText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textMuted,
    },
    hourSubText: {
        fontSize: 9,
        fontWeight: '400',
        color: Colors.textMuted,
        marginTop: 2,
    },
    cell: {
        width: CELL_WIDTH,
        height: CELL_HEIGHT,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: CELL_GAP,
    },
    lessonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '800',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginTop: 12,
        alignItems: 'center',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 11,
        color: Colors.textSecondary,
    },
});
