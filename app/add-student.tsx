import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Banknote, BookOpen, Camera, ChevronLeft, Clock, Image as ImageIcon, Phone, User, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors, TagColors } from '../src/constants/Colors';
import { useData } from '../src/context/DataContext';
import { sanitizeNumber, sanitizePhone, sanitizeText } from '../src/utils/validation';

export default function AddStudentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { addStudent, teacher, settings } = useData();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [grade, setGrade] = useState('');
  const [lessonFee, setLessonFee] = useState('');
  const [gender, setGender] = useState<'Erkek' | 'Kız'>('Erkek');
  const [image, setImage] = useState<string | null>(null);
  const [statusTag, setStatusTag] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'On Hold'>('Beginner');

  // Calendar states
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [lessonTime, setLessonTime] = useState('');
  const days = [
    { label: t('onboarding.days.mon', 'Mon'), value: 1 },
    { label: t('onboarding.days.tue', 'Tue'), value: 2 },
    { label: t('onboarding.days.wed', 'Wed'), value: 3 },
    { label: t('onboarding.days.thu', 'Thu'), value: 4 },
    { label: t('onboarding.days.fri', 'Fri'), value: 5 },
    { label: t('onboarding.days.sat', 'Sat'), value: 6 },
    { label: t('onboarding.days.sun', 'Sun'), value: 0 }
  ];

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
    if (!fullName || !grade || !lessonFee) {
      Alert.alert(t('common.error'), t('common.noData'));
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
        remainingLessons: 0,
        notes: '',
        lastTopic: '',
        homeworkNotes: '',
        createdAt: new Date().toISOString(),
        schedule: lessonTime ? selectedDays.map(day => ({ day, time: lessonTime })) : undefined,
        image,
        statusTag,
        metrics: [],
      });
      router.back();
    } catch (error) {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  const themeColor = teacher?.themeColor || Colors.primary;

  const statusColors = {
    'Beginner': TagColors.beginner,
    'Intermediate': TagColors.intermediate,
    'Advanced': TagColors.advanced,
    'On Hold': { bg: Colors.warningLight, text: '#92400E' },
  };

  return (
    <View style={styles.container}>
      {/* iOS-style Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.iosBlue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('students.addStudent')}</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveHeaderButton}>
          <Text style={[styles.saveHeaderText, { color: themeColor }]}>{t('common.save')}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Profile Photo Card */}
          <View style={styles.card}>
            <View style={styles.photoSection}>
              <View style={styles.imageWrapper}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.profileImage} />
                ) : (
                  <View style={[styles.imagePlaceholder, { backgroundColor: themeColor + '15' }]}>
                    <User size={40} color={themeColor} />
                  </View>
                )}
                {image && (
                  <TouchableOpacity style={styles.deletePhoto} onPress={() => setImage(null)}>
                    <X size={12} color="#FFF" />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.photoButtons}>
                <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
                  <ImageIcon size={18} color={themeColor} />
                  <Text style={[styles.photoBtnText, { color: themeColor }]}>{t('students.selectPhoto')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
                  <Camera size={18} color={themeColor} />
                  <Text style={[styles.photoBtnText, { color: themeColor }]}>{t('students.takePhoto')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Basic Info Card */}
          <Text style={styles.sectionHeader}>{t('profile.teacherInfo').toUpperCase()}</Text>
          <View style={styles.card}>
            {/* Full Name */}
            <View style={styles.inputRow}>
              <User size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder={t('profile.fullName')}
                placeholderTextColor={Colors.textMuted}
                value={fullName}
                onChangeText={setFullName}
                maxLength={100}
              />
            </View>
            <View style={styles.separator} />

            {/* Phone */}
            <View style={styles.inputRow}>
              <Phone size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="+1..."
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={15}
              />
            </View>
            <View style={styles.separator} />

            {/* Grade */}
            <View style={styles.inputRow}>
              <BookOpen size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder={t('students.grade')}
                placeholderTextColor={Colors.textMuted}
                value={grade}
                onChangeText={setGrade}
                maxLength={50}
              />
            </View>
            <View style={styles.separator} />

            {/* Lesson Fee */}
            <View style={styles.inputRow}>
              <Banknote size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder={`${t('students.lessonFee')} (${settings.currency})`}
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                value={lessonFee}
                onChangeText={setLessonFee}
              />
            </View>
          </View>

          {/* Level Selection */}
          <Text style={styles.sectionHeader}>{t('students.level').toUpperCase()}</Text>
          <View style={styles.card}>
            <View style={styles.tagSelector}>
              {(['Beginner', 'Intermediate', 'Advanced', 'On Hold'] as const).map((tag) => {
                const isSelected = statusTag === tag;
                const colors = statusColors[tag];
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagBtn,
                      { backgroundColor: isSelected ? colors.bg : Colors.background },
                      isSelected && { borderColor: colors.text }
                    ]}
                    onPress={() => setStatusTag(tag)}
                  >
                    <Text style={[styles.tagText, { color: isSelected ? colors.text : Colors.textSecondary }]}>
                      {t(`students.${tag.toLowerCase().replace(' ', '')}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Gender Selection */}
          <Text style={styles.sectionHeader}>{t('students.gender').toUpperCase()}</Text>
          <View style={styles.card}>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[styles.genderBtn, gender === 'Erkek' && { backgroundColor: themeColor + '15', borderColor: themeColor }]}
                onPress={() => setGender('Erkek')}
              >
                <Text style={[styles.genderText, gender === 'Erkek' && { color: themeColor }]}>{t('students.male')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderBtn, gender === 'Kız' && { backgroundColor: themeColor + '15', borderColor: themeColor }]}
                onPress={() => setGender('Kız')}
              >
                <Text style={[styles.genderText, gender === 'Kız' && { color: themeColor }]}>{t('students.female')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Schedule Selection */}
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
                placeholder="14:30"
                placeholderTextColor={Colors.textMuted}
                value={lessonTime}
                onChangeText={setLessonTime}
              />
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Save Button */}
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

  // Header
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

  // Photo Section
  photoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  imageWrapper: {
    position: 'relative',
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  deletePhoto: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  photoButtons: {
    flex: 1,
    gap: 8,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.iosBg,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 8,
  },
  photoBtnText: {
    fontSize: 14,
    fontWeight: '500',
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

  // Tag Selector
  tagSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
  },
  tagBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Gender
  genderContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  genderBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.iosBg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  genderText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
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

  // Footer
  footer: {
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
