import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { StorageService } from './storage';

export const BackupService = {
    async exportData() {
        try {
            // 1. Tüm verileri çek
            const [teacher, students, lessons, payments, groups] = await Promise.all([
                StorageService.getTeacher(),
                StorageService.getStudents(),
                StorageService.getLessons(),
                StorageService.getPayments(),
                StorageService.getGroups(),
            ]);

            const backupData = {
                version: 1,
                timestamp: new Date().toISOString(),
                data: { teacher, students, lessons, payments, groups }
            };

            // 2. Dosyayı oluştur
            const fileName = `OgretmenYardimcisi_Yedek_${new Date().toISOString().split('T')[0]}.json`;
            const fileUri = ((FileSystem as any).cacheDirectory || '') + fileName;

            await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData, null, 2));

            // 3. Paylaş
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                Alert.alert('Hata', 'Paylaşım özelliği bu cihazda kullanılamıyor.');
            }
        } catch (error) {
            Alert.alert('Hata', 'Yedekleme oluşturulurken bir hata oluştu.');
        }
    },

    async importData(onSuccess: () => void) {
        try {
            // 1. Dosya seçtir
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true
            });

            if (result.canceled) return;

            const fileUri = result.assets[0].uri;
            const fileContent = await FileSystem.readAsStringAsync(fileUri);
            const parsed = JSON.parse(fileContent);

            // 2. Doğrula
            if (!parsed.data || !parsed.data.students) {
                Alert.alert('Hata', 'Geçersiz yedek dosyası.');
                return;
            }

            // 3. Onay iste
            Alert.alert(
                'Yedeği Geri Yükle',
                'Mevcut verilerinizin üzerine yazılacak. Emin misiniz?',
                [
                    { text: 'İptal', style: 'cancel' },
                    {
                        text: 'Evet, Yükle',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                // 4. Verileri kaydet
                                const { teacher, students, lessons, payments, groups } = parsed.data;

                                await Promise.all([
                                    teacher ? StorageService.saveTeacher(teacher) : Promise.resolve(),
                                    StorageService.saveStudents(students || []),
                                    StorageService.saveLessons(lessons || []),
                                    StorageService.savePayments(payments || []),
                                    StorageService.saveGroups(groups || [])
                                ]);

                                Alert.alert('Başarılı', 'Veriler başarıyla geri yüklendi.');
                                onSuccess(); // Context'i yenilemek için callback
                            } catch (e) {
                                Alert.alert('Hata', 'Veriler kaydedilemedi.');
                            }
                        }
                    }
                ]
            );

        } catch (error) {
            Alert.alert('Hata', 'Dosya okunamadı.');
        }
    }
};
