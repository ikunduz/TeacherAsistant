import { useRouter } from 'expo-router';
import { Plus, Search, Trash2, User, UserPlus, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../src/constants/Colors';
import { useData } from '../../src/context/DataContext';

export default function StudentsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { students, groups, deleteStudent, deleteGroup, settings } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'individual' | 'group'>('individual');

  // --- FILTERING LOGIC ---
  const soloStudents = students.filter(student => {
    const isInAnyGroup = groups.some(group => group.studentIds.includes(student.id));
    return !isInAnyGroup;
  });

  const filteredSoloStudents = soloStudents.filter(student =>
    student.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- DELETE ACTIONS ---
  const handleDeleteStudent = (studentId: string, studentName: string) => {
    Alert.alert(
      t('students.deleteConfirmTitle'),
      t('students.deleteConfirmMessage', { name: studentName }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStudent(studentId);
            } catch (error) {
              Alert.alert(t('common.error'), t('common.error'));
            }
          },
        },
      ]
    );
  };

  const handleDeleteGroup = (groupId: string, groupName: string) => {
    Alert.alert(
      t('students.deleteGroupConfirmTitle'),
      t('students.deleteGroupConfirmMessage', { name: groupName }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGroup(groupId);
            } catch (error) {
              Alert.alert(t('common.error'), t('common.error'));
            }
          },
        },
      ]
    );
  };

  // --- RENDER ITEMS ---
  const renderStudentItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/student/${item.id}`)}
    >
      <View style={styles.avatarContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{item.fullName.charAt(0).toUpperCase()}</Text>
        )}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{item.fullName}</Text>
          {item.statusTag && (
            <View style={[
              styles.statusBadge,
              {
                backgroundColor: item.statusTag === 'Beginner' ? '#EBF5FF' :
                  item.statusTag === 'Intermediate' ? '#ECFDF5' :
                    item.statusTag === 'Advanced' ? '#F5F3FF' : '#FFFBEB'
              }
            ]}>
              <Text style={[
                styles.statusBadgeText,
                {
                  color: item.statusTag === 'Beginner' ? '#3B82F6' :
                    item.statusTag === 'Intermediate' ? '#10B981' :
                      item.statusTag === 'Advanced' ? '#8B5CF6' : '#F59E0B'
                }
              ]}>
                {t(`students.${item.statusTag.toLowerCase().replace(' ', '')}`)}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.subText}>{item.grade} • {item.lessonFee} {settings.currency}</Text>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>{t('students.balance')}</Text>
        <Text style={[styles.balanceValue, { color: item.balance > 0 ? Colors.primary : Colors.success }]}>
          {item.balance} {settings.currency}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteStudent(item.id, item.fullName)}
      >
        <Trash2 size={20} color={Colors.error || '#FF4444'} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderGroupItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/group/${item.id}` as any)}
    >
      <View style={styles.avatarContainer}>
        <Users size={24} color={Colors.primary} />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.subText}>{item.studentIds.length} {t('students.title')}</Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteGroup(item.id, item.name)}
      >
        <Trash2 size={20} color={Colors.error || '#FF4444'} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('students.title')}</Text>
        <TouchableOpacity
          onPress={() => router.push(activeTab === 'individual' ? '/add-student' : '/add-group')}
          style={styles.addButton}
        >
          {activeTab === 'individual' ? <UserPlus size={24} color={Colors.primary} /> : <Plus size={24} color={Colors.primary} />}
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'individual' && styles.activeTab]}
          onPress={() => setActiveTab('individual')}
        >
          <User size={18} color={activeTab === 'individual' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'individual' && styles.activeTabText]}>{t('students.individuals')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'group' && styles.activeTab]}
          onPress={() => setActiveTab('group')}
        >
          <Users size={18} color={activeTab === 'group' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'group' && styles.activeTabText]}>{t('students.groups')}</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#A0AEC0" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('common.search')}
          placeholderTextColor="#A0AEC0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* List */}
      {activeTab === 'individual' ? (
        <FlatList
          data={filteredSoloStudents}
          keyExtractor={item => item.id}
          renderItem={renderStudentItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <User size={48} color="#CBD5E0" />
              <Text style={styles.emptyText}>
                {searchQuery ? t('students.noResults') : t('students.noStudents')}
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredGroups}
          keyExtractor={item => item.id}
          renderItem={renderGroupItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Users size={48} color="#CBD5E0" />
              <Text style={styles.emptyText}>
                {searchQuery ? t('students.noResults') : t('students.noGroups')}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: Colors.card,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  addButton: { padding: 8, backgroundColor: '#FFF5F7', borderRadius: 12 },

  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  activeTab: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF5F7',
  },
  tabText: {
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: 16, color: Colors.text },

  listContent: { paddingHorizontal: 20, paddingBottom: 20 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },
  infoContainer: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  statusBadgeText: { fontSize: 10, fontWeight: 'bold' },
  subText: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  balanceContainer: { alignItems: 'flex-end', marginRight: 16 },
  balanceLabel: { fontSize: 10, color: Colors.textSecondary },
  balanceValue: { fontSize: 16, fontWeight: 'bold' },

  deleteButton: {
    padding: 8,
  },

  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: Colors.textSecondary, marginTop: 10, fontSize: 16 },
});
