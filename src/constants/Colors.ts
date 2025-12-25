/**
 * Premium Design System Colors
 * Based on the new CoachPro design mockups
 */
export const Colors = {
  // Primary palette
  primary: '#5B93FF',      // Main blue
  primaryLight: '#E0F2FE',
  primaryDark: '#0284C7',

  // Background colors
  background: '#F8F9FB',
  card: '#FFFFFF',

  // Text colors
  text: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  // Status colors
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#065F46',

  error: '#EF4444',
  errorLight: '#FEE2E2',

  warning: '#F59E0B',
  warningLight: '#FEF3C7',

  // Accent colors for cards/badges
  purple: '#8B5CF6',
  purpleLight: '#E9D5FF',
  purpleDark: '#6B21A8',

  orange: '#F97316',
  orangeLight: '#FFEDD5',

  cyan: '#06B6D4',
  cyanLight: '#CFFAFE',

  pink: '#EC4899',
  pinkLight: '#FCE7F3',

  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // iOS specific
  iosBg: '#F2F2F7',
  iosBlue: '#007AFF',
  iosRed: '#FF3B30',
  iosGreen: '#34C759',
  iosGray: '#8E8E93',
  iosSeparator: '#C6C6C8',

  // Shadow
  shadowColor: '#000000',
};

// Badge/Tag colors
export const TagColors = {
  advanced: { bg: '#E9D5FF', text: '#6B21A8' },
  beginner: { bg: '#D1FAE5', text: '#065F46' },
  intermediate: { bg: '#FEF3C7', text: '#92400E' },
  onhold: { bg: '#FEE2E2', text: '#991B1B' },
  pro: { bg: '#E0F2FE', text: '#0284C7' },
};

// Filter/Tab colors
export const FilterColors = {
  thisMonth: { bg: '#E9D8FD', text: '#553C9A' },
  lastMonth: { bg: '#B2F5EA', text: '#285E61' },
  thisQuarter: { bg: '#FEFCBF', text: '#975A16' },
  thisYear: { bg: '#FED7D7', text: '#9B2C2C' },
};

// Theme colors for user selection
export const ThemePresets = [
  { key: 'blue', color: '#5B93FF' },
  { key: 'purple', color: '#8B5CF6' },
  { key: 'green', color: '#10B981' },
  { key: 'orange', color: '#F97316' },
  { key: 'cyan', color: '#06B6D4' },
  { key: 'pink', color: '#EC4899' },
];

export default Colors;
