import { useTranslation } from 'react-i18next';
import { getCategoryConfig } from '../constants/Categories';
import { useData } from '../context/DataContext';

export const useTerminology = () => {
    const { t } = useTranslation();
    const { settings } = useData();
    const category = settings.instructionCategory || 'academic';
    const config = getCategoryConfig(category);

    return {
        student: t(config.terms.student),
        lesson: t(config.terms.lesson),
        homework: t(config.terms.homework),
        attendance: t(config.terms.attendance),
        addStudent: t(config.terms.addStudent),
    };
};

export const useCategoryConfig = () => {
    const { settings } = useData();
    const category = settings.instructionCategory || 'academic';
    return getCategoryConfig(category);
};
