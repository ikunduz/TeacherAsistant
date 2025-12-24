import {
    Book,
    BookOpen,
    Brush,
    Code,
    Dumbbell,
    HeartPulse,
    Mic2,
    Music,
    Palette,
    Terminal,
    Timer,
    Trophy,
    UserPlus,
    Users,
    Zap
} from 'lucide-react-native';

export type CategoryType = 'academic' | 'music' | 'sports' | 'arts' | 'fitness' | 'professional';

export const getCategoryIcon = (category: string | undefined) => {
    switch (category?.toLowerCase()) {
        case 'music':
            return Music;
        case 'sports':
            return Dumbbell;
        case 'arts':
            return Palette;
        case 'fitness':
            return HeartPulse;
        case 'professional':
            return Code;
        case 'academic':
        default:
            return Book;
    }
};

export const getActionIcon = (category: string | undefined, action: 'addStudent' | 'addGroup' | 'session') => {
    const cat = category?.toLowerCase();

    if (action === 'addStudent') {
        switch (cat) {
            case 'music': return Mic2;
            case 'sports': return Trophy;
            case 'arts': return Brush;
            case 'fitness': return Zap;
            case 'professional': return Terminal;
            default: return UserPlus;
        }
    }

    if (action === 'addGroup') {
        return Users;
    }

    if (action === 'session') {
        switch (cat) {
            case 'music': return Music;
            case 'sports': return Timer;
            case 'arts': return Brush;
            case 'fitness': return Zap;
            default: return BookOpen;
        }
    }

    return Book;
};

export const getCategoryActionLabel = (category: string | undefined, studentLabel: string) => {
    const cat = category?.toLowerCase();
    switch (cat) {
        case 'sports': return 'addAthlete';
        case 'music': return 'addPerformer';
        case 'fitness': return 'addClient';
        case 'professional': return 'addTrainee';
        default: return 'addStudent';
    }
};
