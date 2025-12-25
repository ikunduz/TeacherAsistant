import { useRouter } from 'expo-router';
import { ChevronLeft, Database, Eye, Lock, Server, Shield, Smartphone } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../src/constants/Colors';
import { useData } from '../src/context/DataContext';

interface SecurityItem {
    icon: React.ReactNode;
    title: string;
    description: string;
}

export default function PrivacyScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { teacher } = useData();

    const themeColor = teacher?.themeColor || Colors.primary;

    const securityItems: SecurityItem[] = [
        {
            icon: <Smartphone size={24} color={themeColor} />,
            title: t('privacy.localStorageTitle') || 'Yerel Depolama',
            description: t('privacy.localStorageDesc') || 'Tüm verileriniz yalnızca cihazınızda saklanır. Sunucuya hiçbir kişisel veri gönderilmez.',
        },
        {
            icon: <Lock size={24} color={themeColor} />,
            title: t('privacy.encryptionTitle') || 'Şifreleme',
            description: t('privacy.encryptionDesc') || 'Hassas veriler cihazınızın güvenli depolama alanında şifrelenmiş olarak tutulur.',
        },
        {
            icon: <Eye size={24} color={themeColor} />,
            title: t('privacy.noTrackingTitle') || 'İzleme Yok',
            description: t('privacy.noTrackingDesc') || 'Kullanıcı davranışları izlenmez, analitik verileri toplanmaz.',
        },
        {
            icon: <Server size={24} color={themeColor} />,
            title: t('privacy.noCloudTitle') || 'Bulut Yedekleme Yok',
            description: t('privacy.noCloudDesc') || 'Verileriniz otomatik olarak buluta yedeklenmez. Dışa aktarma özelliğiyle manuel yedek alabilirsiniz.',
        },
        {
            icon: <Database size={24} color={themeColor} />,
            title: t('privacy.dataControlTitle') || 'Veri Kontrolü',
            description: t('privacy.dataControlDesc') || 'Tüm verilerinizi istediğiniz zaman dışa aktarabilir veya silebilirsiniz.',
        },
        {
            icon: <Shield size={24} color={themeColor} />,
            title: t('privacy.permissionsTitle') || 'Minimum İzinler',
            description: t('privacy.permissionsDesc') || 'Uygulama sadece gerekli izinleri ister: Bildirimler ve Galeri (logo için).',
        },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={Colors.iosBlue} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('profile.privacy')}</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {/* Intro */}
                <View style={styles.introCard}>
                    <Shield size={40} color={themeColor} />
                    <Text style={styles.introTitle}>{t('privacy.introTitle') || 'Verileriniz Güvende'}</Text>
                    <Text style={styles.introText}>
                        {t('privacy.introText') || 'Öğretmen Yardımcısı, gizliliğinizi ön planda tutar. Tüm verileriniz yalnızca cihazınızda saklanır.'}
                    </Text>
                </View>

                {/* Security Items */}
                {securityItems.map((item, index) => (
                    <View key={index} style={styles.card}>
                        <View style={[styles.iconContainer, { backgroundColor: themeColor + '15' }]}>
                            {item.icon}
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardDescription}>{item.description}</Text>
                        </View>
                    </View>
                ))}

                {/* Footer Note */}
                <View style={styles.footerNote}>
                    <Text style={styles.footerText}>
                        {t('privacy.footerNote') || 'Herhangi bir sorunuz varsa destek ekibimizle iletişime geçebilirsiniz.'}
                    </Text>
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
    contentContainer: {
        padding: 16,
    },
    introCard: {
        backgroundColor: Colors.card,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    introTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    introText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    card: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 13,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
    footerNote: {
        marginTop: 16,
        padding: 16,
        backgroundColor: Colors.primaryLight,
        borderRadius: 12,
    },
    footerText: {
        fontSize: 13,
        color: Colors.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
