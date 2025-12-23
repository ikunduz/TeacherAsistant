import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useData } from '../../src/context/DataContext';
import { Colors } from '../../src/constants/Colors';
import { X, User, Phone, BookOpen, Banknote } from 'lucide-react-native';

export default function EditStudentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { students, updateStudent } = useData();

  // Öğrenciyi bul
  const studentId = Array.isArray(id) ? id[0] : id;
  const student = students.find(s => s.id === studentId);

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [grade, setGrade] = useState('');
  const [lessonFee, setLessonFee] = useState('');
  const [gender, setGender] = useState<'Erkek' | 'Kız'>('Erkek');

  // Veriler yüklenince state'i doldur
  useEffect(() => {
    if (student) {
      setFullName(student.fullName);
      setPhoneNumber(student.phoneNumber);
      setGrade(student.grade);
      setLessonFee(student.lessonFee.toString());
      setGender(student.gender);
    }
  }, [student]);

  const handleSave = async () => {
    if (!fullName || !grade || !lessonFee || !student) {
      Alert.alert('Eksik Bilgi', 'Lütfen zorunlu alanları doldurun.');
      return;
    }

    try {
      await updateStudent({
        ...student,
        fullName,
        phoneNumber,
        grade,
        gender,
        lessonFee: parseFloat(lessonFee) || 0,
      });
      Alert.alert('Başarılı', 'Bilgiler güncellendi.');
      router.back();
    } catch (error) {
      Alert.alert('Hata', 'Güncelleme yapılamadı.');
    }
  };

  if (!student) return null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bilgileri Düzenle</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Adı Soyadı</Text>
          <View style={styles.inputContainer}>
            <User size={20} color={Colors.textSecondary} style={styles.icon} />
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Telefon</Text>
          <View style={styles.inputContainer}>
            <Phone size={20} color={Colors.textSecondary} style={styles.icon} />
            <TextInput style={styles.input} keyboardType="phone-pad" value={phoneNumber} onChangeText={setPhoneNumber} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sınıf / Seviye</Text>
          <View style={styles.inputContainer}>
            <BookOpen size={20} color={Colors.textSecondary} style={styles.icon} />
            <TextInput style={styles.input} value={grade} onChangeText={setGrade} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ders Ücreti (₺)</Text>
          <View style={styles.inputContainer}>
            <Banknote size={20} color={Colors.textSecondary} style={styles.icon} />
            <TextInput style={styles.input} keyboardType="numeric" value={lessonFee} onChangeText={setLessonFee} />
          </View>
        </View>

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
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Güncelle</Text>
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
  footer: { padding: 24, paddingBottom: 40, backgroundColor: Colors.card },
  saveButton: { backgroundColor: Colors.primary, padding: 18, borderRadius: 16, alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});