
// app/(tabs)/profile.tsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert
} from 'react-native';
import { useData } from '../../src/context/DataContext';

// İKONLAR: Eğer lucide-react-native yüklü değilse hata verebilir.
// Yüklü değilse terminale: "npm install lucide-react-native react-native-svg" yazmalısın.
// Eğer yüklemekle uğraşmak istemezsen bu satırı silip yerine Ionicons kullanabiliriz.
import { User, Book, Save, Download, Upload } from 'lucide-react-native';
import { BackupService } from '../../src/services/backup';

// RENKLER: Hata almamak için renkleri buraya tanımladım.
const Colors = {
  primary: '#007AFF',
  background: '#f5f5f5',
  card: '#ffffff',
  text: '#333333',
  textSecondary: '#888888',
  border: '#e0e0e0',
};

const themeColors = [
  { name: 'Varsayılan', color: '#F687B3' }, // Pastel Pembe
  { name: 'Gök Mavi', color: '#BEE3F8' },   // Pastel Mavi
  { name: 'Nane Yeşili', color: '#C6F6D5' }, // Pastel Yeşil
  { name: 'Şeftali', color: '#FEEBC8' },     // Pastel Turuncu
  { name: 'Lavanta', color: '#E9D8FD' },     // Pastel Mor
  { name: 'Somon', color: '#FED7D7' },       // Pastel Kırmızı
  { name: 'Krem', color: '#FFFFF0' },        // Krem
];

export default function ProfileScreen() {
  const { teacher, setTeacher, refreshData } = useData();

  // State tanımları
  const [fullName, setFullName] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedColor, setSelectedColor] = useState(Colors.primary);

  // Veriler yüklenince state'i güncelle
  useEffect(() => {
    if (teacher) {
      setFullName(teacher.fullName || '');
      setSubject(teacher.subject || '');
      setSelectedColor(teacher.themeColor || Colors.primary);
    }
  }, [teacher]);

  const handleSave = async () => {
    if (!fullName || !subject) {
      Alert.alert('Eksik Bilgi', 'Lütfen adınızı ve branşınızı girin.');
      return;
    }
    try {
      await setTeacher({ fullName, subject, themeColor: selectedColor });
      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
    } catch (error) {
      Alert.alert('Hata', 'Bilgiler kaydedilemedi.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: Colors.card }]}>
        <Text style={styles.title}>Profil ve Ayarlar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        {/* Ad Soyad */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Adınız Soyadınız</Text>
          <View style={styles.inputContainer}>
            <User size={20} color={Colors.textSecondary} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Örn: Ayşe Yılmaz"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
        </View>

        {/* Branş */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Branşınız</Text>
          <View style={styles.inputContainer}>
            <Book size={20} color={Colors.textSecondary} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Örn: Matematik Öğretmeni"
              placeholderTextColor="#999"
              value={subject}
              onChangeText={setSubject}
            />
          </View>
        </View>

        {/* Renk Seçimi */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Uygulama Tema Rengi</Text>
          <View style={styles.colorGrid}>
            {themeColors.map(theme => (
              <TouchableOpacity
                key={theme.name}
                style={[
                  styles.colorOption,
                  { backgroundColor: theme.color },
                  selectedColor === theme.color && styles.selectedBorder // Seçili olana çerçeve ekle
                ]}
                onPress={() => setSelectedColor(theme.color)}
              >
                {selectedColor === theme.color && <View style={styles.colorSelectedIndicator} />}
                <Text style={[styles.colorName, { color: '#fff' }]}>{theme.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Yedekleme Alanı */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Veri ve Yedekleme</Text>
          <View style={styles.backupContainer}>
            <TouchableOpacity style={styles.backupButton} onPress={() => BackupService.exportData()}>
              <Download size={20} color={Colors.text} />
              <Text style={styles.backupButtonText}>Yedekle (Dışa Aktar)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backupButton} onPress={() => BackupService.importData(refreshData)}>
              <Upload size={20} color={Colors.text} />
              <Text style={styles.backupButtonText}>Yedeği Geri Yükle</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.backupHint}>
            Verilerinizi kaybetmemek için düzenli olarak yedek alıp dosyanızı güvenli bir yerde (Google Drive, E-posta vb.) saklayın.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: selectedColor }]} onPress={handleSave}>
          <Save size={20} color="#000" />
          <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' }, // Arka planı hafif gri yaptım, şeffaf sorun çıkarabilir
  header: {
    backgroundColor: Colors.card,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
  formContainer: { padding: 24 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 10 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: Colors.text },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent', // Varsayılan çerçeve yok
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  selectedBorder: {
    borderColor: '#000', // Seçili olunca siyah çerçeve
    borderWidth: 3,
  },
  colorSelectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  colorName: {
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  saveButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  backupContainer: { gap: 12 },
  backupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  backupButtonText: { fontSize: 16, color: Colors.text, fontWeight: '500' },
  backupHint: { fontSize: 12, color: Colors.textSecondary, marginTop: 8, lineHeight: 18 },
});
