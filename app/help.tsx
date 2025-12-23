import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../src/constants/Colors';
import { X, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react-native';

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
    const router = useRouter();

    const faqs = [
        {
            question: 'Öğrenci nasıl eklenir?',
            answer: 'Ana sayfadaki "Öğrenci Ekle" butonuna veya "Öğrenciler" sekmesindeki "+" butonuna tıklayın. Gerekli bilgileri doldurup "Kaydet" butonuna basın.'
        },
        {
            question: 'Grup nasıl oluşturulur?',
            answer: 'Ana sayfadaki "Grup Oluştur" butonuna tıklayın. Grup adını girin ve listelenen öğrencilerden gruba dahil etmek istediklerinizi seçin. Sadece henüz bir grubu olmayan öğrenciler listelenir.'
        },
        {
            question: '"Ders İşle" özelliği nasıl çalışır?',
            answer: '"Ders İşle" butonuna tıkladığınızda, bireysel veya grup dersi seçebilirsiniz. Dersi seçip "Kaydet" dediğinizde, ilgili öğrencilerin bakiyesine ders ücreti otomatik olarak eklenir ve ders geçmişlerine kaydedilir.'
        },
        {
            question: 'Ödeme nasıl alınır?',
            answer: 'Öğrenci detay sayfasına gidin. "Güncel Bakiye" kartındaki alana tutarı girip "Tahsil Et" butonuna basın. Tutar bakiyeden düşülür ve ödeme geçmişine eklenir.'
        },
        {
            question: 'Veliye nasıl mesaj gönderilir?',
            answer: 'Öğrenci detay sayfasında "Güncel durumu mesaj gönder" butonuna tıklayın. Bu işlem, öğrencinin bakiye ve son ders bilgilerini içeren hazır bir WhatsApp mesajı oluşturur.'
        },
        {
            question: 'Uygulama rengi nasıl değiştirilir?',
            answer: '"Profil" sekmesine gidin. "Uygulama Tema Rengi" bölümünden istediğiniz rengi seçin ve "Değişiklikleri Kaydet" butonuna basın.'
        },
        {
            question: 'Verilerimi nasıl yedeklerim?',
            answer: 'Profil sekmesinde "Veri ve Yedekleme" bölümüne gidin. "Yedekle (Dışa Aktar)" butonuna basın. Açılan paylaşım ekranından dosyayı Google Drive, WhatsApp veya E-posta ile kendinize gönderin. Yeni telefonda veya verileri geri yüklemek için "Yedeği Geri Yükle" butonuna basıp kaydettiğiniz dosyayı seçin.'
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <HelpCircle size={24} color={Colors.primary} />
                    <Text style={styles.title}>Yardım ve Kullanım</Text>
                </View>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <X size={24} color={Colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.introText}>
                    Uygulamayı daha verimli kullanmak için sıkça sorulan sorulara göz atabilirsiniz.
                </Text>

                {faqs.map((faq, index) => (
                    <FAQItem key={index} question={faq.question} answer={faq.answer} />
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
