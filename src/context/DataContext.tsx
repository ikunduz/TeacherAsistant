import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCategoryConfig } from '../constants/Categories';
import i18n from '../i18n/config';
import { NotificationService } from '../services/notifications';
import { StorageService } from '../services/storage';
import { AttendanceItem, AvailabilitySlot, Group, Lesson, Metric, MetricValue, Payment, Student, Teacher } from '../types';

// Cihaz diline göre varsayılan para birimi
const getDefaultCurrency = (): '$' | '€' | '₺' | '£' => {
  const locales = Localization.getLocales();
  if (locales && locales.length > 0) {
    const langCode = locales[0].languageCode;
    if (langCode === 'tr') return '₺';
    if (langCode === 'de' || langCode === 'fr' || langCode === 'es' || langCode === 'it') return '€';
    if (langCode === 'en' && locales[0].regionCode === 'GB') return '£';
  }
  return '$'; // Default: USD
};

interface AppSettings {
  currency: '$' | '€' | '₺' | '£';
  instructionCategory: string;
  language: string;
  taxRate: number;
  defaultMeetingLink: string;
  availability: AvailabilitySlot[];
  blockedSlots?: { day: number; hour: number }[];
  notificationsEnabled: boolean;
}

interface DataContextType {
  teacher: Teacher | null;
  students: Student[];
  lessons: Lesson[];
  payments: Payment[];
  groups: Group[];
  settings: AppSettings;
  loading: boolean;
  setTeacher: (teacher: Teacher) => Promise<void>;
  addStudent: (student: Student) => Promise<void>;
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  addGroup: (group: Group) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  addLesson: (lesson: Lesson) => Promise<void>;
  addBatchLessons: (lessons: Lesson[]) => Promise<void>;
  addPayment: (payment: Payment) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  addPackage: (studentId: string, count: number, totalAmount: number, paymentMethod?: string) => Promise<void>;
  addMetric: (studentId: string, name: string, type: 'star' | 'numeric' | 'percentage') => Promise<void>;
  updateMetricScore: (studentId: string, metricId: string, score: number) => Promise<void>;
  updateEvaluationNote: (studentId: string, note: string) => Promise<void>;
  deleteMetric: (studentId: string, metricId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  getStudentsByGroupId: (groupId: string) => Student[];
  takeAttendance: (groupId: string, date: string, topic: string, attendanceList: AttendanceItem[]) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [teacher, setTeacherState] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [settings, setSettingsState] = useState<AppSettings>({
    currency: getDefaultCurrency(),
    instructionCategory: '',
    language: 'en',
    taxRate: 0,
    defaultMeetingLink: '',
    availability: [],
    notificationsEnabled: false
  });
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  // Bildirimleri zamanlama mantığı
  useEffect(() => {
    if (!loading && settings.notificationsEnabled) {
      NotificationService.scheduleLessonNotifications(students, t);
    } else if (!loading && !settings.notificationsEnabled) {
      NotificationService.cancelAllNotifications();
    }
  }, [students, settings.notificationsEnabled, loading]);

  const loadData = async () => {
    try {
      const [t, s, l, p, g, sets] = await Promise.all([
        StorageService.getTeacher(),
        StorageService.getStudents(),
        StorageService.getLessons(),
        StorageService.getPayments(),
        StorageService.getGroups(),
        StorageService.getSettings(),
      ]);
      setTeacherState(t);
      setStudents(s);
      setLessons(l);
      setPayments(p);
      setGroups(g || []);
      if (sets && sets.language && sets.instructionCategory) {
        setSettingsState(sets);
        i18n.changeLanguage(sets.language);
      } else {
        const savedLang = await AsyncStorage.getItem('@app_language');
        if (savedLang) {
          setSettingsState(prev => ({ ...prev, language: savedLang }));
          i18n.changeLanguage(savedLang);
          if (!sets?.instructionCategory) {
            setTimeout(() => router.push('/onboarding/category' as any), 500);
          }
        } else {
          setTimeout(() => router.push('/onboarding/language' as any), 500);
        }
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const setTeacher = async (v: Teacher) => { await StorageService.saveTeacher(v); setTeacherState(v); };

  const addStudent = async (v: Student) => {
    // Seed default metrics if none provided
    let initialMetrics = v.metrics || [];
    if (initialMetrics.length === 0) {
      const config = getCategoryConfig(settings.instructionCategory || 'academic');
      initialMetrics = config.defaultMetrics.map((m, i) => ({
        id: Date.now().toString() + '-' + i,
        name: m.name,
        type: m.type,
        values: []
      }));
    }

    const studentWithMetrics = { ...v, metrics: initialMetrics };
    const n = [...students, studentWithMetrics];
    await StorageService.saveStudents(n);
    setStudents(n);
  };

  const updateStudent = async (v: Student) => {
    const n = students.map(s => s.id === v.id ? v : s);
    await StorageService.saveStudents(n);
    setStudents(n);
  };

  const deleteStudent = async (id: string) => {
    const ns = students.filter(s => s.id !== id);
    const ng = groups.map(g => ({ ...g, studentIds: g.studentIds.filter(x => x !== id) }));
    await StorageService.saveStudents(ns);
    await StorageService.saveGroups(ng);
    setStudents(ns);
    setGroups(ng);
  };

  const addGroup = async (v: Group) => { const n = [...groups, v]; await StorageService.saveGroups(n); setGroups(n); };
  const deleteGroup = async (id: string) => { const n = groups.filter(g => g.id !== id); await StorageService.saveGroups(n); setGroups(n); };

  const addLesson = async (v: Lesson) => {
    const nl = [...lessons, v];
    await StorageService.saveLessons(nl);
    setLessons(nl);
    const s = students.find(x => x.id === v.studentId);
    if (s) {
      if (s.remainingLessons > 0) {
        await updateStudent({ ...s, remainingLessons: s.remainingLessons - 1, lastTopic: v.topic || s.lastTopic });
      } else {
        await updateStudent({ ...s, balance: s.balance + v.fee, lastTopic: v.topic || s.lastTopic });
      }
    }
  };

  const addBatchLessons = async (newLessons: Lesson[]) => {
    const nl = [...lessons, ...newLessons];
    const tempStudents = [...students];
    newLessons.forEach(l => {
      const idx = tempStudents.findIndex(s => s.id === l.studentId);
      if (idx > -1) {
        const s = tempStudents[idx];
        if (s.remainingLessons > 0) {
          tempStudents[idx] = {
            ...s,
            remainingLessons: s.remainingLessons - 1,
            lastTopic: l.topic || s.lastTopic
          };
        } else {
          tempStudents[idx] = {
            ...s,
            balance: s.balance + l.fee,
            lastTopic: l.topic || s.lastTopic
          };
        }
      }
    });
    await Promise.all([StorageService.saveLessons(nl), StorageService.saveStudents(tempStudents)]);
    setLessons(nl);
    setStudents(tempStudents);
  };

  const addPayment = async (v: Payment) => {
    const np = [...payments, v];
    await StorageService.savePayments(np);
    setPayments(np);
    const s = students.find(x => x.id === v.studentId);
    if (s) await updateStudent({ ...s, balance: s.balance - v.amount });
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    await StorageService.saveSettings(updated);
    setSettingsState(updated);
  };

  const addPackage = async (studentId: string, count: number, totalAmount: number, paymentMethod?: string) => {
    const s = students.find(x => x.id === studentId);
    if (!s) return;

    // Paket peşin ödeme olduğu için:
    // 1. Mevcut bakiye varsa sıfırla (paket ücreti borcu kapattı)
    // 2. remainingLessons artır
    const updatedStudent = {
      ...s,
      remainingLessons: (s.remainingLessons || 0) + count,
      balance: 0  // Paket peşin ödendiği için bakiye sıfırlanır
    };
    await updateStudent(updatedStudent);

    // Save payment record without altering balance
    if (totalAmount > 0) {
      const newPayment = {
        id: Date.now().toString(),
        studentId,
        studentName: s.fullName,
        amount: totalAmount,
        date: new Date().toISOString(),
        paymentMethod: paymentMethod as any || 'Other',
      };
      const np = [...payments, newPayment];
      await StorageService.savePayments(np);
      setPayments(np);
    }
  };

  const addMetric = async (studentId: string, name: string, type: 'star' | 'numeric' | 'percentage') => {
    const s = students.find(x => x.id === studentId);
    if (!s) return;
    const newMetric: Metric = { id: Date.now().toString(), name, type, values: [] };
    const updatedStudent = { ...s, metrics: [...(s.metrics || []), newMetric] };
    await updateStudent(updatedStudent);
  };

  const updateMetricScore = async (studentId: string, metricId: string, score: number) => {
    const s = students.find(x => x.id === studentId);
    if (!s) return;
    const newValue: MetricValue = { date: new Date().toISOString(), score };
    const updatedMetrics = (s.metrics || []).map(m =>
      m.id === metricId ? { ...m, values: [...(m.values || []), newValue] } : m
    );
    await updateStudent({ ...s, metrics: updatedMetrics });
  };

  const updateEvaluationNote = async (studentId: string, note: string) => {
    const s = students.find(x => x.id === studentId);
    if (!s) return;
    await updateStudent({ ...s, evaluationNote: note });
  };

  const deleteMetric = async (studentId: string, metricId: string) => {
    const s = students.find(x => x.id === studentId);
    if (!s) return;
    const updatedMetrics = (s.metrics || []).filter(m => m.id !== metricId);
    await updateStudent({ ...s, metrics: updatedMetrics });
  };

  const refreshData = async () => { await loadData(); };

  const getStudentsByGroupId = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return [];
    return students.filter(s => group.studentIds.includes(s.id));
  };

  const takeAttendance = async (groupId: string, date: string, topic: string, attendanceList: AttendanceItem[]) => {
    const lessonsToAdd: Lesson[] = attendanceList.map(att => ({
      id: Date.now().toString() + Math.random(),
      studentId: att.studentId,
      studentName: att.studentName,
      date,
      fee: att.fee,
      topic,
      type: 'group' as const,
      groupId
    }));
    await addBatchLessons(lessonsToAdd);
  };

  return (
    <DataContext.Provider value={{
      teacher, students, lessons, payments, groups, settings, loading,
      setTeacher, addStudent, updateStudent, deleteStudent,
      addGroup, deleteGroup, addLesson, addBatchLessons, addPayment, updateSettings, addPackage,
      addMetric, updateMetricScore, updateEvaluationNote, deleteMetric, refreshData,
      getStudentsByGroupId, takeAttendance
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData error');
  return context;
}