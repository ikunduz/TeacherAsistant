import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Banknote, BookOpen, Camera, Image as ImageIcon, Phone, User, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../src/constants/Colors';
import { useData } from '../../src/context/DataContext';
import { sanitizeNumber, sanitizePhone, sanitizeText } from '../../src/utils/validation';

export default function EditStudentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { students, updateStudent, teacher, settings } = useData();

  const studentId = Array.isArray(id) ? id[0] : id;
  const student = students.find(s => s.id === studentId);

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [grade, setGrade] = useState('');
  const [lessonFee, setLessonFee] = useState('');
  const [gender, setGender] = useState<'Erkek' | 'Kız'>('Erkek');
  const [image, setImage] = useState<string | null>(null);
  const [statusTag, setStatusTag] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'On Hold'>('Beginner');

  useEffect(() => {
    if (student) {
      setFullName(student.fullName);
      setPhoneNumber(student.phoneNumber);
      setGrade(student.grade);
      setLessonFee(student.lessonFee.toString());
      setGender(student.gender);
      setImage(student.image || null);
      setStatusTag(student.statusTag || 'Beginner');
    }
  }, [student]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.error'), 'Gallery permission required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.error'), 'Camera permission required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!fullName || !grade || !lessonFee || !student) {
      Alert.alert(t('common.error'), t('common.noData'));
      return;
    }

    try {
      await updateStudent({
        ...student,
        fullName: sanitizeText(fullName, 100),
        phoneNumber: sanitizePhone(phoneNumber),
        grade: sanitizeText(grade, 50),
        gender,
        lessonFee: sanitizeNumber(lessonFee),
        image,
        statusTag,
      });
      Alert.alert(t('common.welcome'), t('common.save'));
      router.back();
    } catch (error) {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  if (!student) return null;

  const themeColor = teacher?.themeColor || Colors.primary;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('common.edit')}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <View style={styles.imageWrapper}>
            {image ? (
              <Image source={{ uri: image }} style={styles.profileImage} />
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: themeColor + '20' }]}>
                <User size={40} color={themeColor} />
              </View>
            )}
            <TouchableOpacity style={[styles.deletePhoto, { backgroundColor: Colors.error }]} onPress={() => setImage(null)}>
              <X size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
              <ImageIcon size={20} color={themeColor} />
              <Text style={[styles.photoBtnText, { color: themeColor }]}>{t('students.selectPhoto')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
              <Camera size={20} color={themeColor} />
              <Text style={[styles.photoBtnText, { color: themeColor }]}>{t('students.takePhoto')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('profile.fullName')}</Text>
          <View style={styles.inputContainer}>
            <User size={20} color={Colors.textSecondary} style={styles.icon} />
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} maxLength={100} />
          </View>
        </View>

        {/* Status Tag */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('students.level')}</Text>
          <View style={styles.tagSelector}>
            {(['Beginner', 'Intermediate', 'Advanced', 'On Hold'] as const).map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagBtn,
                  statusTag === tag && {
                    backgroundColor: tag === 'Beginner' ? '#3B82F6' :
                      tag === 'Intermediate' ? '#10B981' :
                        tag === 'Advanced' ? '#8B5CF6' : '#F59E0B'
                  }
                ]}
                onPress={() => setStatusTag(tag)}
              >
                <Text style={[styles.tagText, statusTag === tag && styles.tagTextActive]}>
                  {t(`students.${tag.toLowerCase().replace(' ', '')}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('students.phoneNumber')}</Text>
          <View style={styles.inputContainer}>
            <Phone size={20} color={Colors.textSecondary} style={styles.icon} />
            <TextInput style={styles.input} keyboardType="phone-pad" value={phoneNumber} onChangeText={setPhoneNumber} maxLength={15} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('students.grade')}</Text>
          <View style={styles.inputContainer}>
            <BookOpen size={20} color={Colors.textSecondary} style={styles.icon} />
            <TextInput style={styles.input} value={grade} onChangeText={setGrade} maxLength={50} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('students.lessonFee')} ({settings.currency})</Text>
          <View style={styles.inputContainer}>
            <Banknote size={20} color={Colors.textSecondary} style={styles.icon} />
            <TextInput style={styles.input} keyboardType="numeric" value={lessonFee} onChangeText={setLessonFee} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('students.gender')}</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[styles.genderBtn, gender === 'Erkek' && styles.genderBtnActive]}
              onPress={() => setGender('Erkek')}
            >
              <Text style={[styles.genderText, gender === 'Erkek' && styles.genderTextActive]}>{t('students.male')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderBtn, gender === 'Kız' && styles.genderBtnActive]}
              onPress={() => setGender('Kız')}
            >
              <Text style={[styles.genderText, gender === 'Kız' && styles.genderTextActive]}>{t('students.female')}</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  form: { padding: 24 },
  photoSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, padding: 4 },
  imageWrapper: { position: 'relative' },
  imagePlaceholder: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed' },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  deletePhoto: { position: 'absolute', right: 0, bottom: 0, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  photoButtons: { marginLeft: 20, flex: 1, gap: 10 },
  photoBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  photoBtnText: { marginLeft: 8, fontWeight: '600', fontSize: 14 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  tagSelector: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tagBtn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  tagText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tagTextActive: { color: '#FFF' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12 },
  icon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: Colors.text },
  genderContainer: { flexDirection: 'row', gap: 12 },
  genderBtn: { flex: 1, padding: 14, borderRadius: 16, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  genderBtnActive: { backgroundColor: Colors.background, borderColor: Colors.primary },
  genderText: { fontSize: 16, color: Colors.textSecondary, fontWeight: '600' },
  genderTextActive: { color: Colors.primary },
  footer: { padding: 24, paddingBottom: 40, backgroundColor: Colors.card },
  saveButton: { padding: 18, borderRadius: 16, alignItems: 'center' },
  saveButtonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
});