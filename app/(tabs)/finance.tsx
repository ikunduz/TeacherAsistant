import { useRouter } from 'expo-router';
import { BookOpen, Calendar, Crown, Download, Lock, TrendingUp, Users } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Colors, FilterColors } from '../../src/constants/Colors';
import { useData } from '../../src/context/DataContext';
import { useSubscription } from '../../src/context/SubscriptionContext';

type TimeFilter = 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear';

export default function FinanceScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { lessons, payments, settings, teacher, students } = useData();
    const { isPro } = useSubscription();
    const [activeFilter, setActiveFilter] = useState<TimeFilter>('thisMonth');

    const filters: { key: TimeFilter; label: string; colors: { bg: string; text: string } }[] = [
        { key: 'thisMonth', label: t('finance.thisMonth'), colors: FilterColors.thisMonth },
        { key: 'lastMonth', label: t('finance.lastMonth'), colors: FilterColors.lastMonth },
        { key: 'thisQuarter', label: t('finance.quarter'), colors: FilterColors.thisQuarter },
        { key: 'thisYear', label: t('finance.thisYear'), colors: FilterColors.thisYear },
    ];

    // Calculate date ranges based on filter
    const { startDate, previousStartDate, previousEndDate } = useMemo(() => {
        const now = new Date();
        let start: Date;
        let prevStart: Date;
        let prevEnd: Date;

        switch (activeFilter) {
            case 'thisMonth':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'lastMonth':
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                prevStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
                prevEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0);
                break;
            case 'thisQuarter':
                const quarter = Math.floor(now.getMonth() / 3);
                start = new Date(now.getFullYear(), quarter * 3, 1);
                prevStart = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
                prevEnd = new Date(now.getFullYear(), quarter * 3, 0);
                break;
            case 'thisYear':
                start = new Date(now.getFullYear(), 0, 1);
                prevStart = new Date(now.getFullYear() - 1, 0, 1);
                prevEnd = new Date(now.getFullYear() - 1, 11, 31);
                break;
        }
        return { startDate: start, previousStartDate: prevStart, previousEndDate: prevEnd };
    }, [activeFilter]);

    // Calculate net income directly (no tax, no gross)
    const { netIncome } = useMemo(() => {
        const currentPayments = payments.filter(p => new Date(p.date) >= startDate);
        const net = currentPayments.reduce((sum, p) => sum + p.amount, 0);
        return { netIncome: net };
    }, [payments, startDate]);

    // Total lessons in period (FREE)
    const totalLessons = useMemo(() => {
        return lessons.filter(l => new Date(l.date) >= startDate).length;
    }, [lessons, startDate]);

    // Average fee per lesson (FREE)
    const avgFee = useMemo(() => {
        const periodLessons = lessons.filter(l => new Date(l.date) >= startDate);
        if (periodLessons.length === 0) return 0;
        const totalFees = periodLessons.reduce((sum, l) => sum + l.fee, 0);
        return totalFees / periodLessons.length;
    }, [lessons, startDate]);

    // Recent payments (FREE)
    const recentPayments = useMemo(() => {
        return [...payments]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
    }, [payments]);

    // Top earning students (PREMIUM)
    const topStudents = useMemo(() => {
        const earningsMap: Record<string, { name: string; total: number }> = {};
        payments.filter(p => new Date(p.date) >= startDate).forEach(p => {
            if (!earningsMap[p.studentId]) {
                earningsMap[p.studentId] = { name: p.studentName, total: 0 };
            }
            earningsMap[p.studentId].total += p.amount;
        });
        return Object.entries(earningsMap)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 3);
    }, [payments, startDate]);

    // Next month forecast (PREMIUM)
    const forecast = useMemo(() => {
        const monthlyAverages: number[] = [];
        for (let i = 0; i < 3; i++) {
            const monthStart = new Date();
            monthStart.setMonth(monthStart.getMonth() - i - 1);
            monthStart.setDate(1);
            const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
            const monthPayments = payments.filter(p => {
                const d = new Date(p.date);
                return d >= monthStart && d <= monthEnd;
            });
            monthlyAverages.push(monthPayments.reduce((sum, p) => sum + p.amount, 0));
        }
        const avg = monthlyAverages.length > 0 ? monthlyAverages.reduce((a, b) => a + b, 0) / monthlyAverages.length : 0;
        return Math.round(avg);
    }, [payments]);

    // Monthly income trend for last 6 months (for chart)
    const monthlyTrend = useMemo(() => {
        const months: { label: string; value: number }[] = [];
        const now = new Date();
        const monthNames = settings.language === 'tr'
            ? ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
            : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            const monthPayments = payments.filter(p => {
                const d = new Date(p.date);
                return d >= monthStart && d <= monthEnd;
            });
            const total = monthPayments.reduce((sum, p) => sum + p.amount, 0);
            months.push({
                label: monthNames[monthStart.getMonth()],
                value: total
            });
        }
        return months;
    }, [payments, settings.language]);

    const formatCurrency = (amount: number) => {
        const symbol = settings.currency || '₺';
        return `${symbol}${Math.round(amount).toLocaleString('tr-TR')}`;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(settings.language === 'tr' ? 'tr-TR' : 'en-US', {
            day: 'numeric',
            month: 'short'
        });
    };

    const handleExportReport = async () => {
        if (!isPro) {
            router.push('/paywall' as any);
            return;
        }

        const periodLabel = filters.find(f => f.key === activeFilter)?.label || '';
        const language = settings.language || 'tr';

        // Yeni PDF rapor servisi kullan
        const { ReportService } = await import('../../src/services/report');
        await ReportService.generateFinanceReport(
            netIncome,
            netIncome,
            totalLessons,
            avgFee,
            recentPayments,
            settings,
            teacher,
            language,
            periodLabel
        );
    };

    const themeColor = teacher?.themeColor || Colors.primary;

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.brandRow}>
                        <Image
                            source={require('../../assets/images/icon.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.brandText}>CoachPro</Text>
                    </View>
                    <Text style={styles.pageTitle}>{t('finance.title')}</Text>
                </View>

                {/* Filter Tabs */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersContainer}
                >
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter.key}
                            style={[
                                styles.filterTab,
                                { backgroundColor: filter.colors.bg },
                                activeFilter === filter.key && styles.filterTabActive,
                            ]}
                            onPress={() => setActiveFilter(filter.key)}
                        >
                            <Text style={[styles.filterText, { color: filter.colors.text }]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Stats Cards Row 1 - Gross & Net */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>{t('finance.netIncome')}</Text>
                        <Text style={styles.statValue}>{formatCurrency(netIncome)}</Text>

                    </View>
                </View>

                {/* Stats Cards Row 2 - Lessons & Avg Fee (FREE) */}
                <View style={styles.statsRow}>
                    <View style={[styles.statCardSmall, { backgroundColor: Colors.primaryLight }]}>
                        <BookOpen size={20} color={themeColor} />
                        <Text style={styles.statSmallValue}>{totalLessons}</Text>
                        <Text style={styles.statSmallLabel}>{t('finance.totalLessons')}</Text>
                    </View>

                    <View style={[styles.statCardSmall, { backgroundColor: Colors.successLight }]}>
                        <TrendingUp size={20} color={Colors.success} />
                        <Text style={styles.statSmallValue}>{formatCurrency(avgFee)}</Text>
                        <Text style={styles.statSmallLabel}>{t('finance.avgFee')}</Text>
                    </View>
                </View>

                {/* Income Trend Chart */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>{t('finance.incomeTrend') || 'Gelir Trendi'}</Text>
                    <LineChart
                        data={{
                            labels: monthlyTrend.map(m => m.label),
                            datasets: [{
                                data: monthlyTrend.map(m => m.value || 0),
                                color: (opacity = 1) => `rgba(16, 112, 99, ${opacity})`,
                                strokeWidth: 2
                            }]
                        }}
                        width={Dimensions.get('window').width - 64}
                        height={160}
                        chartConfig={{
                            backgroundColor: Colors.card,
                            backgroundGradientFrom: Colors.card,
                            backgroundGradientTo: Colors.card,
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(16, 112, 99, ${opacity})`,
                            labelColor: () => Colors.textSecondary,
                            style: { borderRadius: 12 },
                            propsForDots: {
                                r: '4',
                                strokeWidth: '2',
                                stroke: themeColor
                            },
                            propsForLabels: {
                                fontSize: 10
                            }
                        }}
                        bezier
                        style={{ borderRadius: 12, marginTop: 8 }}
                        withInnerLines={false}
                        withOuterLines={false}
                        withVerticalLabels={true}
                        withHorizontalLabels={true}
                    />
                </View>

                {/* Recent Payments (FREE) */}
                <Text style={styles.sectionHeader}>{t('finance.recentPayments').toUpperCase()}</Text>
                <View style={styles.card}>
                    {recentPayments.length === 0 ? (
                        <Text style={styles.emptyText}>{t('finance.noPayments')}</Text>
                    ) : (
                        recentPayments.map((payment, index) => (
                            <View key={payment.id}>
                                <View style={styles.paymentRow}>
                                    <View style={styles.paymentInfo}>
                                        <Text style={styles.paymentName}>{payment.studentName}</Text>
                                        <Text style={styles.paymentDate}>{formatDate(payment.date)}</Text>
                                    </View>
                                    <Text style={styles.paymentAmount}>+{formatCurrency(payment.amount)}</Text>
                                </View>
                                {index < recentPayments.length - 1 && <View style={styles.separator} />}
                            </View>
                        ))
                    )}
                </View>

                {/* Premium Section */}
                <Text style={styles.sectionHeader}>{t('finance.premiumFeature').toUpperCase()} 💎</Text>

                {/* Top Earning Students (PREMIUM) */}
                <View style={[styles.card, !isPro && styles.cardLocked]}>
                    <View style={styles.premiumHeader}>
                        <Users size={18} color={isPro ? themeColor : Colors.textMuted} />
                        <Text style={[styles.premiumTitle, !isPro && { color: Colors.textMuted }]}>
                            {t('finance.topStudents')}
                        </Text>
                        {!isPro && <Lock size={14} color={Colors.textMuted} />}
                    </View>
                    {isPro ? (
                        topStudents.map((student, index) => (
                            <View key={student.id} style={styles.topStudentRow}>
                                <View style={[styles.rankBadge, { backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32' }]}>
                                    <Text style={styles.rankText}>{index + 1}</Text>
                                </View>
                                <Text style={styles.topStudentName}>{student.name}</Text>
                                <Text style={styles.topStudentAmount}>{formatCurrency(student.total)}</Text>
                            </View>
                        ))
                    ) : (
                        <TouchableOpacity style={styles.unlockButton} onPress={() => router.push('/paywall' as any)}>
                            <Crown size={16} color={Colors.orange} />
                            <Text style={styles.unlockText}>{t('paywall.upgradeNow')}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Forecast (PREMIUM) */}
                <View style={[styles.card, !isPro && styles.cardLocked]}>
                    <View style={styles.premiumHeader}>
                        <Calendar size={18} color={isPro ? themeColor : Colors.textMuted} />
                        <Text style={[styles.premiumTitle, !isPro && { color: Colors.textMuted }]}>
                            {t('finance.forecast')}
                        </Text>
                        {!isPro && <Lock size={14} color={Colors.textMuted} />}
                    </View>
                    {isPro ? (
                        <View style={styles.forecastContent}>
                            <Text style={styles.forecastValue}>{formatCurrency(forecast)}</Text>
                            <Text style={styles.forecastNote}>Son 3 ay ortalamasına göre</Text>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.unlockButton} onPress={() => router.push('/paywall' as any)}>
                            <Crown size={16} color={Colors.orange} />
                            <Text style={styles.unlockText}>{t('paywall.upgradeNow')}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Export Button */}
                <TouchableOpacity
                    style={[styles.exportButton, { backgroundColor: isPro ? themeColor : Colors.textMuted }]}
                    onPress={handleExportReport}
                >
                    <Download size={18} color="#FFF" />
                    <Text style={styles.exportText}>{t('finance.exportReport')}</Text>
                    {!isPro && <Lock size={14} color="#FFF" style={{ marginLeft: 8 }} />}
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        paddingTop: 60,
    },
    header: {
        alignItems: 'center',
        paddingBottom: 24,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    logo: {
        width: 32,
        height: 32,
        borderRadius: 8,
    },
    brandText: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text,
        letterSpacing: -0.5,
    },
    pageTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginTop: 4,
    },
    filtersContainer: {
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 24,
    },
    filterTab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 8,
    },
    filterTabActive: {
        transform: [{ scale: 1.02 }],
    },
    filterText: {
        fontSize: 14,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.card,
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8,
    },
    taxNote: {
        fontSize: 11,
        color: Colors.textMuted,
    },
    changeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    changeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    statCardSmall: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        gap: 8,
    },
    statSmallValue: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text,
    },
    statSmallLabel: {
        fontSize: 11,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '400',
        color: '#6D6D72',
        marginHorizontal: 20,
        marginBottom: 8,
        marginTop: 16,
        letterSpacing: 0.5,
    },
    card: {
        marginHorizontal: 16,
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    cardLocked: {
        opacity: 0.7,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    paymentInfo: {
        flex: 1,
    },
    paymentName: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text,
    },
    paymentDate: {
        fontSize: 12,
        color: Colors.textMuted,
        marginTop: 2,
    },
    paymentAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.success,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: Colors.iosSeparator,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textMuted,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 16,
    },
    premiumHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    premiumTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text,
        flex: 1,
    },
    topStudentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        gap: 12,
    },
    rankBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFF',
    },
    topStudentName: {
        flex: 1,
        fontSize: 14,
        color: Colors.text,
    },
    topStudentAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.success,
    },
    forecastContent: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    forecastValue: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.text,
    },
    forecastNote: {
        fontSize: 12,
        color: Colors.textMuted,
        marginTop: 4,
    },
    unlockButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    unlockText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.orange,
    },
    exportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginTop: 16,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    exportText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    chartCard: {
        backgroundColor: Colors.card,
        borderRadius: 20,
        marginHorizontal: 16,
        marginBottom: 24,
        padding: 16,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
        alignItems: 'center',
    },
    chartTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        alignSelf: 'flex-start',
        marginBottom: 4,
    },
});
