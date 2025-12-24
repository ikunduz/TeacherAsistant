import { useRouter } from 'expo-router';
import { CheckCircle, ChevronLeft, Circle, FileText, Save, User, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../src/constants/Colors';
import { useData } from '../src/context/DataContext';
import { Lesson } from '../src/types';

export default function LessonAttendanceScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { students, groups, addBatchLessons, settings, teacher } = useData();

  const [mode, setMode] = useState<'individual' | 'group'>('group');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [attendanceList, setAttendanceList] = useState<string[]>([]);
  const [customFees, setCustomFees] = useState<Record<string, string>>({});
  const [topic, setTopic] = useState('');

  const themeColor = teacher?.themeColor || Colors.primary;

  useEffect(() => {
    if (mode === 'group' && selectedGroupId) {
      const group = groups.find(g => g.id === selectedGroupId);
      if (group) {
        const activeStudentIds = group.studentIds.filter(id => students.some(s => s.id === id));
        setAttendanceList(activeStudentIds);
        const initialFees: Record<string, string> = {};
        activeStudentIds.forEach(id => {
          const s = students.find(student => student.id === id);
          if (s) initialFees[id] = s.lessonFee.toString();
        });
        setCustomFees(initialFees);
      }
    } else {
      setAttendanceList([]);
      setCustomFees({});
    }
  }, [selectedGroupId, mode, groups, students]);

  useEffect(() => {
    if (mode === 'individual' && selectedStudentId) {
      const student = students.find(s => s.id === selectedStudentId);
      if (student) {
        setCustomFees({ [selectedStudentId]: student.lessonFee.toString() });
      }
    }
  }, [selectedStudentId, students]);

  const toggleAttendance = (studentId: string) => {
    if (attendanceList.includes(studentId)) {
      setAttendanceList(prev => prev.filter(id => id !== studentId));
    } else {
      setAttendanceList(prev => [...prev, studentId]);
    }
  };

  const handleFeeChange = (studentId: string, text: string) => {
    setCustomFees(prev => ({ ...prev, [studentId]: text }));
  };

  const handleSave = async () => {
    const targetIds = mode === 'group' ? attendanceList : (selectedStudentId ? [selectedStudentId] : []);

    if (targetIds.length === 0) {
      Alert.alert(t('common.error'), t('attendance.noSelection'));
      return;
    }

    const finalTopic = topic.trim() || t('attendance.generalLesson');

    try {
      // Paket bilgilerini hesapla
      let packageDeductions: string[] = [];
      let balanceAdditions: string[] = [];

      const lessonsToSave: Lesson[] = targetIds.map(id => {
        const student = students.find(s => s.id === id);
        const fee = parseFloat(customFees[id] || '0') || (student?.lessonFee || 0);
        const hasPackage = student?.remainingLessons && student.remainingLessons > 0;

        if (hasPackage) {
          const remaining = student.remainingLessons - 1;
          if (remaining === 0) {
            packageDeductions.push(`⚠️ ${student.fullName}: Paket bitti!`);
          } else {
            packageDeductions.push(`🎫 ${student.fullName}: ${remaining} ders kaldı`);
          }
        } else {
          balanceAdditions.push(`💰 ${student?.fullName}: +${settings.currency}${fee} borç`);
        }

        return {
          id: Date.now().toString() + Math.random().toString(),
          studentId: id,
          studentName: student?.fullName || 'Unknown',
          date: new Date().toISOString(),
          fee: hasPackage ? 0 : fee,
          topic: finalTopic,
          type: mode,
          groupId: mode === 'group' ? (selectedGroupId || undefined) : undefined,
        };
      });

      await addBatchLessons(lessonsToSave);

      // Detaylı özet mesajı oluştur
      let summaryMessage = t('attendance.successMessage', { count: lessonsToSave.length });
      if (packageDeductions.length > 0) {
        summaryMessage += '\n\n' + packageDeductions.join('\n');
      }
      if (balanceAdditions.length > 0) {
        summaryMessage += '\n\n' + balanceAdditions.join('\n');
      }

      Alert.alert('✅ ' + t('common.success'), summaryMessage, [
        { text: t('common.save'), onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  const studentsToDisplay = mode === 'group' && selectedGroupId
    ? students.filter(s => groups.find(g => g.id === selectedGroupId)?.studentIds.includes(s.id))
    : [];

  const isSelectionMade = (mode === 'group' && selectedGroupId) || (mode === 'individual' && selectedStudentId);

  return (
    <View style={styles.container}>
      {/* iOS-style Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.iosBlue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('attendance.markAttendance')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Mode Toggle */}
          <View style={styles.card}>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[styles.segmentButton, mode === 'group' && styles.segmentButtonActive]}
                onPress={() => setMode('group')}
              >
                <Users size={18} color={mode === 'group' ? themeColor : Colors.textSecondary} />
                <Text style={[styles.segmentText, mode === 'group' && { color: themeColor, fontWeight: '600' }]}>
                  {t('attendance.groupSession')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentButton, mode === 'individual' && styles.segmentButtonActive]}
                onPress={() => setMode('individual')}
              >
                <User size={18} color={mode === 'individual' ? themeColor : Colors.textSecondary} />
                <Text style={[styles.segmentText, mode === 'individual' && { color: themeColor, fontWeight: '600' }]}>
                  {t('attendance.individualSession')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Group/Student Selection */}
          {mode === 'group' ? (
            <>
              <Text style={styles.sectionHeader}>{t('attendance.selectGroup').toUpperCase()}</Text>
              <View style={styles.card}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContainer}>
                  {groups.length === 0 ? (
                    <Text style={styles.emptyText}>{t('attendance.noGroups')}</Text>
                  ) : (
                    groups.map(group => (
                      <TouchableOpacity
                        key={group.id}
                        style={[
                          styles.chip,
                          selectedGroupId === group.id && { backgroundColor: themeColor + '15', borderColor: themeColor }
                        ]}
                        onPress={() => setSelectedGroupId(group.id)}
                      >
                        <Text style={[styles.chipText, selectedGroupId === group.id && { color: themeColor }]}>
                          {group.name}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.sectionHeader}>{t('attendance.selectStudent').toUpperCase()}</Text>
              <View style={styles.card}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContainer}>
                  {students.length === 0 ? (
                    <Text style={styles.emptyText}>{t('attendance.noStudents')}</Text>
                  ) : (
                    students.map(student => (
                      <TouchableOpacity
                        key={student.id}
                        style={[
                          styles.chip,
                          selectedStudentId === student.id && { backgroundColor: themeColor + '15', borderColor: themeColor }
                        ]}
                        onPress={() => setSelectedStudentId(student.id)}
                      >
                        <Text style={[styles.chipText, selectedStudentId === student.id && { color: themeColor }]}>
                          {student.fullName}
                        </Text>
                        {student.remainingLessons > 0 && (
                          <Text style={styles.packageBadge}>
                            🎫 {student.remainingLessons}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            </>
          )}

          {/* Attendance List */}
          {isSelectionMade && (
            <>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeader}>{t('attendance.attendanceFees').toUpperCase()}</Text>
                {mode === 'group' && (
                  <Text style={styles.countBadge}>{attendanceList.length} {t('students.title')}</Text>
                )}
              </View>
              <View style={styles.card}>
                {mode === 'group' ? (
                  studentsToDisplay.map((student, index) => {
                    const isPresent = attendanceList.includes(student.id);
                    const hasPackage = student.remainingLessons > 0;
                    return (
                      <View key={student.id}>
                        <View style={[styles.studentRow, !isPresent && styles.studentRowAbsent]}>
                          <TouchableOpacity style={styles.studentInfo} onPress={() => toggleAttendance(student.id)}>
                            {isPresent ? (
                              <CheckCircle size={22} color={Colors.success} />
                            ) : (
                              <Circle size={22} color={Colors.border} />
                            )}
                            <View style={styles.studentDetails}>
                              <Text style={[styles.studentName, !isPresent && styles.textAbsent]}>
                                {student.fullName}
                                {hasPackage && <Text style={styles.packageBadgeInline}> 🎫 {student.remainingLessons}</Text>}
                              </Text>
                              <Text style={styles.studentStatus}>
                                {isPresent
                                  ? (hasPackage ? t('attendance.fromPackage') : t('attendance.inClass'))
                                  : t('attendance.notInClass')}
                              </Text>
                            </View>
                          </TouchableOpacity>
                          {isPresent && (
                            <View style={styles.feeInputContainer}>
                              {hasPackage ? (
                                <Text style={[styles.feeInput, { color: Colors.success }]}>🎫</Text>
                              ) : (
                                <>
                                  <Text style={styles.currencySymbol}>{settings.currency}</Text>
                                  <TextInput
                                    style={styles.feeInput}
                                    value={customFees[student.id]}
                                    onChangeText={(text) => handleFeeChange(student.id, text)}
                                    keyboardType="numeric"
                                  />
                                </>
                              )}
                            </View>
                          )}
                        </View>
                        {index < studentsToDisplay.length - 1 && <View style={styles.separator} />}
                      </View>
                    );
                  })
                ) : (
                  selectedStudentId && (
                    <View style={styles.studentRow}>
                      <View style={styles.studentInfo}>
                        <User size={22} color={themeColor} />
                        <Text style={styles.studentName}>
                          {students.find(s => s.id === selectedStudentId)?.fullName}
                        </Text>
                      </View>
                      <View style={styles.feeInputContainer}>
                        <Text style={styles.currencySymbol}>{settings.currency}</Text>
                        <TextInput
                          style={styles.feeInput}
                          value={customFees[selectedStudentId]}
                          onChangeText={(text) => handleFeeChange(selectedStudentId, text)}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  )
                )}
              </View>
            </>
          )}

          {/* Topic Input */}
          {isSelectionMade && (
            <>
              <Text style={styles.sectionHeader}>{t('attendance.topicsHomework').toUpperCase()}</Text>
              <View style={styles.card}>
                <View style={styles.topicInputRow}>
                  <FileText size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.topicInput}
                    placeholder={t('attendance.topicsPlaceholder')}
                    placeholderTextColor={Colors.textMuted}
                    value={topic}
                    onChangeText={setTopic}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            </>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: themeColor }]} onPress={handleSave}>
          <Save size={20} color="#FFF" />
          <Text style={styles.saveButtonText}>{t('attendance.completeSave')}</Text>
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

  // Segmented Control
  segmentedControl: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  segmentButtonActive: {
    backgroundColor: Colors.iosBg,
  },
  segmentText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Chips
  chipContainer: {
    padding: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.iosBg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptyText: {
    color: Colors.textMuted,
    fontStyle: 'italic',
    padding: 8,
  },

  // Student Row
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  studentRowAbsent: {
    opacity: 0.5,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  studentStatus: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  textAbsent: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.iosSeparator,
    marginLeft: 50,
  },

  // Fee Input
  feeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.iosBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  currencySymbol: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  feeInput: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.success,
    width: 60,
    textAlign: 'right',
  },

  // Topic Input
  topicInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
  },
  topicInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  packageBadge: {
    fontSize: 11,
    color: Colors.primary,
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
    overflow: 'hidden',
  },
  packageBadgeInline: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
});