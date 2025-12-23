import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useData } from '../src/context/DataContext';
import { Colors } from '../src/constants/Colors';
import { User, Users, Clock, ArrowLeft } from 'lucide-react-native';
import { useRouter, Stack } from 'expo-router';

interface ScheduledItem {
  name: string;
  time: string;
  day: number;
  type: 'individual' | 'group';
}

export default function WeeklyScheduleScreen() {
  const { students, groups } = useData();
  const router = useRouter();

  const weekDays = [
    { label: 'Pazartesi', value: 1 }, { label: 'Salı', value: 2 }, { label: 'Çarşamba', value: 3 },
    { label: 'Perşembe', value: 4 }, { label: 'Cuma', value: 5 }, { label: 'Cumartesi', value: 6 },
    { label: 'Pazar', value: 0 }
  ];

  const schedule = useMemo(() => {
    const allItems: ScheduledItem[] = [];
    students.forEach(student => {
      student.schedule?.forEach(sc => {
        allItems.push({
          name: student.fullName,
          time: sc.time,
          day: sc.day,
          type: 'individual',
        });
      });
    });
    groups.forEach(group => {
      group.schedule?.forEach(sc => {
        allItems.push({
          name: group.name,
          time: sc.time,
          day: sc.day,
          type: 'group',
        });
      });
    });
    return allItems.sort((a, b) => a.time.localeCompare(b.time));
  }, [students, groups]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Haftalık Program</Text>
      </View>

      <ScrollView>
        {weekDays.map(day => {
          const dayLessons = schedule.filter(item => item.day === day.value);
          if (dayLessons.length === 0) return null;

          return (
            <View key={day.value} style={styles.dayContainer}>
              <Text style={styles.dayTitle}>{day.label}</Text>
              {dayLessons.map((item, index) => (
                <View key={index} style={styles.lessonCard}>
                  <View style={styles.timeContainer}>
                    <Clock size={16} color={Colors.primary} />
                    <Text style={styles.timeText}>{item.time}</Text>
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonName}>{item.name}</Text>
                    <View style={styles.lessonTypeContainer}>
                      {item.type === 'individual' ? <User size={14} color={Colors.textSecondary} /> : <Users size={14} color={Colors.textSecondary} />}
                      <Text style={styles.lessonTypeText}>{item.type === 'individual' ? 'Birebir Ders' : 'Grup Dersi'}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.card,
  },
  backButton: { marginRight: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  dayContainer: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  lessonCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeContainer: {
    alignItems: 'center',
    marginRight: 16,
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 4,
  },
  lessonInfo: { flex: 1 },
  lessonName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  lessonTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  lessonTypeText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
