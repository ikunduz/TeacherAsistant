import { useRouter } from 'expo-router';
import { TrendingDown, TrendingUp } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../src/constants/Colors';
import { useData } from '../../src/context/DataContext';

export default function BalanceScreen() {
  const { t, i18n } = useTranslation();
  const { students, payments, settings } = useData();
  const router = useRouter();

  // Calculate last month payments and total balance
  const { lastMonthPayments, totalBalance, lastMonthName } = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const totalPayments = payments
      .filter(p => {
        const paymentDate = new Date(p.date);
        return paymentDate.getFullYear() === lastMonthYear && paymentDate.getMonth() === lastMonth;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    const balance = students.reduce((sum, s) => sum + s.balance, 0);

    const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
    const lastMonthDate = new Date(lastMonthYear, lastMonth, 1);
    const monthName = lastMonthDate.toLocaleString(locale, { month: 'long' });

    return { lastMonthPayments: totalPayments, totalBalance: balance, lastMonthName: monthName };
  }, [payments, students, i18n.language]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('finance.title')}</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.iconContainerGreen}>
            <TrendingUp size={24} color={Colors.success} />
          </View>
          <Text style={styles.summaryLabel}>{lastMonthName} {t('finance.collected')}</Text>
          <Text style={styles.summaryValue}>{lastMonthPayments} {settings.currency}</Text>
        </View>
        <View style={styles.summaryCard}>
          <View style={styles.iconContainerRed}>
            <TrendingDown size={24} color={Colors.error} />
          </View>
          <Text style={styles.summaryLabel}>{t('dashboard.totalPending')}</Text>
          <Text style={styles.summaryValue}>{totalBalance} {settings.currency}</Text>
        </View>
      </View>

      <Text style={styles.listTitle}>{t('students.balance')}</Text>

      {/* Student List */}
      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {students.sort((a, b) => b.balance - a.balance).map(student => (
          <TouchableOpacity key={student.id} style={styles.studentCard} onPress={() => router.push(`/student/${student.id}`)}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{student.fullName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{student.fullName}</Text>
              <Text style={styles.studentGrade}>{student.grade}</Text>
            </View>
            <View style={styles.balanceContainer}>
              <Text style={[styles.balanceText, student.balance > 0 ? styles.positiveBalance : styles.zeroBalance]}>
                {student.balance} {settings.currency}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    backgroundColor: Colors.card,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  iconContainerGreen: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    padding: 12,
    borderRadius: 99,
    marginBottom: 8,
  },
  iconContainerRed: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    padding: 12,
    borderRadius: 99,
    marginBottom: 8,
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  summaryValue: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  studentCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  studentGrade: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positiveBalance: {
    color: Colors.error,
  },
  zeroBalance: {
    color: Colors.success,
  }
});
