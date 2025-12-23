export interface Teacher {
  fullName: string;
  subject: string;
  themeColor?: string; // İsteğe bağlı tema rengi
}

export interface ScheduleItem {
  day: number; // 0: Pazar, 1: Pazartesi, ..., 6: Cumartesi
  time: string; // "HH:mm" formatında
}

export interface Student {
  id: string;
  fullName: string;
  phoneNumber: string;
  grade: string;
  gender: 'Erkek' | 'Kız';
  lessonFee: number;
  balance: number; // Bu alan kesinlikle number olacak
  notes: string;
  lastTopic: string;
  homeworkNotes: string;
  createdAt: string;
  schedule?: ScheduleItem[]; // Haftalık sabit ders programı (Dizi olarak güncellendi)
}

export interface Group {
  id: string;
  name: string;
  studentIds: string[];
  createdAt: string;
  schedule?: ScheduleItem[]; // Haftalık sabit ders programı (Dizi olarak güncellendi)
}

export interface Lesson {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  fee: number;
  topic?: string;
  type: 'individual' | 'group';
  groupId?: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  date: string;
}

// Lesson attendance types
export type LessonType = 'individual' | 'group';

export interface AttendanceItem {
  studentId: string;
  studentName: string;
  isPresent: boolean;
  fee: number;
}

export interface CreateLessonInput {
  studentId: string;
  studentName: string;
  date: string;
  fee: number;
  topic: string;
  type: LessonType;
  groupId?: string;
}
