
import { Colors } from './Colors';

export type CategoryKey = 'academic' | 'music' | 'sports' | 'arts' | 'fitness' | 'professional';

export interface CategoryConfig {
    key: CategoryKey;
    themeColor: string;
    terms: {
        student: string;
        lesson: string;
        homework: string;
        attendance: string;
        addStudent: string; // "Yeni Öğrenci Ekle" gibi dinamik
    };
    defaultMetrics: {
        name: string;
        type: 'star' | 'numeric' | 'percentage';
    }[];
}

export const CATEGORIES: Record<CategoryKey, CategoryConfig> = {
    academic: {
        key: 'academic',
        themeColor: Colors.primary, // Blue
        terms: {
            student: 'Öğrenci',
            lesson: 'Ders',
            homework: 'Ödev',
            attendance: 'Yoklama',
            addStudent: 'Yeni Öğrenci Ekle',
        },
        defaultMetrics: [
            { name: 'Ödev Takibi', type: 'star' },
            { name: 'Sınav Başarısı', type: 'percentage' },
            { name: 'Derse Katılım', type: 'star' },
        ],
    },
    music: {
        key: 'music',
        themeColor: Colors.purple, // Purple
        terms: {
            student: 'Öğrenci',
            lesson: 'Ders / Prova',
            homework: 'Egzersiz',
            attendance: 'Katılım',
            addStudent: 'Yeni Öğrenci Ekle',
        },
        defaultMetrics: [
            { name: 'Ritim Duygusu', type: 'star' },
            { name: 'Nota Okuma', type: 'star' },
            { name: 'Teknik', type: 'numeric' },
        ],
    },
    sports: {
        key: 'sports',
        themeColor: Colors.orange, // Orange
        terms: {
            student: 'Sporcu',
            lesson: 'Antrenman',
            homework: 'Program',
            attendance: 'Devam',
            addStudent: 'Yeni Sporcu Ekle',
        },
        defaultMetrics: [
            { name: 'Teknik Kapasite', type: 'numeric' },
            { name: 'Dayanıklılık', type: 'numeric' },
            { name: 'Oyun Zekası', type: 'star' },
        ],
    },
    arts: {
        key: 'arts',
        themeColor: Colors.pink, // Custom PINK needed if not in Colors
        terms: {
            student: 'Kursiyer',
            lesson: 'Atölye',
            homework: 'Proje',
            attendance: 'Katılım',
            addStudent: 'Yeni Kursiyer Ekle',
        },
        defaultMetrics: [
            { name: 'Yaratıcılık', type: 'star' },
            { name: 'Teknik Beceri', type: 'numeric' },
            { name: 'Proje İlerlemesi', type: 'percentage' },
        ],
    },
    fitness: {
        key: 'fitness',
        themeColor: Colors.success, // Green
        terms: {
            student: 'Danışan',
            lesson: 'Seans',
            homework: 'Hedef',
            attendance: 'Durum',
            addStudent: 'Yeni Danışan Ekle',
        },
        defaultMetrics: [
            { name: 'Motivasyon', type: 'star' },
            { name: 'Beslenme Uyumu', type: 'star' },
            { name: 'Kilo Takibi', type: 'numeric' },
        ],
    },
    professional: {
        key: 'professional',
        themeColor: Colors.cyan, // Cyan
        terms: {
            student: 'Danışan',
            lesson: 'Görüşme',
            homework: 'Görev',
            attendance: 'Durum',
            addStudent: 'Yeni Danışan Ekle',
        },
        defaultMetrics: [
            { name: 'Aksiyon Planı', type: 'percentage' },
            { name: 'Hedef Tuturma', type: 'star' },
            { name: 'Toplantı Verimi', type: 'star' },
        ],
    },
};

export const getCategoryConfig = (key: string): CategoryConfig => {
    return CATEGORIES[key as CategoryKey] || CATEGORIES.academic;
};
