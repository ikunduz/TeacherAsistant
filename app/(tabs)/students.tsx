import { useRouter } from 'expo-router';
import { ArrowLeft, CreditCard, MessageCircle, Search, Users } from 'lucide-react-native';
import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Image,
  Linking,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, TagColors } from '../../src/constants/Colors';
import { useData } from '../../src/context/DataContext';
import { Student } from '../../src/types';

type TabType = 'individuals' | 'groups';

export default function StudentsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { students, groups, settings } = useData();
  const [activeTab, setActiveTab] = useState<TabType>('individuals');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(s =>
      s.fullName.toLowerCase().includes(query) ||
      s.grade?.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  // Filter groups based on search
  const filteredGroups = useMemo(() => {
    if (!searchQuery) return groups;
    const query = searchQuery.toLowerCase();
    return groups.filter(g => g.name.toLowerCase().includes(query));
  }, [groups, searchQuery]);

  const formatCurrency = (amount: number) => {
    const symbol = settings.currency || '₺';
    const prefix = amount < 0 ? '-' : '';
    return `${prefix}${symbol}${Math.abs(amount).toFixed(2)}`;
  };

  const getTagStyle = (tag?: string) => {
    switch (tag?.toLowerCase()) {
      case 'advanced':
        return TagColors.advanced;
      case 'beginner':
        return TagColors.beginner;
      case 'intermediate':
        return TagColors.intermediate;
      default:
        return TagColors.beginner;
    }
  };

  const handleWhatsApp = (phone?: string) => {
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      Linking.openURL(`whatsapp://send?phone=${cleanPhone}`);
    }
  };

  const handleCollectPayment = (studentId: string) => {
    router.push(`/student/${studentId}?openPayment=true` as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>

        {showSearch ? (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={t('common.search')}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
        ) : (
          <Text style={styles.headerTitle}>{t('students.title')}</Text>
        )}

        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setShowSearch(!showSearch)}
        >
          <Search size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'individuals' && styles.tabActive]}
          onPress={() => setActiveTab('individuals')}
        >
          <Text style={[styles.tabText, activeTab === 'individuals' && styles.tabTextActive]}>
            {t('students.individuals')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'groups' && styles.tabActive]}
          onPress={() => setActiveTab('groups')}
        >
          <Text style={[styles.tabText, activeTab === 'groups' && styles.tabTextActive]}>
            {t('students.groups')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'individuals' ? (
          filteredStudents.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t('students.noStudents')}</Text>
            </View>
          ) : (
            filteredStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                formatCurrency={formatCurrency}
                getTagStyle={getTagStyle}
                onPress={() => router.push(`/student/${student.id}` as any)}
                onWhatsApp={() => handleWhatsApp(student.phoneNumber)}
                onCollectPayment={() => handleCollectPayment(student.id)}
              />
            ))
          )
        ) : (
          filteredGroups.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t('groups.noGroups')}</Text>
            </View>
          ) : (
            filteredGroups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={styles.groupCard}
                onPress={() => router.push(`/group/${group.id}` as any)}
              >
                <View style={styles.groupInfo}>
                  <View style={styles.groupIconContainer}>
                    <Users size={24} color={Colors.orange} />
                  </View>
                  <View>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupSubtext}>
                      {group.studentIds.length} {t('students.title')}
                    </Text>
                  </View>
                </View>
                <View style={styles.groupBalance}>
                  <Text style={styles.balanceLabel}>{t('students.balance')}</Text>
                  <Text style={styles.balanceValuePositive}>
                    {formatCurrency(0)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// Swipeable Student Card Component
interface StudentCardProps {
  student: Student;
  formatCurrency: (amount: number) => string;
  getTagStyle: (tag?: string) => { bg: string; text: string };
  onPress: () => void;
  onWhatsApp: () => void;
  onCollectPayment: () => void;
}

function StudentCard({
  student,
  formatCurrency,
  getTagStyle,
  onPress,
  onWhatsApp,
  onCollectPayment
}: StudentCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const tagStyle = getTagStyle(student.statusTag);
  const { t } = useTranslation();

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10;
      },
      onPanResponderMove: (_, gestureState) => {
        // Limit swipe distance
        const clampedX = Math.max(-100, Math.min(100, gestureState.dx));
        translateX.setValue(clampedX);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) {
          // Swipe left - WhatsApp
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
          }).start();
        } else if (gestureState.dx > 50) {
          // Swipe right - Collect Payment
          Animated.spring(translateX, {
            toValue: 80,
            useNativeDriver: true,
          }).start();
        } else {
          // Reset
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const resetPosition = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.swipeContainer}>
      {/* Left Action - Collect Payment */}
      <TouchableOpacity
        style={[styles.swipeAction, styles.swipeActionLeft]}
        onPress={() => {
          resetPosition();
          onCollectPayment();
        }}
      >
        <CreditCard size={20} color={Colors.textSecondary} />
        <Text style={styles.swipeActionText}>{t('finance.collectPayment')}</Text>
      </TouchableOpacity>

      {/* Right Action - WhatsApp */}
      <TouchableOpacity
        style={[styles.swipeAction, styles.swipeActionRight]}
        onPress={() => {
          resetPosition();
          onWhatsApp();
        }}
      >
        <MessageCircle size={20} color={Colors.success} />
        <Text style={styles.swipeActionText}>WhatsApp</Text>
      </TouchableOpacity>

      {/* Card */}
      <Animated.View
        style={[
          styles.studentCard,
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity style={styles.studentCardInner} onPress={onPress} activeOpacity={0.9}>
          <View style={styles.studentInfo}>
            {student.image ? (
              <Image source={{ uri: student.image }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: Colors.primary + '20' }]}>
                <Text style={[styles.avatarText, { color: Colors.primary }]}>
                  {student.fullName.charAt(0)}
                </Text>
              </View>
            )}
            <View style={styles.studentDetails}>
              <Text style={styles.studentName}>{student.fullName}</Text>
              <View style={[styles.tag, { backgroundColor: tagStyle.bg }]}>
                <Text style={[styles.tagText, { color: tagStyle.text }]}>
                  {t(`students.${student.statusTag?.toLowerCase().replace(' ', '') || 'beginner'}`)}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>{t('students.balance')}</Text>
            <Text
              style={[
                styles.balanceValue,
                student.balance < 0 ? styles.balanceNegative : styles.balancePositive,
              ]}
            >
              {formatCurrency(student.balance)}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: Colors.card,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
  },
  searchButton: {
    padding: 8,
    marginRight: -8,
  },
  searchContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  searchInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },

  // Swipe Container
  swipeContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    height: 112,
  },
  swipeAction: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
  },
  swipeActionLeft: {
    left: 0,
  },
  swipeActionRight: {
    right: 0,
  },
  swipeActionText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Student Card
  studentCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  studentCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    height: 112,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  balanceNegative: {
    color: Colors.error,
  },
  balancePositive: {
    color: Colors.success,
  },

  // Group Card
  groupCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  groupIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.orangeLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  groupSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  groupBalance: {
    alignItems: 'flex-end',
  },
  balanceValuePositive: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.success,
  },
});
