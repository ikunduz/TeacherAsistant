import { Book, Coins, DollarSign, Download, Euro, Globe, GraduationCap, PoundSterling, Save, Upload, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';
import { Colors as ThemeColors } from '../../src/constants/Colors';
import { useData } from '../../src/context/DataContext';
import { BackupService } from '../../src/services/backup';

const themeColors = [
  { key: 'default', color: '#007AFF' },
  { key: 'rose', color: '#F687B3' },
  { key: 'emerald', color: '#10B981' },
  { key: 'amber', color: '#F59E0B' },
  { key: 'violet', color: '#8B5CF6' },
  { key: 'slate', color: '#475569' },
];

const currencies = [
  { label: 'Dollar ($)', value: '$', icon: DollarSign },
  { label: 'Euro (€)', value: '€', icon: Euro },
  { label: 'Lira (₺)', value: '₺', icon: Coins },
  { label: 'Pound (£)', value: '£', icon: PoundSterling },
];

const languages = [
  { label: 'English', value: 'en' },
  { label: 'Türkçe', value: 'tr' },
];

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { teacher, setTeacher, refreshData, settings, updateSettings } = useData();

  const [fullName, setFullName] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [selectedColor, setSelectedColor] = useState(ThemeColors.primary);
  const [selectedCurrency, setSelectedCurrency] = useState('$');
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  useEffect(() => {
    if (teacher) {
      setFullName(teacher.fullName || '');
      setSubject(teacher.subject || '');
      setSelectedColor(teacher.themeColor || ThemeColors.primary);
    }
    if (settings) {
      setCategory(settings.instructionCategory || '');
      setSelectedCurrency(settings.currency || '$');
      setSelectedLanguage(settings.language || i18n.language);
    }
  }, [teacher, settings]);

  const handleSave = async () => {
    if (!fullName || !subject) {
      Alert.alert(t('common.error'), t('profile.saveError'));
      return;
    }
    try {
      await Promise.all([
        setTeacher({ fullName, subject, themeColor: selectedColor }),
        updateSettings({
          currency: selectedCurrency as any,
          instructionCategory: category,
          language: selectedLanguage
        })
      ]);
      Alert.alert(t('common.welcome'), t('profile.saveSuccess'));
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.saveError'));
    }
  };

  const currentThemeColor = selectedColor || ThemeColors.primary;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: ThemeColors.card }]}>
        <Text style={styles.title}>{t('profile.title')} & {t('profile.settings')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
        {/* Ad Soyad */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('profile.fullName')}</Text>
          <View style={styles.inputContainer}>
            <User size={20} color={ThemeColors.textSecondary} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Ayşe Yılmaz"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
        </View>

        {/* Branş */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('profile.subject')}</Text>
          <View style={styles.inputContainer}>
            <Book size={20} color={ThemeColors.textSecondary} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Mathematics"
              placeholderTextColor="#999"
              value={subject}
              onChangeText={setSubject}
            />
          </View>
        </View>

        {/* Uzmanlık Alanı (Category) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('profile.instructionCategory')}</Text>
          <View style={styles.inputContainer}>
            <GraduationCap size={20} color={ThemeColors.textSecondary} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Swimming"
              placeholderTextColor="#999"
              value={category}
              onChangeText={setCategory}
            />
          </View>
        </View>

        {/* Language Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('profile.language')}</Text>
          <View style={styles.currencyGrid}>
            {languages.map(lang => (
              <TouchableOpacity
                key={lang.value}
                style={[
                  styles.currencyOption,
                  selectedLanguage === lang.value && { backgroundColor: currentThemeColor, borderColor: currentThemeColor }
                ]}
                onPress={() => setSelectedLanguage(lang.value)}
              >
                <Globe size={18} color={selectedLanguage === lang.value ? '#FFF' : ThemeColors.text} />
                <Text style={[styles.currencyText, selectedLanguage === lang.value && styles.selectedCurrencyText]}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Currency Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('profile.currency')}</Text>
          <View style={styles.currencyGrid}>
            {currencies.map(curr => (
              <TouchableOpacity
                key={curr.value}
                style={[
                  styles.currencyOption,
                  selectedCurrency === curr.value && { backgroundColor: currentThemeColor, borderColor: currentThemeColor }
                ]}
                onPress={() => setSelectedCurrency(curr.value)}
              >
                <curr.icon size={20} color={selectedCurrency === curr.value ? '#FFF' : ThemeColors.text} />
                <Text style={[styles.currencyText, selectedCurrency === curr.value && styles.selectedCurrencyText]}>
                  {curr.value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Renk Seçimi */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('profile.themeColor')}</Text>
          <View style={styles.colorGrid}>
            {themeColors.map(theme => (
              <TouchableOpacity
                key={theme.key}
                style={[
                  styles.colorDot,
                  { backgroundColor: theme.color },
                  selectedColor === theme.color && styles.selectedColorDot
                ]}
                onPress={() => setSelectedColor(theme.color)}
              >
                {selectedColor === theme.color && <View style={styles.colorDotInner} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Yedekleme Alanı */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('profile.backupRestoreTitle')}</Text>
          <View style={styles.backupContainer}>
            <TouchableOpacity style={styles.backupButton} onPress={() => BackupService.exportData()}>
              <Download size={20} color={ThemeColors.text} />
              <Text style={styles.backupButtonText}>{t('profile.backup')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backupButton} onPress={() => BackupService.importData(refreshData)}>
              <Upload size={20} color={ThemeColors.text} />
              <Text style={styles.backupButtonText}>{t('profile.restore')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: currentThemeColor }]} onPress={handleSave}>
          <Save size={20} color="#FFF" />
          <Text style={styles.saveButtonText}>{t('common.save')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ThemeColors.background },
  header: {
    backgroundColor: ThemeColors.card,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: ThemeColors.border,
  },
  title: { fontSize: 24, fontWeight: '900', color: ThemeColors.text, textAlign: 'center' },
  formContainer: { padding: 24 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '700', color: ThemeColors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ThemeColors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: ThemeColors.border,
    paddingHorizontal: 16,
  },
  icon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: ThemeColors.text, fontWeight: '500' },
  currencyGrid: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  currencyOption: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ThemeColors.card,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: ThemeColors.border,
    gap: 6,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '700',
    color: ThemeColors.text,
  },
  selectedCurrencyText: {
    color: '#FFF',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorDot: {
    borderWidth: 3,
    borderColor: ThemeColors.text,
  },
  colorDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFF',
  },
  backupContainer: { flexDirection: 'row', gap: 12 },
  backupButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ThemeColors.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: ThemeColors.border,
    gap: 10,
  },
  backupButtonText: { fontSize: 14, color: ThemeColors.text, fontWeight: '700' },
  footer: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: ThemeColors.card,
    borderTopWidth: 1,
    borderTopColor: ThemeColors.border,
  },
  saveButton: {
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
});
