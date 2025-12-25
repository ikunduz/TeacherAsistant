import { useRouter } from 'expo-router';
import { ChevronDown, ChevronLeft, ChevronUp, HelpCircle } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutAnimation, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { Colors } from '../src/constants/Colors';
import { useData } from '../src/context/DataContext';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const FAQItem = ({ question, answer, themeColor }: { question: string, answer: string, themeColor: string }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <View style={styles.faqItem}>
            <TouchableOpacity onPress={toggleExpand} style={styles.questionRow}>
                <Text style={styles.questionText}>{question}</Text>
                {expanded ? (
                    <ChevronUp size={20} color={themeColor} />
                ) : (
                    <ChevronDown size={20} color={Colors.textMuted} />
                )}
            </TouchableOpacity>
            {expanded && (
                <View style={styles.answerContainer}>
                    <Text style={styles.answerText}>{answer}</Text>
                </View>
            )}
        </View>
    );
};

export default function HelpScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { teacher } = useData();

    const themeColor = teacher?.themeColor || Colors.primary;
    const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'];

    return (
        <View style={styles.container}>
            {/* iOS-style Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={Colors.iosBlue} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <HelpCircle size={20} color={themeColor} />
                    <Text style={styles.headerTitle}>{t('help.title')}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Intro Card */}
                <View style={styles.introCard}>
                    <Text style={styles.introText}>{t('help.intro')}</Text>
                </View>

                {/* FAQ Section */}
                <Text style={styles.sectionHeader}>FAQ</Text>
                {faqKeys.map((key) => (
                    <FAQItem
                        key={key}
                        question={t(`help.faqs.${key}`)}
                        answer={t(`help.faqs.${key.replace('q', 'a')}`)}
                        themeColor={themeColor}
                    />
                ))}

                <View style={{ height: 40 }} />
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
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: Colors.text,
    },
    content: {
        padding: 16,
    },

    // Intro
    introCard: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    introText: {
        fontSize: 15,
        color: Colors.textSecondary,
        lineHeight: 22,
    },

    // Section Header
    sectionHeader: {
        fontSize: 13,
        fontWeight: '400',
        color: '#6D6D72',
        marginHorizontal: 4,
        marginBottom: 8,
        marginTop: 20,
        letterSpacing: 0.5,
    },

    // FAQ Item
    faqItem: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        marginBottom: 8,
        overflow: 'hidden',
    },
    questionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    questionText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text,
        flex: 1,
        marginRight: 12,
    },
    answerContainer: {
        padding: 16,
        paddingTop: 0,
    },
    answerText: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
});
