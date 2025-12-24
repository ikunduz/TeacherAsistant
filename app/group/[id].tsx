import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, User, Users } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../src/constants/Colors';
import { useData } from '../../src/context/DataContext';

export default function GroupDetailScreen() {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { groups, students, lessons, settings, teacher } = useData();

    const themeColor = teacher?.themeColor || Colors.primary;
    const groupId = Array.isArray(id) ? id[0] : id;
    const group = groups.find(g => g.id === groupId);

    if (!group) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ChevronLeft size={24} color={Colors.iosBlue} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('groupDetail.title')}</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.center}>
                    <Text style={{ color: Colors.textMuted }}>{t('common.noData')}</Text>
                </View>
            </View>
        );
    }

    const groupStudents = students.filter(s => group.studentIds.includes(s.id));
    const totalBalance = groupStudents.reduce((sum, s) => sum + s.balance, 0);

    const groupLessons = lessons
        .filter(l => l.groupId === groupId)
        .filter((v, i, a) => a.findIndex(t => t.date === v.date) === i)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';

    return (
        <View style={styles.container}>
            {/* iOS-style Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={Colors.iosBlue} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('groupDetail.title')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Group Info Card */}
                <View style={styles.card}>
                    <View style={styles.groupHeader}>
                        <View style={[styles.groupIcon, { backgroundColor: themeColor + '15' }]}>
                            <Users size={28} color={themeColor} />
                        </View>
                        <View style={styles.groupInfo}>
                            <Text style={styles.groupName}>{group.name}</Text>
                            <Text style={styles.groupSub}>{t('attendance.studentsCount', { count: groupStudents.length })}</Text>
                        </View>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.balanceRow}>
                        <Text style={styles.balanceLabel}>{t('groupDetail.totalBalance')}</Text>
                        <Text style={[styles.balanceValue, { color: totalBalance > 0 ? Colors.error : Colors.success }]}>
                            {totalBalance} {settings.currency}
                        </Text>
                    </View>
                </View>

                {/* Members */}
                <Text style={styles.sectionHeader}>{t('groupDetail.members').toUpperCase()}</Text>
                <View style={styles.card}>
                    {groupStudents.length === 0 ? (
                        <View style={styles.emptyRow}>
                            <Text style={styles.emptyText}>{t('groupDetail.noMembers')}</Text>
                        </View>
                    ) : (
                        groupStudents.map((student, index) => (
                            <View key={student.id}>
                                <TouchableOpacity
                                    style={styles.studentRow}
                                    onPress={() => router.push(`/student/${student.id}`)}
                                >
                                    <View style={styles.studentInfo}>
                                        <View style={[styles.studentAvatar, { backgroundColor: themeColor + '15' }]}>
                                            <User size={18} color={themeColor} />
                                        </View>
                                        <View>
                                            <Text style={styles.studentName}>{student.fullName}</Text>
                                            <Text style={styles.studentGrade}>{student.grade}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.studentRight}>
                                        <Text style={[styles.studentBalance, { color: student.balance > 0 ? Colors.error : Colors.success }]}>
                                            {student.balance} {settings.currency}
                                        </Text>
                                        <ChevronRight size={18} color={Colors.textMuted} />
                                    </View>
                                </TouchableOpacity>
                                {index < groupStudents.length - 1 && <View style={styles.separator} />}
                            </View>
                        ))
                    )}
                </View>

                {/* Lesson History */}
                <Text style={styles.sectionHeader}>{t('groupDetail.history').toUpperCase()}</Text>
                <View style={styles.card}>
                    {groupLessons.length === 0 ? (
                        <View style={styles.emptyRow}>
                            <Text style={styles.emptyText}>{t('groupDetail.noHistory')}</Text>
                        </View>
                    ) : (
                        groupLessons.map((lesson, index) => (
                            <View key={lesson.id}>
                                <View style={styles.lessonRow}>
                                    <Text style={styles.lessonDate}>
                                        {new Date(lesson.date).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </Text>
                                    <Text style={styles.lessonTopic}>{lesson.topic || t('attendance.generalLesson')}</Text>
                                </View>
                                {index < groupLessons.length - 1 && <View style={styles.separator} />}
                            </View>
                        ))
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.iosBg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 12,
        backgroundColor: Colors.iosBg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.iosSeparator,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: Colors.text,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 16,
    },

    // Card
    card: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },

    // Group Header
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 14,
    },
    groupIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    groupInfo: {
        flex: 1,
    },
    groupName: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text,
    },
    groupSub: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: Colors.iosSeparator,
        marginLeft: 16,
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    balanceLabel: {
        fontSize: 15,
        color: Colors.textSecondary,
    },
    balanceValue: {
        fontSize: 20,
        fontWeight: '700',
    },

    // Section Header
    sectionHeader: {
        fontSize: 13,
        fontWeight: '400',
        color: '#6D6D72',
        marginHorizontal: 4,
        marginBottom: 8,
        marginTop: 24,
        letterSpacing: 0.5,
    },

    // Student Row
    studentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
    },
    studentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    studentAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    studentName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    studentGrade: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    studentRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    studentBalance: {
        fontSize: 15,
        fontWeight: '600',
    },

    // Lesson Row
    lessonRow: {
        padding: 14,
    },
    lessonDate: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text,
    },
    lessonTopic: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 4,
    },

    // Empty
    emptyRow: {
        padding: 24,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.textMuted,
        fontStyle: 'italic',
    },
});
