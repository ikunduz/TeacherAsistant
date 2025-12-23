import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
// YENİ YOLLAR:
import { useData } from '../../src/context/DataContext';
import { Colors } from '../../src/constants/Colors';
import { UserPlus, Layers, CheckCircle, Wallet, Calendar, HelpCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useEffect } from 'react';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { teacher, students, lessons, groups } = useData();
  const totalBalance = students.reduce((sum, s) => sum + (s.balance || 0), 0);

  // Bugünkü planlanmış dersleri al
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

  const formattedDate = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('@has_launched');
      if (hasLaunched === null) {
        await AsyncStorage.setItem('@has_launched', 'true');
        // Biraz bekleyip yönlendir ki UI yüklensin
        setTimeout(() => {
          router.push('/help');
        }, 500);
      }
    } catch (error) {
      console.error('First launch check failed', error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <Text style={styles.greeting}>Merhaba,</Text>
          <Text style={styles.teacherName}>{teacher?.fullName || 'Öğretmenim'}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push('/help')} style={styles.helpButton}>
            <HelpCircle size={24} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.avatarPlaceholder}><Text style={styles.avatarText}>{teacher?.fullName?.[0] || 'Ö'}</Text></View>
        </View>
      </View>

      <View style={styles.heroContainer}>
        <LinearGradient colors={[Colors.primary, '#B83280']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balanceCard}>
          <View>
            <Text style={styles.balanceLabel}>Toplam Bekleyen Ödeme</Text>
            <Text style={styles.balanceValue}>{totalBalance} ₺</Text>
            <Text style={styles.balanceSub}>{students.filter(s => s.balance > 0).length} öğrenciden ödeme bekleniyor</Text>
          </View>
          <View style={styles.walletIconBg}><Wallet size={24} color="#FFF" /></View>
        </LinearGradient>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}><Text style={styles.statNumber}>{students.length}</Text><Text style={styles.statTitle}>Öğrenci</Text></View>
        <View style={styles.divider} />
        <View style={styles.statItem}><Text style={styles.statNumber}>{groups?.length || 0}</Text><Text style={styles.statTitle}>Grup</Text></View>
        <View style={styles.divider} />
        <View style={styles.statItem}><Text style={styles.statNumber}>{scheduledToday.length}</Text><Text style={styles.statTitle}>Bugün Ders</Text></View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>

        {/* Ana Buton: Ders İşle */}
        <TouchableOpacity style={styles.mainActionCard} onPress={() => router.push('/lesson-attendance')}>
          <CheckCircle size={24} color="#FFF" />
          <Text style={styles.mainActionCardTitle}>Ders İşle</Text>
        </TouchableOpacity>

        {/* Diğer Butonlar */}
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/add-student')}>
            <UserPlus size={24} color={Colors.textSecondary} />
            <Text style={styles.actionCardTitle}>Öğrenci Ekle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/add-group')}>
            <Layers size={24} color={Colors.textSecondary} />
            <Text style={styles.actionCardTitle}>Grup Oluştur</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/weekly-schedule')}>
            <Calendar size={24} color={Colors.textSecondary} />
            <Text style={styles.actionCardTitle}>Haftalık Program</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bugünkü Ders Programı</Text>
        {scheduledToday.length === 0 ? (
          <View style={styles.emptyState}><Text style={styles.emptyText}>Bugün için planlanmış ders bulunmuyor.</Text></View>
        ) : (
          scheduledToday.map((item, i) => (
            <View key={i} style={styles.lessonItem}>
              <View style={styles.lessonDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.lessonStudent}>{item.fullName || item.name}</Text>
                <Text style={styles.lessonTime}>{item.type === 'group' ? '👥 Grup' : '👤 Birebir'} • {item.scheduleItem.time}</Text>
              </View>
              <Text style={{ fontWeight: 'bold', color: Colors.primary }}>{item.scheduleItem.time}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.signatureContainer}>
        <Text style={styles.signatureText}>Made by ikunduz</Text>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { padding: 24, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500', textTransform: 'capitalize' },
  greeting: { fontSize: 16, color: Colors.text, marginTop: 4 },
  teacherName: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  helpButton: { padding: 8, backgroundColor: Colors.card, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
  heroContainer: { paddingHorizontal: 24, marginBottom: 24 },
  balanceCard: { padding: 24, borderRadius: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 4 },
  balanceValue: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginBottom: 4 },
  balanceSub: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },
  walletIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', backgroundColor: Colors.card, marginHorizontal: 24, padding: 16, borderRadius: 16, marginBottom: 24, elevation: 2 },
  statItem: { alignItems: 'center', flex: 1 },
  divider: { width: 1, height: 30, backgroundColor: Colors.border },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  statTitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  section: { paddingHorizontal: 24, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 16 },
  mainActionCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  mainActionCardTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginTop: 4,
  },
  lessonItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  lessonDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.success, marginRight: 12 },
  lessonStudent: { fontSize: 16, fontWeight: '600', color: Colors.text },
  lessonTime: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  emptyState: { padding: 20, alignItems: 'center' },
  emptyText: { color: Colors.textSecondary, fontStyle: 'italic' },
  signatureContainer: { alignItems: 'center', marginTop: 20, marginBottom: 10, opacity: 0.6 },
  signatureText: { fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
});
