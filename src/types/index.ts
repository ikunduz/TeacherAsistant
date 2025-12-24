export interface Teacher {
  fullName: string;
  subject: string;
  themeColor?: string; // İsteğe bağlı tema rengi
  businessLogo?: string;
  businessColor?: string;
}

export interface ScheduleItem {
  day: number; // 0: Pazar, 1: Pazartesi, ..., 6: Cumartesi
  time: string; // "HH:mm" formatında
  lessonType?: 'FaceToFace' | 'Online';
}

export interface MetricValue {
  date: string;
  score: number;
}

export interface Metric {
  id: string;
  name: string;
  type: 'star' | 'numeric' | 'percentage';
  values: MetricValue[];
}

export interface Student {
  id: string;
  fullName: string;
  phoneNumber: string;
  grade: string;
  gender: 'Erkek' | 'Kız';
  lessonFee: number;
  balance: number;
  notes: string;
  lastTopic: string;
  homeworkNotes: string;
  createdAt: string;
  schedule?: ScheduleItem[];
  image?: string | null;
  statusTag?: 'Beginner' | 'Intermediate' | 'Advanced' | 'On Hold';
  remainingLessons: number;
  metrics: Metric[];
  evaluationNote?: string;
  customMeetingLink?: string;
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
  lessonType?: 'FaceToFace' | 'Online';
}

export interface AvailabilitySlot {
  id: string;
  day: number; // 0-6
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isAvailable: boolean;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  date: string;
  paymentMethod?: 'Cash' | 'Bank Transfer' | 'Card' | 'Other';
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
