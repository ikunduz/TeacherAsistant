import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from '../src/context/DataContext';
import { Colors } from '../src/constants/Colors';
import { X, User, Phone, BookOpen, Banknote, Clock } from 'lucide-react-native';
import { sanitizeText, sanitizeNumber, sanitizePhone } from '../src/utils/validation';

export default function AddStudentScreen() {
  const router = useRouter();
  const { addStudent, teacher } = useData();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [grade, setGrade] = useState('');
  const [lessonFee, setLessonFee] = useState('');
  const [gender, setGender] = useState<'Erkek' | 'Kız'>('Erkek');

  // Yeni takvim state'leri
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [lessonTime, setLessonTime] = useState('');
  const days = [
    { label: 'Pzt', value: 1 }, { label: 'Sal', value: 2 }, { label: 'Çrş', value: 3 },
    { label: 'Per', value: 4 }, { label: 'Cum', value: 5 }, { label: 'Cmt', value: 6 },
    { label: 'Pzr', value: 0 }
  ];

  const handleSave = async () => {
    if (!fullName || !grade || !lessonFee) {
      Alert.alert('Eksik Bilgi', 'Lütfen zorunlu alanları doldurun.');
      return;
    }

    try {
      await addStudent({
        id: Date.now().toString(),
        fullName: sanitizeText(fullName, 100),
        phoneNumber: sanitizePhone(phoneNumber),
        grade: sanitizeText(grade, 50),
        gender,
        lessonFee: sanitizeNumber(lessonFee),
        balance: 0,
        notes: '',
        lastTopic: '',
        homeworkNotes: '',
        createdAt: new Date().toISOString(),
        schedule: lessonTime ? selectedDays.map(day => ({ day, time: lessonTime })) : undefined,
      });
      router.back();
    } catch (error) {
      Alert.alert('Hata', 'Öğrenci kaydedilemedi.');
    }
  };

  const themeColor = teacher?.themeColor || Colors.primary;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Yeni Öğrenci</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {/* Ad Soyad */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Adı Soyadı</Text>
          <View style={styles.inputContainer}>
            <User size={20} color={Colors.textSecondary} style={styles.icon} />
            <TextInput style={styles.input} placeholder="Örn: Ahmet Yılmaz" value={fullName} onChangeText={setFullName} maxLength={100} />
          </View>
        </View>

        {/* Telefon */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Telefon</Text>
          <View style={styles.inputContainer}>
            <Phone size={20} color={Colors.textSecondary} style={styles.icon} />
            <TextInput style={styles.input} placeholder="0555..." keyboardType="phone-pad" value={phoneNumber} onChangeText={setPhoneNumber} maxLength={15} />
          </View>
        </View>

        {/* Sınıf */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sınıf / Seviye</Text>
          <View style={styles.inputContainer}>
            <BookOpen size={20} color={Colors.textSecondary} style={styles.icon} />
            <TextInput style={styles.input} placeholder="Örn: 8. Sınıf" value={grade} onChangeText={setGrade} maxLength={50} />
          </View>
        </View>

        {/* Ücret */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ders Ücreti (₺)</Text>
          <View style={styles.inputContainer}>
            <Banknote size={20} color={Colors.textSecondary} style={styles.icon} />
            <TextInput style={styles.input} placeholder="Örn: 400" keyboardType="numeric" value={lessonFee} onChangeText={setLessonFee} />
          </View>
        </View>

        {/* Cinsiyet */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cinsiyet</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[styles.genderBtn, gender === 'Erkek' && styles.genderBtnActive]}
              onPress={() => setGender('Erkek')}
            >
              <Text style={[styles.genderText, gender === 'Erkek' && styles.genderTextActive]}>Erkek</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderBtn, gender === 'Kız' && styles.genderBtnActive]}
              onPress={() => setGender('Kız')}
            >
              <Text style={[styles.genderText, gender === 'Kız' && styles.genderTextActive]}>Kız</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Haftalık Ders Günü */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Haftalık Ders Günü (İsteğe Bağlı)</Text>
          <View style={styles.daysContainer}>
            {days.map((day) => {
              const isSelected = selectedDays.includes(day.value);
              return (
                <TouchableOpacity
                  key={day.value}
                  style={[styles.dayButton, isSelected && styles.dayButtonActive]}
                  onPress={() => {
                    const newSelection = isSelected
                      ? selectedDays.filter(d => d !== day.value)
                      : [...selectedDays, day.value];
                    setSelectedDays(newSelection);
                  }}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>{day.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Ders Saati */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ders Saati (İsteğe Bağlı)</Text>
          <View style={styles.inputContainer}>
            <Clock size={20} color={Colors.textSecondary} style={styles.icon} />
            <TextInput style={styles.input} placeholder="Örn: 14:30" value={lessonTime} onChangeText={setLessonTime} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: themeColor }]} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Kaydet</Text>
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
  form: { padding: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12 },
  icon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: Colors.text },
  genderContainer: { flexDirection: 'row', gap: 12 },
  genderBtn: { flex: 1, padding: 14, borderRadius: 16, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  genderBtnActive: { backgroundColor: Colors.background, borderColor: Colors.primary },
  genderText: { fontSize: 16, color: Colors.textSecondary, fontWeight: '600' },
  genderTextActive: { color: Colors.primary },
  daysContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  dayButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 2,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dayButtonActive: {
    backgroundColor: Colors.background,
    borderColor: Colors.primary
  },
  dayText: {
    color: Colors.textSecondary,
    fontWeight: '600'
  },
  dayTextActive: {
    color: Colors.primary
  },
  footer: { padding: 24, paddingBottom: 40, backgroundColor: Colors.card },
  saveButton: { padding: 18, borderRadius: 16, alignItems: 'center' },
  saveButtonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
});
