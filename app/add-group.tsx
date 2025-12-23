import { useRouter } from 'expo-router';
import { CheckCircle, Circle, Clock, Users, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../src/constants/Colors';
import { useData } from '../src/context/DataContext';
import { sanitizeText } from '../src/utils/validation';

export default function AddGroupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { students, addGroup, teacher, groups } = useData();
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Find students already in a group
  const groupedStudentIds = new Set(groups.flatMap(g => g.studentIds));

  // Filter available students
  const availableStudents = students.filter(s => !groupedStudentIds.has(s.id));

  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [lessonTime, setLessonTime] = useState('');

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

  const handleSave = async () => {
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

  const themeColor = teacher?.themeColor || Colors.primary;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('students.addGroup')}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('students.groups')} {t('common.edit')}</Text>
        <View style={styles.textInputWrapper}>
          <Users size={20} color={Colors.textSecondary} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.input}
            placeholder="e.g. Math Group A"
            value={name}
            onChangeText={setName}
            maxLength={100}
          />
        </View>
      </View>

      <ScrollView style={{ paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
        {/* Weekly Day */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('dashboard.weeklySchedule')} ({t('common.noData')})</Text>
          <View style={styles.daysContainer}>
            {days.map((day) => {
              const isSelected = selectedDays.includes(day.value);
              return (
                <TouchableOpacity
                  key={day.value}
                  style={[styles.dayButton, isSelected && { borderColor: themeColor, backgroundColor: themeColor + '10' }]}
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
        </View>

        {/* Lesson Time */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('students.lessonTime')} ({t('common.noData')})</Text>
          <View style={styles.textInputWrapper}>
            <Clock size={20} color={Colors.textSecondary} style={{ marginRight: 10 }} />
            <TextInput style={styles.input} placeholder="e.g. 16:00" value={lessonTime} onChangeText={setLessonTime} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.listHeader}>
        <Text style={styles.label}>{t('attendance.selectStudent')} ({selectedIds.length})</Text>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {availableStudents.length === 0 ? (
          <Text style={styles.emptyText}>{t('attendance.noStudents')}</Text>
        ) : (
          availableStudents.map(student => {
            const isSelected = selectedIds.includes(student.id);
            return (
              <TouchableOpacity
                key={student.id}
                style={[styles.card, isSelected && { borderColor: themeColor, backgroundColor: themeColor + '05' }]}
                onPress={() => toggleSelection(student.id)}
              >
                <View style={styles.cardContent}>
                  <Text style={[styles.studentName, isSelected && { color: themeColor }]}>{student.fullName}</Text>
                  <Text style={styles.studentGrade}>{student.grade}</Text>
                </View>
                {isSelected ? (
                  <CheckCircle size={24} color={Colors.success} />
                ) : (
                  <Circle size={24} color={Colors.border} />
                )}
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: themeColor }]} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{t('common.save')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 50, backgroundColor: Colors.card },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  closeButton: { padding: 8, backgroundColor: Colors.background, borderRadius: 12 },
  inputContainer: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 10 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  inputGroup: { marginBottom: 16 },
  textInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 16 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16 },
  listHeader: { paddingHorizontal: 24, marginTop: 10 },
  list: { padding: 24, paddingTop: 10 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.card, padding: 16, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  cardContent: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: '600', color: Colors.text },
  studentGrade: { fontSize: 13, color: Colors.textSecondary },
  daysContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  dayButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 1,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dayText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600'
  },
  footer: { padding: 24, paddingBottom: 40, backgroundColor: Colors.card },
  saveButton: { padding: 18, borderRadius: 16, alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: Colors.textSecondary, marginTop: 20, fontStyle: 'italic' },
});
