import { useRouter } from 'expo-router';
import { CheckCircle, ChevronLeft, Circle, Clock, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../src/constants/Colors';
import { useData } from '../src/context/DataContext';
import { PREMIUM_LIMITS, useSubscription } from '../src/context/SubscriptionContext';
import { sanitizeText } from '../src/utils/validation';

export default function AddGroupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { students, addGroup, teacher, groups } = useData();
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [lessonTime, setLessonTime] = useState('');

  const themeColor = teacher?.themeColor || Colors.primary;

  // Find students already in a group
  const groupedStudentIds = new Set(groups.flatMap(g => g.studentIds));
  const availableStudents = students.filter(s => !groupedStudentIds.has(s.id));

  const days = [
    { label: t('onboarding.days.mon'), value: 1 },
    { label: t('onboarding.days.tue'), value: 2 },
    { label: t('onboarding.days.wed'), value: 3 },
    { label: t('onboarding.days.thu'), value: 4 },
    { label: t('onboarding.days.fri'), value: 5 },
    { label: t('onboarding.days.sat'), value: 6 },
    { label: t('onboarding.days.sun'), value: 0 }
  ];

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(studentId => studentId !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const { isPro } = useSubscription();

  const handleSave = async () => {
    if (!isPro && groups.length >= PREMIUM_LIMITS.FREE_GROUP_LIMIT) {
      router.push('/paywall' as any);
      return;
    }
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('students.addGroup'));
      return;
    }
    if (selectedIds.length === 0) {
      Alert.alert(t('common.error'), t('attendance.noSelection'));
      return;
    }

    try {
      await addGroup({
        id: Date.now().toString(),
        name: sanitizeText(name, 100),
        studentIds: selectedIds,
        createdAt: new Date().toISOString(),
        schedule: lessonTime ? selectedDays.map(day => ({ day, time: lessonTime })) : undefined,
      });
      router.back();
    } catch (error) {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  return (
    <View style={styles.container}>
      {/* iOS-style Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.iosBlue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('students.addGroup')}</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveHeaderButton}>
          <Text style={[styles.saveHeaderText, { color: themeColor }]}>{t('common.save')}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Group Name */}
          <Text style={styles.sectionHeader}>{t('students.groups').toUpperCase()}</Text>
          <View style={styles.card}>
            <View style={styles.inputRow}>
              <Users size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Math Group A"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
                maxLength={100}
              />
            </View>
          </View>

          {/* Schedule */}
          <Text style={styles.sectionHeader}>{t('dashboard.weeklySchedule').toUpperCase()}</Text>
          <View style={styles.card}>
            <View style={styles.daysContainer}>
              {days.map((day) => {
                const isSelected = selectedDays.includes(day.value);
                return (
                  <TouchableOpacity
                    key={day.value}
                    style={[styles.dayButton, isSelected && { backgroundColor: themeColor + '15', borderColor: themeColor }]}
                    onPress={() => {
                      const newSelection = isSelected
                        ? selectedDays.filter(d => d !== day.value)
                        : [...selectedDays, day.value];
                      setSelectedDays(newSelection);
                    }}
                  >
                    <Text style={[styles.dayText, isSelected && { color: themeColor }]}>{day.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.separator} />
            <View style={styles.inputRow}>
              <Clock size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="16:00"
                placeholderTextColor={Colors.textMuted}
                value={lessonTime}
                onChangeText={setLessonTime}
              />
            </View>
          </View>

          {/* Student Selection */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>{t('attendance.selectStudent').toUpperCase()}</Text>
            <Text style={styles.countBadge}>{selectedIds.length} {t('common.add')}</Text>
          </View>
          <View style={styles.card}>
            {availableStudents.length === 0 ? (
              <View style={styles.emptyRow}>
                <Text style={styles.emptyText}>{t('attendance.noStudents')}</Text>
              </View>
            ) : (
              availableStudents.map((student, index) => {
                const isSelected = selectedIds.includes(student.id);
                return (
                  <View key={student.id}>
                    <TouchableOpacity
                      style={styles.studentRow}
                      onPress={() => toggleSelection(student.id)}
                    >
                      {isSelected ? (
                        <CheckCircle size={22} color={Colors.success} />
                      ) : (
                        <Circle size={22} color={Colors.border} />
                      )}
                      <View style={styles.studentInfo}>
                        <Text style={[styles.studentName, isSelected && { color: themeColor }]}>
                          {student.fullName}
                        </Text>
                        <Text style={styles.studentGrade}>{student.grade}</Text>
                      </View>
                    </TouchableOpacity>
                    {index < availableStudents.length - 1 && <View style={styles.separator} />}
                  </View>
                );
              })
            )}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: themeColor }]} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{t('common.save')}</Text>
        </TouchableOpacity>
      </View>
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
  saveHeaderButton: {
    padding: 4,
  },
  saveHeaderText: {
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 4,
  },
  countBadge: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
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

  // Input Row
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: Colors.text,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.iosSeparator,
    marginLeft: 48,
  },

  // Days
  daysContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 6,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.iosBg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  // Student Row
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  studentInfo: {
    flex: 1,
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
  emptyRow: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontStyle: 'italic',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 34,
    backgroundColor: Colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.iosSeparator,
  },
  saveButton: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
