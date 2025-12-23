import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Globe } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
        router.replace('/(tabs)');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Colors.primary, '#6366F1']}
                style={styles.header}
            >
                <Globe size={80} color="#FFFFFF" strokeWidth={1.5} />
                <Text style={styles.title}>{t('onboarding.selectLanguage')}</Text>
            </LinearGradient>

            <View style={styles.content}>
                <TouchableOpacity
                    style={styles.languageCard}
                    onPress={() => handleLanguageSelect('en')}
                >
                    <Text style={styles.flag}>🇺🇸</Text>
                    <View>
                        <Text style={styles.languageName}>English</Text>
                        <Text style={styles.languageSub}>Default Language</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.languageCard}
                    onPress={() => handleLanguageSelect('tr')}
                >
                    <Text style={styles.flag}>🇹🇷</Text>
                    <View>
                        <Text style={styles.languageName}>Türkçe</Text>
                        <Text style={styles.languageSub}>İkinci Dil</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        height: '40%',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: 20,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    content: {
        flex: 1,
        padding: 24,
        marginTop: -40,
    },
    languageCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    flag: {
        fontSize: 40,
        marginRight: 20,
    },
    languageName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1E293B',
    },
    languageSub: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 2,
    },
});
