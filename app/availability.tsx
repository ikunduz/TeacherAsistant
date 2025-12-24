import { useRouter } from 'expo-router';
import { Check, ChevronLeft, Clock, Edit2, Plus, Share2, Trash2, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../src/constants/Colors';
import { useData } from '../src/context/DataContext';
import { AvailabilitySlot } from '../src/types';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function AvailabilityScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { settings, updateSettings, teacher } = useData();
    const [availability, setAvailability] = useState<AvailabilitySlot[]>(settings.availability || []);

    // Modal state
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');

    const themeColor = teacher?.themeColor || Colors.primary;

    const handleToggleSlot = (slotId: string) => {
        setAvailability(prev => prev.map(slot =>
            slot.id === slotId ? { ...slot, isAvailable: !slot.isAvailable } : slot
        ));
    };

    const handleAddSlot = (dayIndex: number) => {
        setEditingSlot({ id: '', day: dayIndex, startTime: '09:00', endTime: '10:00', isAvailable: true });
        setStartTime('09:00');
        setEndTime('10:00');
        setIsModalVisible(true);
    };

    const handleEditSlot = (slot: AvailabilitySlot) => {
        setEditingSlot(slot);
        setStartTime(slot.startTime);
        setEndTime(slot.endTime);
        setIsModalVisible(true);
    };

    const handleSaveSlot = () => {
        if (!editingSlot) return;

        if (editingSlot.id === '') {
            const newSlot: AvailabilitySlot = {
                id: Date.now().toString(),
                day: editingSlot.day,
                startTime,
                endTime,
                isAvailable: true
            };
            setAvailability(prev => [...prev, newSlot]);
        } else {
            setAvailability(prev => prev.map(s =>
                s.id === editingSlot.id ? { ...s, startTime, endTime } : s
            ));
        }
        setIsModalVisible(false);
        setEditingSlot(null);
    };

    const handleDeleteSlot = (slotId: string) => {
        setAvailability(prev => prev.filter(s => s.id !== slotId));
    };

    const handleSave = async () => {
        try {
            await updateSettings({ availability });
            Alert.alert(t('common.success'), t('profile.saveSuccess'));
            router.back();
        } catch (e) {
            Alert.alert(t('common.error'), t('common.error'));
        }
    };

    const handleShare = async () => {
        const sortedAvailability = [...availability]
            .filter(s => s.isAvailable)
            .sort((a, b) => {
                if (a.day !== b.day) return a.day - b.day;
                return a.startTime.localeCompare(b.startTime);
            });

        if (sortedAvailability.length === 0) {
            Alert.alert(t('common.error'), t('common.noData'));
            return;
        }

        let shareText = `${t('students.shareSchedulePrefix')}\n\n`;
        let currentDay = -1;

        sortedAvailability.forEach(slot => {
            if (slot.day !== currentDay) {
                shareText += `\n*${t(`students.${DAYS[slot.day]}`)}*:\n`;
                currentDay = slot.day;
            }
            shareText += `• ${slot.startTime} - ${slot.endTime}\n`;
        });

        try {
            await Share.share({ message: shareText, title: t('students.availability') });
        } catch (error) {
            Alert.alert(t('common.error'), t('common.error'));
        }
    };

    return (
        <View style={styles.container}>
            {/* iOS-style Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={Colors.iosBlue} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('students.availability')}</Text>
                <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
                    <Share2 size={20} color={themeColor} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {DAYS.map((day, index) => {
                    const daySlots = availability.filter(s => s.day === index);
                    return (
                        <View key={day}>
                            <View style={styles.dayHeaderRow}>
                                <Text style={styles.sectionHeader}>{t(`students.${day}`).toUpperCase()}</Text>
                                <TouchableOpacity onPress={() => handleAddSlot(index)} style={[styles.addButton, { backgroundColor: themeColor + '15' }]}>
                                    <Plus size={16} color={themeColor} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.card}>
                                {daySlots.length === 0 ? (
                                    <View style={styles.emptyRow}>
                                        <Text style={styles.emptyText}>{t('common.noData')}</Text>
                                    </View>
                                ) : (
                                    daySlots.map((slot, i) => (
                                        <View key={slot.id}>
                                            <View style={styles.slotRow}>
                                                <TouchableOpacity
                                                    style={styles.slotInfo}
                                                    onPress={() => handleToggleSlot(slot.id)}
                                                >
                                                    <Clock size={18} color={slot.isAvailable ? themeColor : Colors.textMuted} />
                                                    <Text style={[styles.slotTime, !slot.isAvailable && styles.slotTimeInactive]}>
                                                        {slot.startTime} - {slot.endTime}
                                                    </Text>
                                                    {slot.isAvailable ? (
                                                        <View style={[styles.statusBadge, { backgroundColor: Colors.successLight }]}>
                                                            <Check size={12} color={Colors.success} />
                                                        </View>
                                                    ) : (
                                                        <View style={[styles.statusBadge, { backgroundColor: Colors.errorLight }]}>
                                                            <X size={12} color={Colors.error} />
                                                        </View>
                                                    )}
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => handleEditSlot(slot)} style={styles.actionButton}>
                                                    <Edit2 size={16} color={themeColor} />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => handleDeleteSlot(slot.id)} style={styles.actionButton}>
                                                    <Trash2 size={16} color={Colors.error} />
                                                </TouchableOpacity>
                                            </View>
                                            {i < daySlots.length - 1 && <View style={styles.separator} />}
                                        </View>
                                    ))
                                )}
                            </View>
                        </View>
                    );
                })}
                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={[styles.saveButton, { backgroundColor: themeColor }]} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                </TouchableOpacity>
            </View>

            {/* Time Edit Modal */}
            <Modal visible={isModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editingSlot?.id === '' ? t('common.add') : t('common.edit')}
                        </Text>

                        <View style={styles.timeInputRow}>
                            <View style={styles.timeInputGroup}>
                                <Text style={styles.timeLabel}>{t('students.startTime')}</Text>
                                <TextInput
                                    style={styles.timeInput}
                                    value={startTime}
                                    onChangeText={setStartTime}
                                    placeholder="09:00"
                                    placeholderTextColor={Colors.textMuted}
                                    keyboardType="numbers-and-punctuation"
                                    textAlign="center"
                                />
                            </View>
                            <Text style={styles.timeSeparator}>—</Text>
                            <View style={styles.timeInputGroup}>
                                <Text style={styles.timeLabel}>{t('students.endTime')}</Text>
                                <TextInput
                                    style={styles.timeInput}
                                    value={endTime}
                                    onChangeText={setEndTime}
                                    placeholder="10:00"
                                    placeholderTextColor={Colors.textMuted}
                                    keyboardType="numbers-and-punctuation"
                                    textAlign="center"
                                />
                            </View>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.confirmButton, { backgroundColor: themeColor }]} onPress={handleSaveSlot}>
                                <Text style={styles.confirmButtonText}>{t('common.save')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.iosBg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 12,
        backgroundColor: Colors.iosBg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.iosSeparator,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: Colors.text,
    },
    shareButton: {
        padding: 8,
        borderRadius: 8,
    },
    content: {
        padding: 16,
    },

    // Day Header
    dayHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 8,
        marginHorizontal: 4,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '400',
        color: '#6D6D72',
        letterSpacing: 0.5,
    },
    addButton: {
        padding: 6,
        borderRadius: 8,
    },

    // Card
    card: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: Colors.shadowColor,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },

    // Slot Row
    slotRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 8,
    },
    slotInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    slotTime: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        flex: 1,
    },
    slotTimeInactive: {
        color: Colors.textMuted,
        textDecorationLine: 'line-through',
    },
    statusBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: Colors.iosBg,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: Colors.iosSeparator,
        marginLeft: 46,
    },
    emptyRow: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.textMuted,
        fontStyle: 'italic',
        fontSize: 14,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        paddingBottom: 34,
        backgroundColor: Colors.card,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.iosSeparator,
    },
    saveButton: {
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '600',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: Colors.card,
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 340,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 24,
        textAlign: 'center',
    },
    timeInputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
    },
    timeInputGroup: {
        flex: 1,
    },
    timeLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: Colors.textSecondary,
        marginBottom: 8,
        textAlign: 'center',
    },
    timeInput: {
        backgroundColor: Colors.iosBg,
        borderRadius: 12,
        padding: 14,
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    timeSeparator: {
        fontSize: 18,
        fontWeight: '500',
        color: Colors.textMuted,
        marginBottom: 14,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    cancelButton: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        backgroundColor: Colors.iosBg,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.textSecondary,
    },
    confirmButton: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
});
