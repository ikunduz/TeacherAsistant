import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Teacher, Student, Lesson, Payment, Group, AttendanceItem } from '../types';
import { StorageService } from '../services/storage';

interface DataContextType {
  teacher: Teacher | null;
  students: Student[];
  lessons: Lesson[];
  payments: Payment[];
  groups: Group[];
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
  refreshData: () => Promise<void>;
  getStudentsByGroupId: (groupId: string) => Student[];
  takeAttendance: (groupId: string, date: string, topic: string, attendanceList: AttendanceItem[]) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [teacher, setTeacherState] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [t, s, l, p, g] = await Promise.all([
        StorageService.getTeacher(),
        StorageService.getStudents(),
        StorageService.getLessons(),
        StorageService.getPayments(),
        StorageService.getGroups(),
      ]);
      setTeacherState(t);
      setStudents(s);
      setLessons(l);
      setPayments(p);
      setGroups(g || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const setTeacher = async (v: Teacher) => { await StorageService.saveTeacher(v); setTeacherState(v); };
  const addStudent = async (v: Student) => { const n = [...students, v]; await StorageService.saveStudents(n); setStudents(n); };
  const updateStudent = async (v: Student) => { const n = students.map(s => s.id === v.id ? v : s); await StorageService.saveStudents(n); setStudents(n); };
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
    if (s) await updateStudent({ ...s, balance: s.balance + v.fee, lastTopic: v.topic || s.lastTopic });
  };
  const addBatchLessons = async (newLessons: Lesson[]) => {
    const nl = [...lessons, ...newLessons];
    const tempStudents = [...students];
    newLessons.forEach(l => {
      const idx = tempStudents.findIndex(s => s.id === l.studentId);
      if (idx > -1) {
        tempStudents[idx] = {
          ...tempStudents[idx],
          balance: tempStudents[idx].balance + l.fee,
          lastTopic: l.topic || tempStudents[idx].lastTopic
        };
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
      teacher, students, lessons, payments, groups, loading,
      setTeacher, addStudent, updateStudent, deleteStudent,
      addGroup, deleteGroup, addLesson, addBatchLessons, addPayment, refreshData,
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