import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, Edit, MessageCircle, XCircle } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../src/constants/Colors';
import { useData } from '../../src/context/DataContext';
import { generateReportMessage } from '../../src/utils/messageGenerator';

export default function StudentDetailScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { students, lessons, payments, addPayment, teacher, settings } = useData();

  const studentId = Array.isArray(id) ? id[0] : id;
  const student = students.find(s => s.id === studentId);

  const [paymentAmount, setPaymentAmount] = useState('');

  // 1. Calculate Paid Status Logic
  const processedLessons = useMemo(() => {
    if (!student) return [];

    const studentLessons = lessons
      .filter(l => l.studentId === studentId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let totalPaymentPool = payments
      .filter(p => p.studentId === studentId)
      .reduce((sum, p) => sum + p.amount, 0);

    const lessonsWithStatus = studentLessons.map(lesson => {
      let isPaid = false;
      if (totalPaymentPool >= lesson.fee) {
        totalPaymentPool -= lesson.fee;
        isPaid = true;
      }
      return { ...lesson, isPaid };
    });

    return lessonsWithStatus.reverse();
  }, [lessons, payments, studentId, student]);

  const studentPayments = useMemo(() => {
    return payments
      .filter(p => p.studentId === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [payments, studentId]);

  if (!student) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: Colors.card }]}>
          <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color={Colors.text} /></TouchableOpacity>
        </View>
        <View style={styles.center}><Text>{t('common.noData')}</Text></View>
      </View>
    );
  }

  const handlePayment = async () => {
    if (!paymentAmount) {
      Alert.alert(t('common.error'), t('common.noData'));
      return;
    }
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert(t('common.error'), t('common.error'));
      return;
    }

    try {
      await addPayment({
        id: Date.now().toString(),
        studentId: student.id,
        studentName: student.fullName,
        amount: amount,
        date: new Date().toISOString(),
      });
      setPaymentAmount('');
      Alert.alert(t('common.welcome'), t('common.save'));
    } catch (error) {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  const handleShareToWhatsApp = () => {
    const message = generateReportMessage(student, lessons, t, settings.currency);
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => Alert.alert(t('common.error'), "WhatsApp error"));
  };

  const themeColor = teacher?.themeColor || Colors.primary;
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('students.title')} {t('common.edit')}</Text>
        <TouchableOpacity onPress={() => router.push(`/edit-student/${student.id}`)} style={[styles.iconBtn, { backgroundColor: themeColor }]}>
          <Edit size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Student Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.avatarWrapper}>
              {student.image ? (
                <Image source={{ uri: student.image }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: themeColor }]}>
                  <Text style={styles.avatarText}>{student.fullName[0]}</Text>
                </View>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.studentName}>{student.fullName}</Text>
                {student.statusTag && (
                  <View style={[
                    styles.statusBadge,
                    {
                      backgroundColor: student.statusTag === 'Beginner' ? '#EBF5FF' :
                        student.statusTag === 'Intermediate' ? '#ECFDF5' :
                          student.statusTag === 'Advanced' ? '#F5F3FF' : '#FFFBEB'
                    }
                  ]}>
                    <Text style={[
                      styles.statusBadgeText,
                      {
                        color: student.statusTag === 'Beginner' ? '#3B82F6' :
                          student.statusTag === 'Intermediate' ? '#10B981' :
                            student.statusTag === 'Advanced' ? '#8B5CF6' : '#F59E0B'
                      }
                    ]}>
                      {t(`students.${student.statusTag.toLowerCase().replace(' ', '')}`)}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.studentSub}>{student.grade}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>{t('students.balance')}</Text>
            <Text style={[styles.balanceValue, { color: student.balance > 0 ? Colors.error : Colors.success }]}>
              {student.balance} {settings.currency}
            </Text>
          </View>

          {/* Inline Payment */}
          <View style={styles.paymentContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencyPrefix}>{settings.currency}</Text>
              <TextInput
                style={styles.paymentInput}
                placeholder={t('finance.collected')}
                keyboardType="numeric"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
              />
            </View>
            <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
              <Text style={styles.payButtonText}>{t('common.add')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* WhatsApp Action */}
        <View style={styles.section}>
          <TouchableOpacity onPress={handleShareToWhatsApp} style={styles.whatsappFullBtn}>
            <MessageCircle size={20} color="#fff" />
            <Text style={styles.whatsappText}>{t('attendance.markAttendance')}</Text>
          </TouchableOpacity>
        </View>

        {/* Lesson History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('weekly-schedule')}</Text>
          {processedLessons.map(lesson => (
            <View key={lesson.id} style={[styles.lessonCard, lesson.isPaid && styles.paidCard]}>
              <View style={styles.lessonInfo}>
                <Text style={[styles.lessonDate, lesson.isPaid && styles.strikethrough]}>
                  {new Date(lesson.date).toLocaleDateString(locale, { day: 'numeric', month: 'long' })}
                </Text>
                <Text style={[styles.lessonTopic, lesson.isPaid && styles.strikethrough]}>
                  {lesson.topic || t('common.noData')}
                </Text>
              </View>
              <View style={styles.lessonMeta}>
                <Text style={[styles.lessonFee, lesson.isPaid && styles.strikethrough]}>
                  {lesson.fee} {settings.currency}
                </Text>
                {lesson.isPaid ? (
                  <CheckCircle size={16} color={Colors.success} />
                ) : (
                  <XCircle size={16} color={Colors.error} />
                )}
              </View>
            </View>
          ))}
          {processedLessons.length === 0 && <Text style={styles.emptyText}>{t('common.noData')}</Text>}
        </View>

        {/* Payment History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('finance.collected')}</Text>
          {studentPayments.map(payment => (
            <View key={payment.id} style={styles.paymentCard}>
              <View style={styles.lessonInfo}>
                <Text style={styles.lessonDate}>
                  {new Date(payment.date).toLocaleDateString(locale, { day: 'numeric', month: 'long' })}
                </Text>
                <Text style={styles.lessonTopic}>{t('finance.collected')}</Text>
              </View>
              <Text style={styles.paymentAmount}>-{payment.amount} {settings.currency}</Text>
            </View>
          ))}
          {studentPayments.length === 0 && <Text style={styles.emptyText}>{t('common.noData')}</Text>}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 50 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  iconBtn: { padding: 8, borderRadius: 12, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  card: { margin: 20, padding: 20, backgroundColor: Colors.card, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrapper: { width: 50, height: 50, borderRadius: 25, overflow: 'hidden' },
  avatar: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  studentName: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  statusBadgeText: { fontSize: 10, fontWeight: 'bold' },
  studentSub: { color: Colors.textSecondary },

  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 16 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  balanceLabel: { fontSize: 14, color: Colors.textSecondary },
  balanceValue: { fontSize: 24, fontWeight: 'bold' },

  paymentContainer: { flexDirection: 'row', gap: 10 },
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.border },
  currencyPrefix: { fontSize: 16, color: Colors.textSecondary, marginRight: 4 },
  paymentInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: Colors.text },
  payButton: { paddingHorizontal: 20, justifyContent: 'center', borderRadius: 12, backgroundColor: '#dcfce7' },
  payButtonText: { color: '#000', fontWeight: 'bold' },

  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 12 },
  emptyText: { color: Colors.textSecondary, fontStyle: 'italic', textAlign: 'center', marginTop: 10 },

  lessonCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.card, padding: 16, borderRadius: 12, marginBottom: 8 },
  paidCard: { opacity: 0.6 },
  lessonInfo: { flex: 1 },
  lessonDate: { fontSize: 14, fontWeight: '600', color: Colors.text },
  lessonTopic: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  lessonMeta: { alignItems: 'flex-end', gap: 4 },
  lessonFee: { fontSize: 14, fontWeight: 'bold', color: Colors.text },
  strikethrough: { textDecorationLine: 'line-through', color: Colors.textSecondary },

  paymentCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.card, padding: 16, borderRadius: 12, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: Colors.success },
  paymentAmount: { fontSize: 16, fontWeight: 'bold', color: Colors.success },
  whatsappFullBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#25D366', padding: 16, borderRadius: 12, gap: 8 },
  whatsappText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
