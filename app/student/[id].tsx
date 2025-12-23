
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useData } from '../../src/context/DataContext';
import { Colors } from '../../src/constants/Colors';
import { ArrowLeft, Edit, MessageCircle, CheckCircle, XCircle } from 'lucide-react-native';
import { generateReportMessage } from '../../src/utils/messageGenerator';

export default function StudentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { students, lessons, payments, addPayment, teacher } = useData();

  const studentId = Array.isArray(id) ? id[0] : id;
  const student = students.find(s => s.id === studentId);

  const [paymentAmount, setPaymentAmount] = useState('');

  // 1. Calculate Paid Status Logic
  const processedLessons = useMemo(() => {
    if (!student) return [];

    // Get student's lessons and sort Oldest to Newest for calculation
    const studentLessons = lessons
      .filter(l => l.studentId === studentId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate total payments made by this student
    let totalPaymentPool = payments
      .filter(p => p.studentId === studentId)
      .reduce((sum, p) => sum + p.amount, 0);

    // Map lessons to add isPaid status
    const lessonsWithStatus = studentLessons.map(lesson => {
      let isPaid = false;
      // If we have enough money in the pool to cover this lesson
      if (totalPaymentPool >= lesson.fee) {
        totalPaymentPool -= lesson.fee;
        isPaid = true;
      }
      return { ...lesson, isPaid };
    });

    // Reverse to show Newest First (Standard history view)
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
        <View style={styles.center}><Text>Öğrenci bulunamadı.</Text></View>
      </View>
    );
  }

  const handlePayment = async () => {
    if (!paymentAmount) {
      Alert.alert('Hata', 'Lütfen bir tutar giriniz.');
      return;
    }
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Hata', 'Geçerli bir tutar giriniz.');
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
      Alert.alert('Başarılı', 'Ödeme alındı.');
    } catch (error) {
      Alert.alert('Hata', 'Ödeme kaydedilemedi.');
    }
  };

  const handleShareToWhatsApp = () => {
    const message = generateReportMessage(student, lessons);
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => Alert.alert("Hata", "WhatsApp açılamadı."));
  };

  const themeColor = teacher?.themeColor || Colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Öğrenci Detayı</Text>
        <TouchableOpacity onPress={() => router.push(`/edit-student/${student.id}`)} style={[styles.iconBtn, { backgroundColor: Colors.primary }]}>
          <Edit size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Student Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.avatar, { backgroundColor: themeColor }]}>
              <Text style={styles.avatarText}>{student.fullName[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.studentName}>{student.fullName}</Text>
              <Text style={styles.studentSub}>{student.grade}</Text>
            </View>

          </View>
          <View style={styles.divider} />
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Güncel Bakiye</Text>
            <Text style={[styles.balanceValue, { color: student.balance > 0 ? Colors.danger : Colors.success }]}>
              {student.balance} ₺
            </Text>
          </View>

          {/* Inline Payment */}
          <View style={styles.paymentContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencyPrefix}>₺</Text>
              <TextInput
                style={styles.paymentInput}
                placeholder="Tutar"
                keyboardType="numeric"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
              />
            </View>
            <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
              <Text style={styles.payButtonText}>Tahsil Et</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* WhatsApp Action */}
        <View style={styles.section}>
          <TouchableOpacity onPress={handleShareToWhatsApp} style={styles.whatsappFullBtn}>
            <MessageCircle size={20} color="#fff" />
            <Text style={styles.whatsappText}>Güncel durumu mesaj gönder</Text>
          </TouchableOpacity>
        </View>

        {/* Lesson History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ders Geçmişi</Text>
          {processedLessons.map(lesson => (
            <View key={lesson.id} style={[styles.lessonCard, lesson.isPaid && styles.paidCard]}>
              <View style={styles.lessonInfo}>
                <Text style={[styles.lessonDate, lesson.isPaid && styles.strikethrough]}>
                  {new Date(lesson.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                </Text>
                <Text style={[styles.lessonTopic, lesson.isPaid && styles.strikethrough]}>
                  {lesson.topic || 'Konu Belirtilmemiş'}
                </Text>
              </View>
              <View style={styles.lessonMeta}>
                <Text style={[styles.lessonFee, lesson.isPaid && styles.strikethrough]}>
                  {lesson.fee} ₺
                </Text>
                {lesson.isPaid ? (
                  <CheckCircle size={16} color={Colors.success} />
                ) : (
                  <XCircle size={16} color={Colors.danger} />
                )}
              </View>
            </View>
          ))}
          {processedLessons.length === 0 && <Text style={styles.emptyText}>Henüz ders kaydı yok.</Text>}
        </View>

        {/* Payment History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ödeme Geçmişi</Text>
          {studentPayments.map(payment => (
            <View key={payment.id} style={styles.paymentCard}>
              <View style={styles.lessonInfo}>
                <Text style={styles.lessonDate}>
                  {new Date(payment.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                </Text>
                <Text style={styles.lessonTopic}>Tahsilat</Text>
              </View>
              <Text style={styles.paymentAmount}>-{payment.amount} ₺</Text>
            </View>
          ))}
          {studentPayments.length === 0 && <Text style={styles.emptyText}>Henüz ödeme alınmadı.</Text>}
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
  avatar: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  studentName: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
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
