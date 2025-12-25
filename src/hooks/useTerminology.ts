import { getCategoryConfig } from '../constants/Categories';
import { useData } from '../context/DataContext';

export const useTerminology = () => {
    const { settings } = useData();
    const category = settings.instructionCategory || 'academic';
    const config = getCategoryConfig(category);
    return config.terms;
};

export const useCategoryConfig = () => {
    const { settings } = useData();
    const category = settings.instructionCategory || 'academic';
    return getCategoryConfig(category);
};
