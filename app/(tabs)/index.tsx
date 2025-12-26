import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowRight, Calendar, Check, Plus, Users } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, TagColors } from '../../src/constants/Colors';
import { useData } from '../../src/context/DataContext';
import { PREMIUM_LIMITS, useSubscription } from '../../src/context/SubscriptionContext';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { students, groups, lessons, payments, teacher, settings } = useData();
  const { isPro } = useSubscription();

  // Calculate pending payments (positive balance = student owes money)
  const pendingAmount = useMemo(() => {
    return students.reduce((sum, s) => sum + Math.max(0, s.balance), 0);
  }, [students]);

  const pendingStudentsCount = useMemo(() => {
    return students.filter(s => s.balance > 0).length;
  }, [students]);

  // Calculate this month's income
  const thisMonthIncome = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return payments.reduce((sum, p) => {
      const pDate = new Date(p.date);
      if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
        return sum + p.amount;
      }
      return sum;
    }, 0);
  }, [payments]);

  // Carousel State
  const [activeSlide, setActiveSlide] = useState(0);
  const screenWidth = Dimensions.get('window').width;
  // Subtract padding (24 * 2 = 48) to get card width matching valid space if we want full width, 
  // but usually we want it to fit within the padding. 
  // Inspecting styles: scrollContent has paddingHorizontal: 24.
  // The ScrollView for pages should probably take full width of container minus padding?
  // Or better, let's keep the ScrollView inside the padding.

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setActiveSlide(roundIndex);
  };

  // Today's completed lessons
  const todaysCompletedLessons = useMemo(() => {
    const today = new Date().toDateString();
    return lessons
      .filter(l => new Date(l.date).toDateString() === today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [lessons]);

  // Today's scheduled lessons (from student and group schedules)
  const todaysScheduledLessons = useMemo(() => {
    const todayDayNumber = new Date().getDay(); // 0 = Pazar, 1 = Pazartesi, ..., 4 = Perşembe
    const scheduledItems: {
      id: string;
      name: string;
      time: string;
      image?: string | null;
      type: 'individual' | 'group';
      studentIds?: string[];
    }[] = [];

    // Öğrenci schedule'ları
    students.forEach(student => {
      if (student.schedule && student.schedule.length > 0) {
        student.schedule.forEach(scheduleItem => {
          if (scheduleItem.day === todayDayNumber) {
            // Bu öğrencinin bugün dersi işlenmiş mi kontrol et
            const alreadyCompleted = todaysCompletedLessons.some(
              l => l.studentId === student.id
            );
            if (!alreadyCompleted) {
              scheduledItems.push({
                id: `student-${student.id}`,
                name: student.fullName,
                time: scheduleItem.time,
                image: student.image,
                type: 'individual',
              });
            }
          }
        });
      }
    });

    // Grup schedule'ları
    groups.forEach(group => {
      if (group.schedule && group.schedule.length > 0) {
        group.schedule.forEach(scheduleItem => {
          if (scheduleItem.day === todayDayNumber) {
            // Bu grubun bugün dersi işlenmiş mi kontrol et (grup içindeki herhangi bir öğrenci ile)
            const alreadyCompleted = todaysCompletedLessons.some(
              l => l.groupId === group.id
            );
            if (!alreadyCompleted) {
              scheduledItems.push({
                id: `group-${group.id}`,
                name: group.name,
                time: scheduleItem.time,
                type: 'group',
                studentIds: group.studentIds,
              });
            }
          }
        });
      }
    });

    // Saate göre sırala
    return scheduledItems.sort((a, b) => a.time.localeCompare(b.time));
  }, [students, groups, todaysCompletedLessons]);

  // Format date
  const formattedDate = useMemo(() => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(settings.language === 'tr' ? 'tr-TR' : 'en-US', options);
  }, [settings.language]);

  const themeColor = teacher?.themeColor || Colors.primary;

  const handleNavigation = (route: string) => {
    if (route === '/add-student' && !isPro && students.length >= PREMIUM_LIMITS.FREE_STUDENT_LIMIT) {
      router.push('/paywall' as any);
    } else if (route === '/add-group' && !isPro && groups.length >= PREMIUM_LIMITS.FREE_GROUP_LIMIT) {
      router.push('/paywall' as any);
    } else {
      router.push(route as any);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    // Türkçe = 24 saat formatı, İngilizce = 12 saat AM/PM
    const isTurkish = settings.language === 'tr';
    return date.toLocaleTimeString(isTurkish ? 'tr-TR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !isTurkish
    });
  };

  const getTimelineDotColor = (index: number): string => {
    const dotColors = [Colors.success, Colors.orange, Colors.purple, Colors.cyan, Colors.primary];
    return dotColors[index % dotColors.length];
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.greetingRow}>
              <View>
                <Text style={styles.greeting}>{t('dashboard.hello')}</Text>
                <Text style={styles.userName}>{teacher?.fullName || 'Coach'}</Text>
              </View>
              {isPro && (
                <View style={[styles.proBadge, { backgroundColor: TagColors.pro.bg }]}>
                  <Text style={[styles.proBadgeText, { color: TagColors.pro.text }]}>PRO</Text>
                </View>
              )}
            </View>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            {teacher?.businessLogo ? (
              <Image source={{ uri: teacher.businessLogo }} style={styles.avatar} />
            ) : (
              <Image
                source={require('../../assets/images/icon.png')}
                style={styles.avatar}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Hero Carousel */}
        <View style={{ height: 160, marginBottom: 8 }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            contentContainerStyle={{ paddingRight: 0 }}
          >
            {/* Slide 1: Pending Payment */}
            <View style={{ width: screenWidth - 48, marginRight: 0 }}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push('/(tabs)/finance' as any)}
              >
                <LinearGradient
                  colors={[themeColor, themeColor]}
                  style={styles.heroCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={[styles.patternCircle, { top: -20, right: -20, width: 150, height: 150 }]} />
                  <View style={[styles.patternCircle, { bottom: -40, left: -20, width: 200, height: 200 }]} />

                  <View style={styles.heroContentLeft}>
                    <View style={styles.heroTextContainer}>
                      <Text style={styles.heroLabel}>{t('dashboard.pendingPayment')}</Text>
                      <View style={styles.amountRow}>
                        <Text style={styles.heroCurrency}>{settings.currency}</Text>
                        <Text style={styles.heroAmount}>
                          {Math.round(pendingAmount).toLocaleString('tr-TR')}
                        </Text>
                      </View>
                      <Text style={styles.heroSubtext}>
                        {pendingStudentsCount} {t('students.title').toLowerCase()} • {t('dashboard.pendingPayments').toLowerCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.heroArrow}>
                    <View style={styles.iconContainer}>
                      <ArrowRight size={20} color={themeColor} />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Slide 2: Monthly Income */}
            <View style={{ width: screenWidth - 48 }}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push('/(tabs)/finance' as any)}
              >
                <LinearGradient
                  colors={[Colors.success, Colors.success]}
                  style={styles.heroCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={[styles.patternCircle, { top: -20, right: -20, width: 150, height: 150 }]} />
                  <View style={[styles.patternCircle, { bottom: -40, left: -20, width: 200, height: 200 }]} />

                  <View style={styles.heroContentLeft}>
                    <View style={styles.heroTextContainer}>
                      <Text style={styles.heroLabel}>{t('finance.monthlyReport') || 'Aylık Gelir'}</Text>
                      <View style={styles.amountRow}>
                        <Text style={styles.heroCurrency}>{settings.currency}</Text>
                        <Text style={styles.heroAmount}>
                          {Math.round(thisMonthIncome).toLocaleString('tr-TR')}
                        </Text>
                      </View>
                      <Text style={styles.heroSubtext}>
                        {new Date().toLocaleString(settings.language === 'tr' ? 'tr-TR' : 'en-US', { month: 'long', year: 'numeric' })}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.heroArrow}>
                    <View style={styles.iconContainer}>
                      <ArrowRight size={20} color={Colors.success} />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Pagination Dots */}
        <View style={styles.paginationDots}>
          <View style={[styles.dot, activeSlide === 0 && styles.dotActive]} />
          <View style={[styles.dot, activeSlide === 1 && styles.dotActive]} />
        </View>

        {/* Action Buttons */}
        {/* Ders İşle - Full Width */}
        <TouchableOpacity
          style={[styles.actionButtonFull, { backgroundColor: themeColor }]}
          onPress={() => router.push('/lesson-attendance' as any)}
        >
          <View style={styles.actionIconCircle}>
            <Check size={14} color="#FFF" strokeWidth={3} />
          </View>
          <Text style={styles.actionTextPrimary}>{t('dashboard.startLesson')}</Text>
        </TouchableOpacity>

        {/* Secondary Actions - 3 Column Grid */}
        <View style={styles.actionGrid}>
          {/* Add Student */}
          <TouchableOpacity
            style={[styles.actionButtonSmall, { borderColor: Colors.cyanLight }]}
            onPress={() => handleNavigation('/add-student')}
          >
            <View style={[styles.actionIconOutline, { borderColor: Colors.cyan }]}>
              <Plus size={14} color={Colors.cyan} strokeWidth={3} />
            </View>
            <Text style={styles.actionTextSmall}>{t('students.addStudent')}</Text>
          </TouchableOpacity>

          {/* Add Group */}
          <TouchableOpacity
            style={[styles.actionButtonSmall, { borderColor: Colors.orangeLight }]}
            onPress={() => handleNavigation('/add-group')}
          >
            <Users size={18} color={Colors.orange} />
            <Text style={styles.actionTextSmall}>{t('dashboard.addGroup')}</Text>
          </TouchableOpacity>

          {/* Weekly Schedule */}
          <TouchableOpacity
            style={[styles.actionButtonSmall, { borderColor: Colors.purpleLight }]}
            onPress={() => router.push('/weekly-schedule' as any)}
          >
            <Calendar size={18} color={Colors.purple} />
            <Text style={styles.actionTextSmall}>{t('dashboard.weeklySchedule')}</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Schedule */}
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>{t('dashboard.todaysSchedule')}</Text>

          {todaysScheduledLessons.length === 0 && todaysCompletedLessons.length === 0 ? (
            <View style={styles.emptySchedule}>
              <Text style={styles.emptyText}>{t('dashboard.noLessonsToday')}</Text>
            </View>
          ) : (
            <View style={styles.timeline}>
              {todaysScheduledLessons.map((scheduled, index) => {
                const dotColor = scheduled.type === 'group' ? Colors.orange : getTimelineDotColor(index);
                const isLast = index === todaysScheduledLessons.length - 1 && todaysCompletedLessons.length === 0;

                return (
                  <View key={scheduled.id} style={styles.timelineItem}>
                    {/* Left: Time */}
                    <View style={styles.timeColumn}>
                      <Text style={styles.timeText}>{scheduled.time}</Text>
                    </View>

                    {/* Center: Dot + Line */}
                    <View style={styles.dotColumn}>
                      <View style={[styles.timelineDot, { backgroundColor: dotColor }]} />
                      {!isLast && <View style={styles.timelineLine} />}
                    </View>

                    {/* Right: Card */}
                    <View style={[styles.lessonCard, { borderLeftColor: dotColor }]}>
                      <View style={styles.lessonInfo}>
                        {scheduled.image ? (
                          <Image source={{ uri: scheduled.image }} style={styles.lessonAvatar} />
                        ) : scheduled.type === 'group' ? (
                          <View style={[styles.lessonAvatarPlaceholder, { backgroundColor: Colors.orangeLight }]}>
                            <Users size={18} color={Colors.orange} />
                          </View>
                        ) : (
                          <View style={[styles.lessonAvatarPlaceholder, { backgroundColor: dotColor + '20' }]}>
                            <Text style={[styles.lessonAvatarText, { color: dotColor }]}>
                              {scheduled.name?.charAt(0) || '?'}
                            </Text>
                          </View>
                        )}
                        <View style={styles.lessonDetails}>
                          <Text style={styles.lessonType}>
                            {scheduled.type === 'group' ? t('attendance.groupSession') : t('attendance.individualSession')}
                          </Text>
                          <Text style={styles.lessonName} numberOfLines={1}>
                            {scheduled.name}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.moreButton}
                        onPress={() => router.push('/lesson-attendance' as any)}
                      >
                        <Check size={18} color={Colors.success} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

              {/* İşlenmiş Dersler (Silik görünür) */}
              {todaysCompletedLessons.map((lesson, index) => {
                const student = students.find(s => s.id === lesson.studentId);
                const group = lesson.groupId ? groups.find(g => g.id === lesson.groupId) : null;
                const dotColor = Colors.textMuted;
                const isLast = index === todaysCompletedLessons.length - 1;

                return (
                  <View key={lesson.id} style={[styles.timelineItem, styles.lessonCompleted]}>
                    {/* Left: Time */}
                    <View style={styles.timeColumn}>
                      <Text style={styles.timeText}>{formatTime(lesson.date)}</Text>
                    </View>

                    {/* Center: Dot + Line */}
                    <View style={styles.dotColumn}>
                      <View style={[styles.timelineDot, { backgroundColor: dotColor }]} />
                      {!isLast && <View style={styles.timelineLine} />}
                    </View>

                    {/* Right: Card */}
                    <View style={[styles.lessonCard, { borderLeftColor: dotColor }]}>
                      <View style={styles.lessonInfo}>
                        {student?.image ? (
                          <Image source={{ uri: student.image }} style={styles.lessonAvatar} />
                        ) : group ? (
                          <View style={[styles.lessonAvatarPlaceholder, { backgroundColor: Colors.orangeLight }]}>
                            <Users size={18} color={Colors.orange} />
                          </View>
                        ) : (
                          <View style={[styles.lessonAvatarPlaceholder, { backgroundColor: dotColor + '20' }]}>
                            <Text style={[styles.lessonAvatarText, { color: dotColor }]}>
                              {student?.fullName?.charAt(0) || '?'}
                            </Text>
                          </View>
                        )}
                        <View style={styles.lessonDetails}>
                          <Text style={styles.lessonType}>
                            {group ? t('attendance.groupSession') : t('attendance.individualSession')} ✓
                          </Text>
                          <Text style={styles.lessonName} numberOfLines={1}>
                            {group ? group.name : student?.fullName || 'Unknown'} - {lesson.topic}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

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
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  proBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    minHeight: 140,
  },
  patternCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 999,
  },
  heroContentLeft: {
    flex: 1,
    zIndex: 1,
  },
  heroTextContainer: {
    gap: 4,
  },
  heroLabel: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  heroCurrency: {
    fontSize: 24,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  heroAmount: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -1,
  },
  heroSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    fontWeight: '500',
  },
  heroArrow: {
    marginLeft: 16,
    zIndex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.text,
  },
  actionButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  actionButtonSmall: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: Colors.card,
    borderWidth: 1,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  actionIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconOutline: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTextPrimary: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  actionTextSmall: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  scheduleSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  emptySchedule: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  timeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  lessonCompleted: {
    opacity: 0.5,
  },
  timeColumn: {
    width: 50,
    alignItems: 'flex-end',
    paddingRight: 10,
    paddingTop: 14,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  timePeriod: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  dotColumn: {
    alignItems: 'center',
    width: 20,
    paddingTop: 14,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginTop: 4,
    marginBottom: -14,
  },
  lessonCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  lessonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  lessonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  lessonAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonAvatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  lessonDetails: {
    flex: 1,
  },
  lessonType: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  lessonName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
});
