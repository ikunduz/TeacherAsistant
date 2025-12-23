import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from '../src/context/DataContext';
import { Colors } from '../src/constants/Colors';
import { Lesson } from '../src/types';
import { X, CheckCircle, Circle, Users, User, Save, FileText } from 'lucide-react-native';

export default function LessonAttendanceScreen() {
  const router = useRouter();
  const { students, groups, addBatchLessons } = useData();

  const [mode, setMode] = useState<'individual' | 'group'>('group');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [attendanceList, setAttendanceList] = useState<string[]>([]);
  const [customFees, setCustomFees] = useState<Record<string, string>>({});

  // KONU VE ÖDEVLER BURADA TUTULUYOR
  const [topic, setTopic] = useState('');

  // --- FİLTRELEME: GRUBU OLMAYAN ÖĞRENCİLER ---
  const soloStudents = students.filter(student => {
    const isInAnyGroup = groups.some(group => group.studentIds.includes(student.id));
    return !isInAnyGroup;
  });

  // GRUP MODU: LİSTE VE ÜCRET DOLDURMA
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

  // BİREYSEL MOD: ÜCRET DOLDURMA
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
      Alert.alert('Hata', 'Lütfen en az bir öğrenci seçin.');
      return;
    }

    // Konu girilmemişse uyarı verelim mi? Yoksa "Genel Tekrar" mı yazalım?
    // Şimdilik boş geçilmesine izin verelim veya varsayılan atayalım.
    const finalTopic = topic.trim() || 'Genel Ders';

    try {
      const lessonsToSave: Lesson[] = targetIds.map(id => {
        const student = students.find(s => s.id === id);
        const fee = parseFloat(customFees[id] || '0') || (student?.lessonFee || 0);

        return {
          id: Date.now().toString() + Math.random().toString(),
          studentId: id,
          studentName: student?.fullName || 'Bilinmeyen',
          date: new Date().toISOString(),
          fee: fee,
          topic: finalTopic, // BURASI ANA SAYFAYA GİDECEK
          type: mode,
          groupId: mode === 'group' ? (selectedGroupId || undefined) : undefined
        };
      });

      await addBatchLessons(lessonsToSave);

      Alert.alert('Başarılı', `${lessonsToSave.length} ders kaydedildi.`, [
        { text: 'Tamam', onPress: () => router.back() }
      ]);

    } catch (error) {
      Alert.alert('Hata', 'Kayıt sırasında bir sorun oluştu.');
    }
  };

  const studentsToDisplay = mode === 'group' && selectedGroupId
    ? students.filter(s => groups.find(g => g.id === selectedGroupId)?.studentIds.includes(s.id))
    : [];

  // Seçim yapıldı mı kontrolü (Input'u göstermek için)
  const isSelectionMade = (mode === 'group' && selectedGroupId) || (mode === 'individual' && selectedStudentId);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ders İşle</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* MOD SEÇİMİ */}
        <View style={styles.section}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, mode === 'group' && styles.toggleButtonActive]}
              onPress={() => setMode('group')}
            >
              <Users size={20} color={mode === 'group' ? Colors.primary : Colors.textSecondary} />
              <Text style={[styles.toggleText, mode === 'group' && styles.toggleTextActive]}>Grup Dersi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, mode === 'individual' && styles.toggleButtonActive]}
              onPress={() => setMode('individual')}
            >
              <User size={20} color={mode === 'individual' ? Colors.primary : Colors.textSecondary} />
              <Text style={[styles.toggleText, mode === 'individual' && styles.toggleTextActive]}>Birebir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* GRUP LİSTESİ */}
        {mode === 'group' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Grup Seç</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {groups.map(group => (
                <TouchableOpacity
                  key={group.id}
                  style={[styles.chip, selectedGroupId === group.id && styles.selectedChip]}
                  onPress={() => setSelectedGroupId(group.id)}
                >
                  <Text style={[styles.chipText, selectedGroupId === group.id && styles.selectedChipText]}>
                    {group.name}
                  </Text>
                </TouchableOpacity>
              ))}
              {groups.length === 0 && <Text style={styles.emptyText}>Henüz grup yok.</Text>}
            </ScrollView>
          </View>
        )}

        {/* BİREYSEL LİSTE */}
        {mode === 'individual' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Öğrenci Seç</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {soloStudents.map(student => (
                <TouchableOpacity
                  key={student.id}
                  style={[styles.chip, selectedStudentId === student.id && styles.selectedChip]}
                  onPress={() => setSelectedStudentId(student.id)}
                >
                  <Text style={[styles.chipText, selectedStudentId === student.id && styles.selectedChipText]}>
                    {student.fullName}
                  </Text>
                </TouchableOpacity>
              ))}
              {soloStudents.length === 0 && <Text style={styles.emptyText}>Müsait öğrenci yok.</Text>}
            </ScrollView>
          </View>
        )}

        {/* YOKLAMA KARTLARI */}
        {isSelectionMade && (
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={styles.sectionTitle}>Öğrenci Listesi & Ücretler</Text>
              {mode === 'group' && <Text style={{ color: Colors.textSecondary, fontWeight: '600' }}>{attendanceList.length} Kişi</Text>}
            </View>

            {/* GRUP GÖSTERİMİ */}
            {mode === 'group' ? studentsToDisplay.map(student => {
              const isPresent = attendanceList.includes(student.id);
              return (
                <View key={student.id} style={[styles.studentCard, !isPresent && styles.studentCardAbsent]}>
                  <TouchableOpacity style={styles.studentInfo} onPress={() => toggleAttendance(student.id)}>
                    {isPresent ? (
                      <CheckCircle size={24} color={Colors.success} style={{ marginRight: 10 }} />
                    ) : (
                      <Circle size={24} color={Colors.border} style={{ marginRight: 10 }} />
                    )}
                    <View>
                      <Text style={[styles.studentName, !isPresent && styles.textAbsent]}>{student.fullName}</Text>
                      <Text style={{ fontSize: 12, color: Colors.textSecondary }}>{isPresent ? 'Derste' : 'Yok'}</Text>
                    </View>
                  </TouchableOpacity>

                  {isPresent && (
                    <View style={styles.feeContainer}>
                      <Text style={{ color: Colors.textSecondary, marginRight: 4 }}>₺</Text>
                      <TextInput
                        style={styles.feeInput}
                        value={customFees[student.id]}
                        onChangeText={(text) => handleFeeChange(student.id, text)}
                        keyboardType="numeric"
                      />
                    </View>
                  )}
                </View>
              );
            }) : (
              // BİREYSEL GÖSTERİM
              selectedStudentId && (
                <View style={styles.studentCard}>
                  <View style={styles.studentInfo}>
                    <User size={24} color={Colors.primary} style={{ marginRight: 10 }} />
                    <Text style={styles.studentName}>
                      {students.find(s => s.id === selectedStudentId)?.fullName}
                    </Text>
                  </View>
                  <View style={styles.feeContainer}>
                    <Text style={{ color: Colors.textSecondary, marginRight: 4 }}>₺</Text>
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
        )}

        {/* YENİ EKLENEN KISIM: KONU VE ÖDEVLER */}
        {isSelectionMade && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>İşlenen Konu ve Ödevler</Text>
            <View style={styles.textAreaContainer}>
              <FileText size={20} color={Colors.primary} style={styles.textAreaIcon} />
              <TextInput
                style={styles.textArea}
                placeholder="Bugün neler işlediniz? Ödev var mı?"
                placeholderTextColor="#A0AEC0"
                value={topic}
                onChangeText={setTopic}
                multiline={true}
                numberOfLines={3}
              />
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.saveButtonText}>Dersi Tamamla ve Kaydet</Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 50, backgroundColor: Colors.card },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  closeButton: { padding: 8, borderRadius: 20, backgroundColor: Colors.background },
  content: { flex: 1, paddingHorizontal: 20 },
  section: { marginBottom: 24, marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 12 },

  toggleContainer: { flexDirection: 'row', gap: 12 },
  toggleButton: { flex: 1, backgroundColor: Colors.card, borderRadius: 16, padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, borderWidth: 2, borderColor: Colors.border },
  toggleButtonActive: { backgroundColor: Colors.background, borderColor: Colors.primary },
  toggleText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  toggleTextActive: { color: Colors.primary },

  chip: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: Colors.card, borderRadius: 20, marginRight: 10, borderWidth: 2, borderColor: Colors.border },
  selectedChip: { borderColor: Colors.primary, backgroundColor: Colors.background },
  chipText: { color: Colors.textSecondary, fontWeight: '600' },
  selectedChipText: { color: Colors.primary },
  emptyText: { color: Colors.textSecondary, fontStyle: 'italic' },

  studentCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.card, padding: 16, borderRadius: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  studentCardAbsent: { opacity: 0.6, backgroundColor: '#F8FAFC', shadowOpacity: 0, elevation: 0 },
  studentInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  studentName: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  textAbsent: { textDecorationLine: 'line-through', color: Colors.textSecondary },

  feeContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: Colors.border, width: 90 },
  feeInput: { fontSize: 15, fontWeight: 'bold', color: Colors.success, flex: 1, textAlign: 'right' },

  // YENİ STİLLER (TEXT AREA)
  textAreaContainer: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, minHeight: 100 },
  textAreaIcon: { marginTop: 4, marginRight: 10 },
  textArea: { flex: 1, fontSize: 16, color: Colors.text, textAlignVertical: 'top' },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 40 },
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, borderRadius: 16, padding: 18, gap: 12, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});