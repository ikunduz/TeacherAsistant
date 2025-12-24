import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../src/constants/Colors';
import { useData } from '../../src/context/DataContext';
import { getCategoryIcon } from '../../src/utils/theme';

const CATEGORIES = [
    { id: 'academic', key: 'academic' },
    { id: 'music', key: 'music' },
    { id: 'sports', key: 'sports' },
    { id: 'arts', key: 'arts' },
    { id: 'fitness', key: 'fitness' },
    { id: 'professional', key: 'professional' },
];

export default function CategoryOnboarding() {
    const { t } = useTranslation();
    const router = useRouter();
    const { updateSettings } = useData();

    const handleCategorySelect = async (category: string) => {
        await updateSettings({ instructionCategory: category });
        router.replace('/(tabs)');
    };

    const renderItem = ({ item }: { item: typeof CATEGORIES[0] }) => {
        const Icon = getCategoryIcon(item.id);
        return (
            <TouchableOpacity
                style={styles.categoryCard}
                onPress={() => handleCategorySelect(item.id)}
                activeOpacity={0.7}
            >
                <View style={styles.iconContainer}>
                    <Icon size={28} color={Colors.primary} strokeWidth={2} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.categoryName}>{t(`categories.${item.key}`)}</Text>
                    <Text style={styles.categoryDesc}>{t(`categories.${item.key}Desc`)}</Text>
                </View>
                <View style={styles.arrow}>
                    <ChevronRight size={20} color={Colors.textMuted} />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Colors.primary, '#6366F1']}
                style={styles.header}
            >
                <Text style={styles.title}>{t('onboarding.selectCategory')}</Text>
                <Text style={styles.subtitle}>{t('onboarding.selectCategoryDesc')}</Text>
            </LinearGradient>

            <View style={styles.content}>
                <FlatList
                    data={CATEGORIES}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                />
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
        paddingTop: 80,
        paddingBottom: 50,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    content: {
        flex: 1,
        marginTop: -25,
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    categoryCard: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 14,
        backgroundColor: Colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        marginLeft: 14,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    categoryDesc: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    arrow: {
        padding: 4,
    },
});
