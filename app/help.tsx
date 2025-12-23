import { useRouter } from 'expo-router';
import { ChevronDown, ChevronUp, HelpCircle, X } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutAnimation, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { Colors } from '../src/constants/Colors';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <View style={styles.faqItem}>
            <TouchableOpacity onPress={toggleExpand} style={styles.questionRow}>
                <Text style={styles.questionText}>{question}</Text>
                {expanded ? <ChevronUp size={20} color={Colors.textSecondary} /> : <ChevronDown size={20} color={Colors.textSecondary} />}
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

    const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <HelpCircle size={24} color={Colors.primary} />
                    <Text style={styles.title}>{t('help.title')}</Text>
                </View>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <X size={24} color={Colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.introText}>
                    {t('help.intro')}
                </Text>

                {faqKeys.map((key) => (
                    <FAQItem
                        key={key}
                        question={t(`help.faqs.${key}`)}
                        answer={t(`help.faqs.${key.replace('q', 'a')}`)}
                    />
                ))}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 50, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    title: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
    closeButton: { padding: 8, borderRadius: 12, backgroundColor: Colors.background },
    content: { padding: 24 },
    introText: { fontSize: 16, color: Colors.textSecondary, marginBottom: 24, lineHeight: 22 },
    faqItem: { marginBottom: 16, backgroundColor: Colors.card, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
    questionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    questionText: { fontSize: 16, fontWeight: '600', color: Colors.text, flex: 1 },
    answerContainer: { padding: 16, paddingTop: 0, backgroundColor: Colors.card },
    answerText: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
});
