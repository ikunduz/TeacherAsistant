import * as Haptics from 'expo-haptics';
import { DollarSign, MessageSquare, Trash2 } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import { Colors } from '../src/constants/Colors';

interface SwipeableStudentCardProps {
    item: any;
    currency: string;
    onPress: () => void;
    onDelete: () => void;
    onQuickPay: () => void;
    onMessage: () => void;
}

export const SwipeableStudentCard: React.FC<SwipeableStudentCardProps> = ({
    item,
    currency,
    onPress,
    onDelete,
    onQuickPay,
    onMessage
}) => {
    const { t } = useTranslation();

    const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
        const trans = dragX.interpolate({
            inputRange: [0, 50, 100],
            outputRange: [-20, 0, 0],
        });

        return (
            <RectButton style={styles.leftAction} onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onMessage();
            }}>
                <Animated.View style={[styles.actionContent, { transform: [{ translateX: trans }] }]}>
                    <MessageSquare color="#FFF" size={24} />
                    <Text style={styles.actionText}>{t('students.swipeMessage')}</Text>
                </Animated.View>
            </RectButton>
        );
    };

    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
        const trans = dragX.interpolate({
            inputRange: [-100, -50, 0],
            outputRange: [0, 0, 20],
        });

        return (
            <View style={styles.rightActionsRow}>
                <RectButton style={styles.rightActionBlue} onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    onQuickPay();
                }}>
                    <Animated.View style={[styles.actionContent, { transform: [{ translateX: trans }] }]}>
                        <DollarSign color="#FFF" size={24} />
                        <Text style={styles.actionText}>{t('students.swipePay')}</Text>
                    </Animated.View>
                </RectButton>
                <RectButton style={styles.rightActionRed} onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    onDelete();
                }}>
                    <Animated.View style={[styles.actionContent, { transform: [{ translateX: trans }] }]}>
                        <Trash2 color="#FFF" size={24} />
                        <Text style={styles.actionText}>{t('common.delete')}</Text>
                    </Animated.View>
                </RectButton>
            </View>
        );
    };

    return (
        <Swipeable
            renderLeftActions={renderLeftActions}
            renderRightActions={renderRightActions}
            friction={2}
            leftThreshold={30}
            rightThreshold={40}
            onSwipeableOpen={(direction) => {
                if (direction === 'left') {
                    // Action already triggered by button but we can put extra haptic here
                }
            }}
        >
            <TouchableOpacity
                style={styles.card}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={styles.avatarContainer}>
                    {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.avatarImage} />
                    ) : (
                        <Text style={styles.avatarText}>{item.fullName.charAt(0).toUpperCase()}</Text>
                    )}
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name}>{item.fullName}</Text>
                        {item.statusTag && (
                            <View style={[
                                styles.statusBadge,
                                {
                                    backgroundColor: item.statusTag === 'Beginner' ? '#EBF5FF' :
                                        item.statusTag === 'Intermediate' ? '#ECFDF5' :
                                            item.statusTag === 'Advanced' ? '#F5F3FF' : '#FFFBEB'
                                }
                            ]}>
                                <Text style={[
                                    styles.statusBadgeText,
                                    {
                                        color: item.statusTag === 'Beginner' ? '#3B82F6' :
                                            item.statusTag === 'Intermediate' ? '#10B981' :
                                                item.statusTag === 'Advanced' ? '#8B5CF6' : '#F59E0B'
                                    }
                                ]}>
                                    {t(`students.${item.statusTag.toLowerCase().replace(' ', '')}`)}
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.subText}>{item.grade} • {item.lessonFee} {currency}</Text>
                </View>

                <View style={styles.balanceContainer}>
                    <Text style={styles.balanceLabel}>{t('students.balance')}</Text>
                    <Text style={[styles.balanceValue, { color: item.balance > 0 ? Colors.primary : Colors.success }]}>
                        {item.balance} {currency}
                    </Text>
                </View>
            </TouchableOpacity>
        </Swipeable>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        marginVertical: 4,
        marginHorizontal: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF5F7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
        overflow: 'hidden',
    },
    avatarImage: { width: '100%', height: '100%' },
    avatarText: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },
    infoContainer: { flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    statusBadgeText: { fontSize: 10, fontWeight: 'bold' },
    subText: { fontSize: 13, color: '#64748B', marginTop: 2 },
    balanceContainer: { alignItems: 'flex-end' },
    balanceLabel: { fontSize: 10, color: '#64748B' },
    balanceValue: { fontSize: 16, fontWeight: 'bold' },

    leftAction: {
        flex: 1,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        borderRadius: 16,
        marginVertical: 4,
    },
    rightActionsRow: {
        width: 160,
        flexDirection: 'row',
        marginVertical: 4,
    },
    rightActionBlue: {
        flex: 1,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightActionRed: {
        flex: 1,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
    },
    actionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        gap: 8,
    },
    actionText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
});
