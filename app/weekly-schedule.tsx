import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Clock, Home, User, Users, Video } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../src/constants/Colors';
import { useData } from '../src/context/DataContext';

interface ScheduledItem {
  name: string;
  time: string;
  day: number;
  type: 'individual' | 'group';
  lessonType?: 'FaceToFace' | 'Online';
}

export default function WeeklyScheduleScreen() {
  const { t } = useTranslation();
  const { students, groups, teacher } = useData();
  const router = useRouter();

  const themeColor = teacher?.themeColor || Colors.primary;

  const weekDays = [
    { label: t('onboarding.days.mon'), value: 1 },
    { label: t('onboarding.days.tue'), value: 2 },
    { label: t('onboarding.days.wed'), value: 3 },
    { label: t('onboarding.days.thu'), value: 4 },
    { label: t('onboarding.days.fri'), value: 5 },
    { label: t('onboarding.days.sat'), value: 6 },
    { label: t('onboarding.days.sun'), value: 0 }
  ];

  const schedule = useMemo(() => {
    const allItems: ScheduledItem[] = [];
    students.forEach(student => {
      student.schedule?.forEach(sc => {
        allItems.push({
          name: student.fullName,
          time: sc.time,
          day: sc.day,
          type: 'individual',
          lessonType: sc.lessonType
        });
      });
    });
    groups.forEach(group => {
      group.schedule?.forEach(sc => {
        allItems.push({
          name: group.name,
          time: sc.time,
          day: sc.day,
          type: 'group',
          lessonType: sc.lessonType
        });
      });
    });
    return allItems.sort((a, b) => a.time.localeCompare(b.time));
  }, [students, groups]);

  const hasSchedule = schedule.length > 0;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* iOS-style Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.iosBlue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('dashboard.weeklySchedule')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!hasSchedule ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('common.noData')}</Text>
          </View>
        ) : (
          weekDays.map(day => {
            const dayLessons = schedule.filter(item => item.day === day.value);
            if (dayLessons.length === 0) return null;

            return (
              <View key={day.value}>
                <Text style={styles.sectionHeader}>{day.label.toUpperCase()}</Text>
                <View style={styles.card}>
                  {dayLessons.map((item, index) => (
                    <View key={index}>
                      <View style={styles.lessonRow}>
                        <View style={styles.timeColumn}>
                          <Clock size={16} color={themeColor} />
                          <Text style={[styles.timeText, { color: themeColor }]}>{item.time}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.lessonInfo}>
                          <Text style={styles.lessonName}>{item.name}</Text>
                          <View style={styles.tagsRow}>
                            <View style={[styles.tag, { backgroundColor: item.type === 'group' ? Colors.orangeLight : Colors.primaryLight }]}>
                              {item.type === 'group' ? (
                                <Users size={12} color={Colors.orange} />
                              ) : (
                                <User size={12} color={themeColor} />
                              )}
                              <Text style={[styles.tagText, { color: item.type === 'group' ? Colors.orange : themeColor }]}>
                                {item.type === 'group' ? t('students.groups') : t('students.individuals')}
                              </Text>
                            </View>
                            <View style={[styles.tag, { backgroundColor: Colors.successLight }]}>
                              {item.lessonType === 'Online' ? (
                                <Video size={12} color={Colors.success} />
                              ) : (
                                <Home size={12} color={Colors.success} />
                              )}
                              <Text style={[styles.tagText, { color: Colors.success }]}>
                                {item.lessonType === 'Online' ? t('students.online') : t('students.faceToFace')}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                      {index < dayLessons.length - 1 && <View style={styles.separator} />}
                    </View>
                  ))}
                </View>
              </View>
            );
          })
        )}
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
  content: {
    padding: 16,
  },

  // Empty State
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },

  // Section Header
  sectionHeader: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6D6D72',
    marginHorizontal: 4,
    marginBottom: 8,
    marginTop: 20,
    letterSpacing: 0.5,
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

  // Lesson Row
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  timeColumn: {
    alignItems: 'center',
    width: 60,
    gap: 4,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.iosSeparator,
    marginHorizontal: 16,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.iosSeparator,
    marginLeft: 92,
  },
});
