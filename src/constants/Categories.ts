
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
            student: 'terminology.academic.student',
            lesson: 'terminology.academic.lesson',
            homework: 'terminology.academic.homework',
            attendance: 'terminology.academic.attendance',
            addStudent: 'terminology.academic.addStudent',
        },
        defaultMetrics: [
            { name: 'terminology.academic.metrics.metric1', type: 'star' },
            { name: 'terminology.academic.metrics.metric2', type: 'percentage' },
            { name: 'terminology.academic.metrics.metric3', type: 'star' },
        ],
    },
    music: {
        key: 'music',
        themeColor: Colors.purple, // Purple
        terms: {
            student: 'terminology.music.student',
            lesson: 'terminology.music.lesson',
            homework: 'terminology.music.homework',
            attendance: 'terminology.music.attendance',
            addStudent: 'terminology.music.addStudent',
        },
        defaultMetrics: [
            { name: 'terminology.music.metrics.metric1', type: 'star' },
            { name: 'terminology.music.metrics.metric2', type: 'star' },
            { name: 'terminology.music.metrics.metric3', type: 'numeric' },
        ],
    },
    sports: {
        key: 'sports',
        themeColor: Colors.orange, // Orange
        terms: {
            student: 'terminology.sports.student',
            lesson: 'terminology.sports.lesson',
            homework: 'terminology.sports.homework',
            attendance: 'terminology.sports.attendance',
            addStudent: 'terminology.sports.addStudent',
        },
        defaultMetrics: [
            { name: 'terminology.sports.metrics.metric1', type: 'numeric' },
            { name: 'terminology.sports.metrics.metric2', type: 'numeric' },
            { name: 'terminology.sports.metrics.metric3', type: 'star' },
        ],
    },
    arts: {
        key: 'arts',
        themeColor: Colors.pink, // Custom PINK needed if not in Colors
        terms: {
            student: 'terminology.arts.student',
            lesson: 'terminology.arts.lesson',
            homework: 'terminology.arts.homework',
            attendance: 'terminology.arts.attendance',
            addStudent: 'terminology.arts.addStudent',
        },
        defaultMetrics: [
            { name: 'terminology.arts.metrics.metric1', type: 'star' },
            { name: 'terminology.arts.metrics.metric2', type: 'numeric' },
            { name: 'terminology.arts.metrics.metric3', type: 'percentage' },
        ],
    },
    fitness: {
        key: 'fitness',
        themeColor: Colors.success, // Green
        terms: {
            student: 'terminology.fitness.student',
            lesson: 'terminology.fitness.lesson',
            homework: 'terminology.fitness.homework',
            attendance: 'terminology.fitness.attendance',
            addStudent: 'terminology.fitness.addStudent',
        },
        defaultMetrics: [
            { name: 'terminology.fitness.metrics.metric1', type: 'star' },
            { name: 'terminology.fitness.metrics.metric2', type: 'star' },
            { name: 'terminology.fitness.metrics.metric3', type: 'numeric' },
        ],
    },
    professional: {
        key: 'professional',
        themeColor: Colors.cyan, // Cyan
        terms: {
            student: 'terminology.professional.student',
            lesson: 'terminology.professional.lesson',
            homework: 'terminology.professional.homework',
            attendance: 'terminology.professional.attendance',
            addStudent: 'terminology.professional.addStudent',
        },
        defaultMetrics: [
            { name: 'terminology.professional.metrics.metric1', type: 'percentage' },
            { name: 'terminology.professional.metrics.metric2', type: 'star' },
            { name: 'terminology.professional.metrics.metric3', type: 'star' },
        ],
    },
};

export const getCategoryConfig = (key: string): CategoryConfig => {
    return CATEGORIES[key as CategoryKey] || CATEGORIES.academic;
};
