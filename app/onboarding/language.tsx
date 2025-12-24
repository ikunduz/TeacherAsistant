import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../src/constants/Colors';
import { useData } from '../../src/context/DataContext';

const { width } = Dimensions.get('window');

export default function LanguageOnboarding() {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const { updateSettings } = useData();

    const handleLanguageSelect = async (lang: string) => {
        await i18n.changeLanguage(lang);
        await AsyncStorage.setItem('@app_language', lang);
        await updateSettings({ language: lang });
        router.replace('/onboarding/category' as any);
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Colors.primary, '#6366F1']}
                style={styles.header}
            >
                <View style={styles.iconContainer}>
                    <Image
                        source={require('../../assets/images/icon.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
                <Text style={styles.title}>{t('onboarding.selectLanguage')}</Text>
                <Text style={styles.subtitle}>Choose your preferred language</Text>
            </LinearGradient>

            <View style={styles.content}>
                <TouchableOpacity
                    style={styles.languageCard}
                    onPress={() => handleLanguageSelect('en')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.flag}>🇺🇸</Text>
                    <View style={styles.languageInfo}>
                        <Text style={styles.languageName}>English</Text>
                        <Text style={styles.languageSub}>Default Language</Text>
                    </View>
                    <View style={styles.arrow}>
                        <Text style={styles.arrowText}>→</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.languageCard}
                    onPress={() => handleLanguageSelect('tr')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.flag}>🇹🇷</Text>
                    <View style={styles.languageInfo}>
                        <Text style={styles.languageName}>Türkçe</Text>
                        <Text style={styles.languageSub}>İkinci Dil</Text>
                    </View>
                    <View style={styles.arrow}>
                        <Text style={styles.arrowText}>→</Text>
                    </View>
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
    header: {
        paddingTop: 100,
        paddingBottom: 60,
        alignItems: 'center',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 30,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        overflow: 'hidden',
    },
    logo: {
        width: 80,
        height: 80,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    content: {
        flex: 1,
        padding: 24,
        marginTop: -30,
    },
    languageCard: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    flag: {
        fontSize: 40,
    },
    languageInfo: {
        flex: 1,
        marginLeft: 16,
    },
    languageName: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    languageSub: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    arrow: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.iosBg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowText: {
        fontSize: 18,
        color: Colors.primary,
        fontWeight: '600',
    },
});
