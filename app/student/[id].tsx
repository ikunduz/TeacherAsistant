import { useLocalSearchParams, useRouter } from 'expo-router';
import { Banknote, CheckCircle, ChevronLeft, CreditCard, Edit, FileText, Landmark, MessageCircle, MoreHorizontal, PackagePlus, PlusCircle, Star, Video, XCircle } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors, TagColors } from '../../src/constants/Colors';
import { useData } from '../../src/context/DataContext';
import { useSubscription } from '../../src/context/SubscriptionContext';
import { ReportService } from '../../src/services/report';
import { generateReportMessage } from '../../src/utils/messageGenerator';

export default function StudentDetailScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { students, lessons, payments, addPayment, addPackage, teacher, settings, updateStudent, addMetric, updateMetricScore, updateEvaluationNote, deleteMetric } = useData();
  const { isPro } = useSubscription();

  const studentId = Array.isArray(id) ? id[0] : id;
  const student = students.find(s => s.id === studentId);

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Card' | 'Other'>('Cash');
  const [isPackageModalVisible, setIsPackageModalVisible] = useState(false);
  const [packageCount, setPackageCount] = useState('10');
  const [packagePrice, setPackagePrice] = useState('');

  const [isMetricModalVisible, setIsMetricModalVisible] = useState(false);
  const [newMetricName, setNewMetricName] = useState('');
  const [newMetricType, setNewMetricType] = useState<'star' | 'numeric' | 'percentage'>('star');
  const [isScoreModalVisible, setIsScoreModalVisible] = useState(false);
  const [selectedMetricId, setSelectedMetricId] = useState<string | null>(null);
  const [newScore, setNewScore] = useState('');
  const [evaluationNote, setEvaluationNote] = useState(student?.evaluationNote || '');
  const [customMeetingLink, setCustomMeetingLink] = useState(student?.customMeetingLink || '');

  const themeColor = teacher?.themeColor || Colors.primary;
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';

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

  const getMethodIcon = (method?: string) => {
    switch (method) {
      case 'Cash': return <Banknote size={14} color={Colors.success} />;
      case 'Bank Transfer': return <Landmark size={14} color="#0284C7" />;
      case 'Card': return <CreditCard size={14} color="#7C3AED" />;
      default: return <MoreHorizontal size={14} color={Colors.textSecondary} />;
    }
  };

  const studentPayments = useMemo(() => {
    return payments
      .filter(p => p.studentId === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [payments, studentId]);

  if (!student) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={Colors.iosBlue} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('students.title')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}><Text style={styles.emptyText}>{t('common.noData')}</Text></View>
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
        paymentMethod: paymentMethod,
      });
      setPaymentAmount('');
      Alert.alert(t('common.success') || 'Success', t('common.save'));
    } catch (error) {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  const handleAddPackage = async () => {
    if (!isPro) {
      Alert.alert(t('students.proFeature'), t('students.proFeatureDesc'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('students.upgradeNow'), onPress: () => router.push('/paywall' as any) }
      ]);
      return;
    }
    const count = parseInt(packageCount);
    const price = parseFloat(packagePrice) || 0;

    if (isNaN(count) || count <= 0) {
      Alert.alert(t('common.error'), t('common.error'));
      return;
    }

    try {
      await addPackage(student.id, count, price, paymentMethod);
      setIsPackageModalVisible(false);
      setPackagePrice('');
      Alert.alert(t('common.success') || 'Success', t('common.save'));
    } catch (error) {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  const handleShareToWhatsApp = () => {
    const message = generateReportMessage(student, lessons, t, settings.currency, settings.defaultMeetingLink);
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => Alert.alert(t('common.error'), "WhatsApp error"));
  };

  const handleSaveCustomLink = async () => {
    try {
      await updateStudent({ ...student, customMeetingLink: customMeetingLink });
    } catch (e) {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  const handleAddMetric = async () => {
    if (!newMetricName) return;
    try {
      await addMetric(student.id, newMetricName, newMetricType);
      setIsMetricModalVisible(false);
      setNewMetricName('');
    } catch (e) { Alert.alert(t('common.error'), t('common.error')); }
  };

  const handleScoreMetric = async () => {
    if (!selectedMetricId || !newScore) return;
    const scoreVal = parseFloat(newScore);
    if (isNaN(scoreVal)) return;

    try {
      await updateMetricScore(student.id, selectedMetricId, scoreVal);
      setIsScoreModalVisible(false);
      setNewScore('');
      setSelectedMetricId(null);
    } catch (e) { Alert.alert(t('common.error'), t('common.error')); }
  };

  const handleSaveNote = async () => {
    try {
      await updateEvaluationNote(student.id, evaluationNote);
    } catch (e) { Alert.alert(t('common.error'), t('common.error')); }
  };

  const handleDeleteMetric = (metricId: string) => {
    Alert.alert(t('common.delete'), t('students.deleteConfirmTitle'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deleteMetric(student.id, metricId) }
    ]);
  };

  const handleGenerateReport = async () => {
    if (!isPro) {
      Alert.alert(t('students.proFeature'), t('students.proFeatureDesc'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('students.upgradeNow'), onPress: () => router.push('/paywall' as any) }
      ]);
      return;
    }
    try {
      await ReportService.generateStudentReport(student, teacher, lessons, settings, t, i18n.language);
    } catch (e) {
      Alert.alert(t('common.error'), "Report generation failed");
    }
  };

  const statusColors = {
    'Beginner': TagColors.beginner,
    'Intermediate': TagColors.intermediate,
    'Advanced': TagColors.advanced,
    'Expert': { bg: Colors.warningLight, text: '#92400E' },
  };

  return (
    <View style={styles.container}>
      {/* iOS-style Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.iosBlue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('students.title')}</Text>
        <TouchableOpacity onPress={() => router.push(`/edit-student/${student.id}`)} style={[styles.editButton, { backgroundColor: themeColor }]}>
          <Edit size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Student Profile Card */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            {student.image ? (
              <Image source={{ uri: student.image }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: themeColor + '15' }]}>
                <Text style={[styles.avatarText, { color: themeColor }]}>{student.fullName[0]}</Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.studentName}>{student.fullName}</Text>
                {student.statusTag && (
                  <View style={[styles.statusBadge, { backgroundColor: statusColors[student.statusTag]?.bg || Colors.iosBg }]}>
                    <Text style={[styles.statusText, { color: statusColors[student.statusTag]?.text || Colors.textSecondary }]}>
                      {t(`students.${student.statusTag.toLowerCase().replace(' ', '')}`)}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.studentGrade}>{student.grade}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>{t('students.balance')}</Text>
            <Text style={[styles.balanceValue, { color: student.balance > 0 ? Colors.error : Colors.success }]}>
              {student.balance} {settings.currency}
            </Text>
          </View>
        </View>

        {/* Quick Payment */}
        <Text style={styles.sectionHeader}>{t('finance.collected').toUpperCase()}</Text>
        <View style={styles.card}>
          <View style={styles.paymentRow}>
            <View style={styles.paymentInputContainer}>
              <Text style={styles.currencySymbol}>{settings.currency}</Text>
              <TextInput
                style={styles.paymentInput}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
              />
            </View>
            <TouchableOpacity style={[styles.payButton, { backgroundColor: themeColor + '15' }]} onPress={handlePayment}>
              <Text style={[styles.payButtonText, { color: themeColor }]}>{t('common.add')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.separator} />
          <View style={styles.methodRow}>
            {(['Cash', 'Bank Transfer', 'Card'] as const).map(m => (
              <TouchableOpacity
                key={m}
                style={[styles.methodChip, paymentMethod === m && { backgroundColor: themeColor + '15', borderColor: themeColor }]}
                onPress={() => setPaymentMethod(m)}
              >
                {getMethodIcon(m)}
                <Text style={[styles.methodText, paymentMethod === m && { color: themeColor }]}>
                  {t(`students.${m.toLowerCase().replace(' ', '')}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Package Section */}
        <View style={styles.card}>
          <View style={styles.packageRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.packageLabel}>{t('students.remainingLessons')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[
                  styles.packageValue,
                  { color: student.remainingLessons > 0 ? Colors.success : Colors.error }
                ]}>
                  {student.remainingLessons || 0}
                </Text>
                {student.remainingLessons > 0 ? (
                  <View style={{ backgroundColor: Colors.success + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                    <Text style={{ fontSize: 11, color: Colors.success, fontWeight: '600' }}>🎫 Paketli</Text>
                  </View>
                ) : (
                  <View style={{ backgroundColor: Colors.warning + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                    <Text style={{ fontSize: 11, color: Colors.warning, fontWeight: '600' }}>⚠️ Paket Yok</Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity style={[styles.packageButton, { backgroundColor: themeColor }]} onPress={() => setIsPackageModalVisible(true)}>
              <PackagePlus size={18} color="#FFF" />
              <Text style={styles.packageButtonText}>{t('students.addPackage')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Meeting Link */}
        <Text style={styles.sectionHeader}>{t('students.customMeetingLink').toUpperCase()}</Text>
        <View style={styles.card}>
          <View style={styles.inputRow}>
            <Video size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="https://zoom.us/j/..."
              placeholderTextColor={Colors.textMuted}
              value={customMeetingLink}
              onChangeText={setCustomMeetingLink}
              onBlur={handleSaveCustomLink}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* WhatsApp */}
        <TouchableOpacity style={styles.whatsappButton} onPress={handleShareToWhatsApp}>
          <MessageCircle size={20} color="#FFF" />
          <Text style={styles.whatsappText}>{t('students.swipeMessage')}</Text>
        </TouchableOpacity>

        {/* Metrics */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>{t('students.metrics').toUpperCase()}</Text>
          <TouchableOpacity onPress={() => setIsMetricModalVisible(true)}>
            <PlusCircle size={22} color={themeColor} />
          </TouchableOpacity>
        </View>

        {(!student.metrics || student.metrics.length === 0) ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>{t('students.noMetrics')}</Text>
          </View>
        ) : (
          <View style={styles.metricsGrid}>
            {student.metrics.map(metric => {
              const latestScore = metric.values?.length > 0 ? metric.values[metric.values.length - 1].score : null;
              return (
                <TouchableOpacity
                  key={metric.id}
                  style={styles.metricCard}
                  onPress={() => { setSelectedMetricId(metric.id); setIsScoreModalVisible(true); }}
                  onLongPress={() => handleDeleteMetric(metric.id)}
                >
                  <Text style={styles.metricName}>{metric.name}</Text>
                  {metric.type === 'star' ? (
                    <View style={styles.starRow}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={14} fill={latestScore && latestScore >= s ? "#F59E0B" : "transparent"} color={latestScore && latestScore >= s ? "#F59E0B" : Colors.textMuted} />
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.metricScore}>{latestScore !== null ? `${latestScore}${metric.type === 'percentage' ? '%' : ''}` : '-'}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Evaluation */}
        <Text style={styles.sectionHeader}>{t('students.evaluation').toUpperCase()}</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.evaluationInput}
            placeholder={t('students.evaluationNote')}
            placeholderTextColor={Colors.textMuted}
            multiline
            value={evaluationNote}
            onChangeText={setEvaluationNote}
            onBlur={handleSaveNote}
          />
        </View>

        <TouchableOpacity style={[styles.reportButton, { backgroundColor: themeColor }]} onPress={handleGenerateReport}>
          <FileText size={18} color="#FFF" />
          <Text style={styles.reportButtonText}>{t('students.generateReport')}</Text>
        </TouchableOpacity>

        {/* Lesson History */}
        <Text style={styles.sectionHeader}>{t('weekly-schedule').toUpperCase()}</Text>
        <View style={styles.card}>
          {processedLessons.length === 0 ? (
            <View style={styles.emptyRow}><Text style={styles.emptyText}>{t('common.noData')}</Text></View>
          ) : (
            processedLessons.slice(0, 10).map((lesson, i) => (
              <View key={lesson.id}>
                <View style={[styles.lessonRow, lesson.isPaid && styles.lessonRowPaid]}>
                  <View>
                    <Text style={[styles.lessonDate, lesson.isPaid && styles.strikethrough]}>
                      {new Date(lesson.date).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                    </Text>
                    <Text style={[styles.lessonTopic, lesson.isPaid && styles.strikethrough]}>{lesson.topic || t('common.noData')}</Text>
                  </View>
                  <View style={styles.lessonRight}>
                    <Text style={[styles.lessonFee, lesson.isPaid && styles.strikethrough]}>{lesson.fee} {settings.currency}</Text>
                    {lesson.isPaid ? <CheckCircle size={16} color={Colors.success} /> : <XCircle size={16} color={Colors.error} />}
                  </View>
                </View>
                {i < Math.min(processedLessons.length, 10) - 1 && <View style={styles.separator} />}
              </View>
            ))
          )}
        </View>

        {/* Payment History */}
        <Text style={styles.sectionHeader}>{t('finance.collected').toUpperCase()}</Text>
        <View style={styles.card}>
          {studentPayments.length === 0 ? (
            <View style={styles.emptyRow}><Text style={styles.emptyText}>{t('common.noData')}</Text></View>
          ) : (
            studentPayments.slice(0, 10).map((payment, i) => (
              <View key={payment.id}>
                <View style={styles.paymentHistoryRow}>
                  <View style={styles.paymentHistoryLeft}>
                    {getMethodIcon(payment.paymentMethod)}
                    <View>
                      <Text style={styles.lessonDate}>{new Date(payment.date).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</Text>
                      <Text style={styles.lessonTopic}>{t(`students.${(payment.paymentMethod || 'other').toLowerCase().replace(' ', '')}`)}</Text>
                    </View>
                  </View>
                  <Text style={styles.paymentHistoryAmount}>-{payment.amount} {settings.currency}</Text>
                </View>
                {i < Math.min(studentPayments.length, 10) - 1 && <View style={styles.separator} />}
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Package Modal */}
      <Modal visible={isPackageModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('students.addPackage')}</Text>
            <Text style={styles.modalLabel}>{t('students.packageCount')}</Text>
            <TextInput style={styles.modalInput} keyboardType="numeric" value={packageCount} onChangeText={setPackageCount} />
            <Text style={styles.modalLabel}>{t('students.packagePrice')}</Text>
            <View style={styles.modalInputRow}>
              <Text style={styles.currencySymbol}>{settings.currency}</Text>
              <TextInput style={styles.modalInputFlex} keyboardType="numeric" placeholder="0" placeholderTextColor={Colors.textMuted} value={packagePrice} onChangeText={setPackagePrice} />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setIsPackageModalVisible(false)}>
                <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalConfirmBtn, { backgroundColor: '#7C3AED' }]} onPress={handleAddPackage}>
                <Text style={styles.modalConfirmText}>{t('common.add')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Metric Modal */}
      <Modal visible={isMetricModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('students.addMetric')}</Text>
            <TextInput style={styles.modalInput} placeholder={t('students.metricName')} placeholderTextColor={Colors.textMuted} value={newMetricName} onChangeText={setNewMetricName} />
            <View style={styles.typeSelector}>
              {(['star', 'numeric', 'percentage'] as const).map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeBtn, newMetricType === type && { backgroundColor: themeColor + '15', borderColor: themeColor }]}
                  onPress={() => setNewMetricType(type)}
                >
                  <Text style={[styles.typeText, newMetricType === type && { color: themeColor }]}>{t(`students.${type}`)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setIsMetricModalVisible(false)}>
                <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalConfirmBtn, { backgroundColor: themeColor }]} onPress={handleAddMetric}>
                <Text style={styles.modalConfirmText}>{t('common.add')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Score Modal */}
      <Modal visible={isScoreModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('students.enterScore')}</Text>
            <TextInput style={styles.modalInput} placeholder="e.g. 5 or 90" placeholderTextColor={Colors.textMuted} keyboardType="numeric" value={newScore} onChangeText={setNewScore} autoFocus />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setIsScoreModalVisible(false); setSelectedMetricId(null); }}>
                <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalConfirmBtn, { backgroundColor: themeColor }]} onPress={handleScoreMetric}>
                <Text style={styles.modalConfirmText}>{t('students.saveScore')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.iosBg },
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
  backButton: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.text },
  editButton: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },

  // Card
  card: { backgroundColor: Colors.card, borderRadius: 12, overflow: 'hidden', marginBottom: 12 },

  // Profile
  profileRow: { flexDirection: 'row', padding: 16, gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  avatarPlaceholder: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 22, fontWeight: '700' },
  profileInfo: { flex: 1, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  studentName: { fontSize: 18, fontWeight: '700', color: Colors.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '600' },
  studentGrade: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.iosSeparator, marginLeft: 16 },
  balanceSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  balanceLabel: { fontSize: 15, color: Colors.textSecondary },
  balanceValue: { fontSize: 22, fontWeight: '700' },

  // Section Header
  sectionHeader: { fontSize: 13, fontWeight: '400', color: '#6D6D72', marginHorizontal: 4, marginBottom: 8, marginTop: 16, letterSpacing: 0.5 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 8, marginHorizontal: 4 },

  // Payment
  paymentRow: { flexDirection: 'row', padding: 12, gap: 10 },
  paymentInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.iosBg, borderRadius: 10, paddingHorizontal: 12 },
  currencySymbol: { fontSize: 16, color: Colors.textSecondary, marginRight: 4 },
  paymentInput: { flex: 1, paddingVertical: 10, fontSize: 17, color: Colors.text },
  payButton: { paddingHorizontal: 20, justifyContent: 'center', borderRadius: 10 },
  payButtonText: { fontWeight: '600', fontSize: 15 },
  methodRow: { flexDirection: 'row', padding: 12, gap: 8 },
  methodChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, gap: 4 },
  methodText: { fontSize: 11, color: Colors.textSecondary },

  // Package
  packageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  packageLabel: { fontSize: 13, color: Colors.textSecondary },
  packageValue: { fontSize: 24, fontWeight: '800', color: '#7C3AED', marginTop: 4 },
  packageButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7C3AED', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, gap: 6 },
  packageButtonText: { color: '#FFF', fontWeight: '600', fontSize: 13 },

  // Input Row
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  input: { flex: 1, fontSize: 16, color: Colors.text },

  // WhatsApp
  whatsappButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#25D366', padding: 14, borderRadius: 12, gap: 8, marginBottom: 8 },
  whatsappText: { color: '#FFF', fontWeight: '600', fontSize: 15 },

  // Metrics
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  metricCard: { width: '48%', backgroundColor: Colors.card, padding: 14, borderRadius: 12, gap: 8 },
  metricName: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  starRow: { flexDirection: 'row', gap: 2 },
  metricScore: { fontSize: 20, fontWeight: '800', color: Colors.text },
  emptyCard: { backgroundColor: Colors.card, borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 8 },

  // Evaluation
  evaluationInput: { padding: 14, fontSize: 15, color: Colors.text, minHeight: 80, textAlignVertical: 'top' },
  reportButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, gap: 8, marginTop: 8, marginBottom: 8 },
  reportButtonText: { color: '#FFF', fontWeight: '600', fontSize: 15 },

  // Lesson/Payment History
  lessonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  lessonRowPaid: { opacity: 0.5 },
  lessonDate: { fontSize: 14, fontWeight: '600', color: Colors.text },
  lessonTopic: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  lessonRight: { alignItems: 'flex-end', gap: 4 },
  lessonFee: { fontSize: 14, fontWeight: '600', color: Colors.text },
  strikethrough: { textDecorationLine: 'line-through', color: Colors.textMuted },
  paymentHistoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  paymentHistoryLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  paymentHistoryAmount: { fontSize: 15, fontWeight: '600', color: Colors.success },
  emptyRow: { padding: 20, alignItems: 'center' },
  emptyText: { color: Colors.textMuted, fontStyle: 'italic' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: Colors.card, borderRadius: 20, padding: 24, width: '100%', maxWidth: 340 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginBottom: 20, textAlign: 'center' },
  modalLabel: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary, marginBottom: 6 },
  modalInput: { backgroundColor: Colors.iosBg, borderRadius: 10, padding: 12, fontSize: 16, color: Colors.text, marginBottom: 14 },
  modalInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.iosBg, borderRadius: 10, paddingHorizontal: 12, marginBottom: 14 },
  modalInputFlex: { flex: 1, paddingVertical: 12, fontSize: 16, color: Colors.text },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 10 },
  modalCancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: Colors.iosBg, alignItems: 'center' },
  modalCancelText: { fontSize: 15, fontWeight: '500', color: Colors.textSecondary },
  modalConfirmBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  modalConfirmText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
  typeSelector: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  typeText: { fontSize: 12, color: Colors.textSecondary },
});
