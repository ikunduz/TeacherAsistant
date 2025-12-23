import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Binary, Calendar, CheckCircle, Dumbbell, GraduationCap, HelpCircle, Languages, Layers, Music, Palette, UserPlus, Wallet } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../src/constants/Colors';
import { useData } from '../../src/context/DataContext';

const { width } = Dimensions.get('window');

const getCategoryIcon = (category: string) => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('swim') || cat.includes('sport') || cat.includes('gym')) return <Dumbbell size={14} color={Colors.primary} />;
  if (cat.includes('math') || cat.includes('physic') || cat.includes('science')) return <Binary size={14} color={Colors.primary} />;
  if (cat.includes('piano') || cat.includes('music') || cat.includes('guitar')) return <Music size={14} color={Colors.primary} />;
  if (cat.includes('art') || cat.includes('paint')) return <Palette size={14} color={Colors.primary} />;
  if (cat.includes('lang') || cat.includes('english')) return <Languages size={14} color={Colors.primary} />;
  return <GraduationCap size={14} color={Colors.primary} />;
};

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { teacher, students, lessons, groups, settings } = useData();
  const totalBalance = students.reduce((sum, s) => sum + (s.balance || 0), 0);

  // Today's scheduled lessons
  const today = new Date().getDay();
  const scheduledToday = useMemo(() => {
    const allItems: any[] = [];
    students.forEach(s => {
      s.schedule?.forEach(sc => {
        if (sc.day === today) {
          allItems.push({ ...s, scheduleItem: sc, type: 'individual' });
        }
      });
    });
    groups.forEach(g => {
      g.schedule?.forEach(sc => {
        if (sc.day === today) {
          allItems.push({ ...g, scheduleItem: sc, type: 'group' });
        }
      });
    });
    return allItems.sort((a, b) => a.scheduleItem.time.localeCompare(b.scheduleItem.time));
  }, [students, groups, today]);

  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
  const formattedDate = new Date().toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('@has_launched');
      if (hasLaunched === null) {
        await AsyncStorage.setItem('@has_launched', 'true');
        setTimeout(() => {
          router.push('/help');
        }, 500);
      }
    } catch (error) {
      console.error('First launch check failed', error);
    }
  };

  const themeColor = teacher?.themeColor || Colors.primary;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <Text style={styles.greeting}>{t('common.welcome')}</Text>
          <Text style={styles.teacherName}>{teacher?.fullName || 'CoachPro'}</Text>
          {settings.instructionCategory ? (
            <View style={[styles.categoryBadge, { borderColor: themeColor + '20', backgroundColor: themeColor + '10' }]}>
              {getCategoryIcon(settings.instructionCategory)}
              <Text style={[styles.categoryBadgeText, { color: themeColor }]}>{settings.instructionCategory}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push('/help')} style={styles.helpButton}>
            <HelpCircle size={24} color={themeColor} />
          </TouchableOpacity>
          <View style={[styles.avatarPlaceholder, { borderColor: themeColor + '20' }]}>
            <Text style={[styles.avatarText, { color: themeColor }]}>{teacher?.fullName?.[0] || 'CP'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.heroContainer}>
        <LinearGradient colors={[themeColor, themeColor + 'DD']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balanceCard}>
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>{t('dashboard.totalPending')}</Text>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceValue}>{totalBalance}</Text>
              <Text style={styles.currencySymbol}>{settings.currency}</Text>
            </View>
            <Text style={styles.balanceSub}>{t('dashboard.studentsPending', { count: students.filter(s => s.balance > 0).length })}</Text>
          </View>
          <View style={styles.walletIconBg}><Wallet size={28} color="#FFF" /></View>
        </LinearGradient>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{students.length}</Text>
          <Text style={styles.statTitle}>{t('students.title')}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{groups?.length || 0}</Text>
          <Text style={styles.statTitle}>{t('students.groups')}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{scheduledToday.length}</Text>
          <Text style={styles.statTitle}>{t('dashboard.todaySchedule')}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>

        {/* Start Session */}
        <TouchableOpacity style={[styles.mainActionCard, { backgroundColor: themeColor }]} onPress={() => router.push('/lesson-attendance')}>
          <CheckCircle size={24} color="#FFF" />
          <Text style={styles.mainActionCardTitle}>{t('attendance.markAttendance')}</Text>
        </TouchableOpacity>

        {/* Button Grid */}
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/add-student')}>
            <UserPlus size={24} color={Colors.textSecondary} />
            <Text style={styles.actionCardTitle}>{t('dashboard.addStudent')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/add-group')}>
            <Layers size={24} color={Colors.textSecondary} />
            <Text style={styles.actionCardTitle}>{t('dashboard.addGroup')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/weekly-schedule')}>
            <Calendar size={24} color={Colors.textSecondary} />
            <Text style={styles.actionCardTitle}>{t('dashboard.weeklySchedule')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dashboard.todaySchedule')}</Text>
        {scheduledToday.length === 0 ? (
          <View style={styles.emptyState}><Text style={styles.emptyText}>{t('dashboard.noLessonsToday')}</Text></View>
        ) : (
          scheduledToday.map((item, i) => (
            <View key={i} style={styles.lessonItem}>
              <View style={[styles.lessonDot, { backgroundColor: themeColor }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.lessonStudent}>{item.fullName || item.name}</Text>
                <Text style={styles.lessonTime}>
                  {item.type === 'group' ? `👥 ${t('students.groups')}` : `👤 ${t('students.individuals')}`} • {item.scheduleItem.time}
                </Text>
              </View>
              <Text style={{ fontWeight: 'bold', color: themeColor }}>{item.scheduleItem.time}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.signatureContainer}>
        <Text style={styles.signatureText}>CoachPro - Professional Management</Text>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { padding: 24, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  greeting: { fontSize: 16, color: Colors.text, marginTop: 4, opacity: 0.8 },
  teacherName: { fontSize: 28, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 8, alignSelf: 'flex-start', gap: 6, borderWidth: 1 },
  categoryBadgeText: { fontSize: 12, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  helpButton: { padding: 10, backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, elevation: 1 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 18, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.border, elevation: 2 },
  avatarText: { fontSize: 20, fontWeight: '900' },
  heroContainer: { paddingHorizontal: 24, marginBottom: 24 },
  balanceCard: { padding: 24, borderRadius: 28, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 4 },
  balanceInfo: { flex: 1 },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  balanceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  balanceValue: { color: '#FFF', fontSize: 38, fontWeight: '900', letterSpacing: -1 },
  currencySymbol: { color: '#FFF', fontSize: 24, fontWeight: '600', opacity: 0.8 },
  balanceSub: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '500', marginTop: 4 },
  walletIconBg: { width: 56, height: 56, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', backgroundColor: Colors.card, marginHorizontal: 24, padding: 20, borderRadius: 24, marginBottom: 24, elevation: 3 },
  statItem: { alignItems: 'center', flex: 1 },
  divider: { width: 1, height: 30, backgroundColor: Colors.border, opacity: 0.5 },
  statNumber: { fontSize: 22, fontWeight: '900', color: Colors.text },
  statTitle: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  section: { paddingHorizontal: 24, marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 16, letterSpacing: -0.5 },
  mainActionCard: {
    borderRadius: 24,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
    elevation: 4,
  },
  mainActionCardTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.card,
    padding: 18,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
  },
  actionCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginTop: 2,
  },
  lessonItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: Colors.border, elevation: 1 },
  lessonDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  lessonStudent: { fontSize: 16, fontWeight: '700', color: Colors.text },
  lessonTime: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500', marginTop: 2 },
  emptyState: { padding: 30, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.border },
  emptyText: { color: Colors.textSecondary, fontWeight: '500', fontSize: 14 },
  signatureContainer: { alignItems: 'center', marginTop: 20, marginBottom: 10, opacity: 0.4 },
  signatureText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
});
