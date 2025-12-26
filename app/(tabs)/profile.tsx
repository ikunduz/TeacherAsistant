import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, ThemePresets } from '../../src/constants/Colors';
import { useData } from '../../src/context/DataContext';
import i18n from '../../src/i18n/config';
import { NotificationService } from '../../src/services/notifications';
import { StorageService } from '../../src/services/storage';

const currencies = [
  { key: '$', label: 'USD ($)' },
  { key: '€', label: 'EUR (€)' },
  { key: '£', label: 'GBP (£)' },
  { key: '₺', label: 'TRY (₺)' },
];

const languages = [
  { key: 'en', label: 'English' },
  { key: 'tr', label: 'Türkçe' },
];

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { teacher, settings, setTeacher, updateSettings, refreshData } = useData();

  // Form states
  const [fullName, setFullName] = useState('');
  const [subject, setSubject] = useState('');
  const [businessLogo, setBusinessLogo] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(Colors.primary);
  const [usePdfBranding, setUsePdfBranding] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [notifications, setNotifications] = useState(false);
  const [isColorPickerExpanded, setIsColorPickerExpanded] = useState(false);

  useEffect(() => {
    // Sadece başlangıçta veya teacher/settings yüklendiğinde bir kez doldur
    if (teacher && !fullName) {
      setFullName(teacher.fullName || '');
      setSubject(teacher.subject || '');
      setBusinessLogo(teacher.businessLogo || null);
      setSelectedColor(teacher.themeColor || Colors.primary);
    }
    if (settings && !selectedCurrency) {
      setSelectedCurrency(settings.currency || '$');
      setSelectedLanguage(settings.language || 'en');
    }
  }, [teacher, settings]);

  const handleSave = async () => {
    try {
      await Promise.all([
        setTeacher({
          fullName,
          subject,
          themeColor: selectedColor,
          businessLogo: businessLogo || undefined,
          businessColor: selectedColor,
        }),
        updateSettings({
          currency: selectedCurrency as any,
          language: selectedLanguage,
        }),
      ]);
      i18n.changeLanguage(selectedLanguage);
      Alert.alert(t('common.success'), t('profile.saveSuccess'));
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.saveError'));
    }
  };

  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setBusinessLogo(result.assets[0].uri);
    }
  };

  const handleExportData = async () => {
    try {
      const [teacherData, studentsData, lessonsData, paymentsData, groupsData, settingsData] = await Promise.all([
        StorageService.getTeacher(),
        StorageService.getStudents(),
        StorageService.getLessons(),
        StorageService.getPayments(),
        StorageService.getGroups(),
        StorageService.getSettings(),
      ]);

      const backupData = {
        version: 1,
        exportDate: new Date().toISOString(),
        teacher: teacherData,
        students: studentsData,
        lessons: lessonsData,
        payments: paymentsData,
        groups: groupsData,
        settings: settingsData,
      };

      const fileName = `coachpro_backup_${new Date().toISOString().split('T')[0]}.json`;
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(backupData, null, 2));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
      } else {
        Alert.alert(t('common.success'), t('profile.backupSuccess'));
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.backupError'));
    }
  };

  const handleImportData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const fileUri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(fileUri);
      const backupData = JSON.parse(content);

      if (!backupData.version || !backupData.students) {
        Alert.alert(t('common.error'), t('profile.restoreError'));
        return;
      }

      Alert.alert(
        t('profile.restore'),
        t('profile.restoreConfirm') || 'Bu işlem mevcut verilerinizin üzerine yazacaktır. Devam etmek istiyor musunuz?',
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.add'),
            onPress: async () => {
              if (backupData.teacher) await StorageService.saveTeacher(backupData.teacher);
              if (backupData.students) await StorageService.saveStudents(backupData.students);
              if (backupData.lessons) await StorageService.saveLessons(backupData.lessons);
              if (backupData.payments) await StorageService.savePayments(backupData.payments);
              if (backupData.groups) await StorageService.saveGroups(backupData.groups);
              if (backupData.settings) await StorageService.saveSettings(backupData.settings);

              await refreshData();
              Alert.alert(t('common.success'), t('profile.restoreSuccess'));
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.restoreError'));
    }
  };

  const handleResetData = () => {
    Alert.alert(
      t('profile.resetData'),
      t('profile.resetDataDesc'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              Alert.alert(t('common.success'), t('profile.dataCleared'));
              refreshData();
            } catch (e) {
              Alert.alert(t('common.error'), t('common.error'));
            }
          },
        },
      ]
    );
  };



  return (
    <View style={styles.container}>
      {/* iOS-style Nav Bar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navButton}>
          <ChevronLeft size={24} color={Colors.iosBlue} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t('profile.title')}</Text>
        <TouchableOpacity onPress={handleSave} style={styles.navButton}>
          <Text style={styles.doneButton}>{t('common.save')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Teacher Info Section */}
        <Text style={styles.sectionHeader}>{t('profile.teacherInfo').toUpperCase()}</Text>
        <View style={styles.card}>
          {/* Avatar Row */}
          <TouchableOpacity style={styles.avatarRow} onPress={pickLogo}>
            {businessLogo ? (
              <Image source={{ uri: businessLogo }} style={styles.avatar} />
            ) : (
              <Image
                source={require('../../assets/images/icon.png')}
                style={styles.avatar}
                resizeMode="contain"
              />
            )}
            <View style={styles.avatarInfo}>
              <Text style={styles.avatarName}>{fullName || t('profile.fullName')}</Text>
              <Text style={styles.avatarSub}>{subject || t('profile.subject')}</Text>
            </View>
          </TouchableOpacity>

          {/* Full Name Row */}
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>{t('profile.fullName')}</Text>
            <TextInput
              style={styles.listInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder={t('profile.fullName')}
              placeholderTextColor={Colors.textMuted}
              textAlign="right"
            />
          </View>

          {/* Subject Row */}
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>{t('profile.subject')}</Text>
            <TextInput
              style={styles.listInput}
              value={subject}
              onChangeText={setSubject}
              placeholder={t('profile.subject')}
              placeholderTextColor={Colors.textMuted}
              textAlign="right"
            />
          </View>
        </View>

        {/* Branding Section */}
        <Text style={styles.sectionHeader}>{t('profile.branding').toUpperCase()}</Text>
        <View style={styles.card}>
          {/* Upload Business Logo */}
          <TouchableOpacity style={styles.listItem} onPress={pickLogo}>
            <Text style={styles.listItemText}>{t('profile.uploadLogo')}</Text>
            <View style={styles.logoPreview}>
              {businessLogo ? (
                <Image source={{ uri: businessLogo }} style={styles.logoThumb} />
              ) : (
                <Image
                  source={require('../../assets/images/icon.png')}
                  style={styles.logoThumb}
                  resizeMode="contain"
                />
              )}
            </View>
          </TouchableOpacity>

          {/* Select Brand Color */}
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => setIsColorPickerExpanded(!isColorPickerExpanded)}
          >
            <Text style={styles.listItemText}>{t('profile.selectColor')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={[styles.colorSwatch, { backgroundColor: selectedColor }]} />
              <ChevronRight
                size={20}
                color={Colors.iosSeparator}
                style={{ transform: [{ rotate: isColorPickerExpanded ? '90deg' : '0deg' }] }}
              />
            </View>
          </TouchableOpacity>

          {isColorPickerExpanded && (
            <View style={styles.expandedColorPicker}>
              {ThemePresets.map((preset) => (
                <TouchableOpacity
                  key={preset.key}
                  style={[
                    styles.colorSwatchLarge,
                    { backgroundColor: preset.color },
                    selectedColor === preset.color && styles.colorSwatchLargeSelected,
                  ]}
                  onPress={() => setSelectedColor(preset.color)}
                >
                  {selectedColor === preset.color && (
                    <View style={styles.selectedCheck}>
                      <View style={styles.checkInner} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Use on PDF Reports */}
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>{t('profile.usePdfReports')}</Text>
            <Switch
              value={usePdfBranding}
              onValueChange={setUsePdfBranding}
              trackColor={{ false: '#E9E9EA', true: Colors.iosGreen }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Localization Section */}
        <Text style={styles.sectionHeader}>{t('profile.localization').toUpperCase()}</Text>
        <View style={styles.card}>
          <View style={styles.localizationRow}>
            {/* Currency */}
            <View style={styles.localizationColumn}>
              <Text style={styles.localizationLabel}>{t('profile.currency')}</Text>
              <View style={styles.segmentedControl}>
                {currencies.slice(0, 4).map((c) => (
                  <TouchableOpacity
                    key={c.key}
                    style={[
                      styles.segmentButton,
                      selectedCurrency === c.key && styles.segmentButtonActive,
                    ]}
                    onPress={() => setSelectedCurrency(c.key)}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        selectedCurrency === c.key && styles.segmentTextActive,
                      ]}
                    >
                      {c.key}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Divider */}
            <View style={styles.localizationDivider} />

            {/* Language */}
            <View style={styles.localizationColumn}>
              <Text style={styles.localizationLabel}>{t('profile.language')}</Text>
              <View style={styles.segmentedControl}>
                {languages.map((l) => (
                  <TouchableOpacity
                    key={l.key}
                    style={[
                      styles.segmentButton,
                      selectedLanguage === l.key && styles.segmentButtonActive,
                    ]}
                    onPress={() => {
                      setSelectedLanguage(l.key);
                      i18n.changeLanguage(l.key);
                    }}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        selectedLanguage === l.key && styles.segmentTextActive,
                      ]}
                    >
                      {l.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* App Preferences Section */}
        <Text style={styles.sectionHeader}>{t('profile.preferences').toUpperCase()}</Text>
        <View style={styles.card}>
          {/* Instruction Category */}
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => router.push('/onboarding/category' as any)}
          >
            <Text style={styles.listItemText}>{t('profile.instructionCategory')}</Text>
            <ChevronRight size={20} color={Colors.iosSeparator} />
          </TouchableOpacity>

          {/* Notifications */}
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>{t('profile.notifications')}</Text>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={async (value) => {
                if (value) {
                  const granted = await NotificationService.requestPermissions();
                  if (granted) {
                    await updateSettings({ notificationsEnabled: true });
                  } else {
                    Alert.alert(t('common.error'), t('profile.notificationPermissionDenied') || 'Bildirim izni verilmedi.');
                  }
                } else {
                  await updateSettings({ notificationsEnabled: false });
                }
              }}
              trackColor={{ false: '#E9E9EA', true: Colors.iosGreen }}
              thumbColor="#FFF"
            />
          </View>

          {/* Privacy & Security */}
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => router.push('/privacy' as any)}
          >
            <Text style={styles.listItemText}>{t('profile.privacy')}</Text>
            <ChevronRight size={20} color={Colors.iosSeparator} />
          </TouchableOpacity>

          {/* Help & Support */}
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => router.push('/help')}
          >
            <Text style={styles.listItemText}>{t('profile.help')}</Text>
            <ChevronRight size={20} color={Colors.iosSeparator} />
          </TouchableOpacity>
        </View>

        {/* Backup & Restore Section */}
        <Text style={styles.sectionHeader}>{t('profile.backupRestoreTitle').toUpperCase()}</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.listItem} onPress={handleExportData}>
            <Text style={styles.listItemText}>{t('profile.backup')}</Text>
            <ChevronRight size={20} color={Colors.iosSeparator} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.listItem} onPress={handleImportData}>
            <Text style={styles.listItemText}>{t('profile.restore')}</Text>
            <ChevronRight size={20} color={Colors.iosSeparator} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.listItem} onPress={handleResetData}>
            <Text style={[styles.listItemText, { color: Colors.iosRed }]}>{t('profile.resetData')}</Text>
            <ChevronRight size={20} color={Colors.iosSeparator} />
          </TouchableOpacity>
        </View>



        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.iosBg,
  },

  // Navbar
  navbar: {
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
  navButton: {
    padding: 4,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
  },
  doneButton: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.iosBlue,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 24,
  },

  // Section Header
  sectionHeader: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6D6D72',
    marginHorizontal: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },

  // Card
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 32,
    overflow: 'hidden',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  // Avatar Row
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInfo: {
    flex: 1,
  },
  avatarName: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  avatarSub: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // List Item
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  listItemText: {
    fontSize: 17,
    color: Colors.text,
  },
  listInput: {
    flex: 1,
    fontSize: 17,
    color: Colors.textSecondary,
    marginLeft: 16,
    paddingVertical: 8,
  },

  // Logo Preview
  logoPreview: {
    width: 32,
    height: 32,
    borderRadius: 4,
    overflow: 'hidden',
  },
  logoThumb: {
    width: 32,
    height: 32,
  },
  logoPlaceholder: {
    width: 32,
    height: 32,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Color Swatches
  colorSwatches: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  colorSwatchSelected: {
    borderWidth: 2,
    borderColor: Colors.iosBlue,
  },
  expandedColorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    justifyContent: 'center',
  },
  colorSwatchLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  colorSwatchLargeSelected: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
  selectedCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.iosBlue,
  },

  // Localization
  localizationRow: {
    flexDirection: 'row',
    padding: 16,
  },
  localizationColumn: {
    flex: 1,
    alignItems: 'center',
  },
  localizationDivider: {
    width: 1,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 8,
  },
  localizationLabel: {
    fontSize: 15,
    color: Colors.text,
    marginBottom: 8,
  },

  // Segmented Control
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#EEEFF4',
    borderRadius: 8,
    padding: 2,
    width: '100%',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: Colors.card,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontSize: 13,
    color: Colors.text,
  },
  segmentTextActive: {
    fontWeight: '500',
  },

  // Sign Out Button
  signOutButton: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  signOutText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.iosRed,
  },
});
