import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useData } from '../../src/context/DataContext';
import { Colors } from '../../src/constants/Colors';
import { ArrowLeft, Users, User, ChevronRight, Trash2 } from 'lucide-react-native';

export default function GroupDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { groups, students, lessons, deleteGroup } = useData();

    const groupId = Array.isArray(id) ? id[0] : id;
    const group = groups.find(g => g.id === groupId);

    if (!group) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color={Colors.text} /></TouchableOpacity>
                </View>
                <View style={styles.center}>
                    <Text style={{ color: Colors.text }}>Grup bulunamadı.</Text>
                </View>
            </View>
        );
    }

    // Gruptaki öğrencileri bul
    const groupStudents = students.filter(s => group.studentIds.includes(s.id));

    // Grubun toplam alacağı (Öğrencilerin bakiyeleri toplamı)
    const totalBalance = groupStudents.reduce((sum, s) => sum + s.balance, 0);

    // Grup ders geçmişi
    const groupLessons = lessons
        .filter(l => l.groupId === groupId)
        // Benzersiz tarihleri al (Aynı ders birden fazla öğrenciye kayıtlı olduğu için)
        .filter((v, i, a) => a.findIndex(t => t.date === v.date) === i)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleDelete = () => {
        // Silme işlemi students.tsx'te tanımlıydı ama buradan da silinebilmeli
        // Ancak context'te deleteGroup var, onu kullanabiliriz.
        // Kullanıcı onayı için Alert kullanabiliriz ama basitlik adına şimdilik sadece fonksiyonu çağıralım
        // veya students.tsx'teki gibi bir onay mekanizması ekleyebiliriz.
        // Şimdilik sadece geri dönelim, silme ana ekranda var.
    };

    const renderStudentItem = ({ item }: { item: typeof students[0] }) => (
        <TouchableOpacity
            style={styles.studentCard}
            onPress={() => router.push(`/student/${item.id}`)}
        >
            <View style={styles.studentInfo}>
                <User size={20} color={Colors.primary} />
                <View>
                    <Text style={styles.studentName}>{item.fullName}</Text>
                    <Text style={styles.studentSub}>{item.grade}</Text>
                </View>
            </View>
            <View style={styles.balanceContainer}>
                <Text style={[styles.balanceValue, { color: item.balance > 0 ? Colors.primary : Colors.success }]}>
                    {item.balance} ₺
                </Text>
                <ChevronRight size={16} color={Colors.textSecondary} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <ArrowLeft size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Grup Detayı</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* GRUP KARTI */}
                <View style={styles.groupCard}>
                    <View style={styles.groupHeader}>
                        <Users size={32} color={Colors.primary} />
                        <View style={{ marginLeft: 16 }}>
                            <Text style={styles.groupName}>{group.name}</Text>
                            <Text style={styles.groupSub}>{groupStudents.length} Öğrenci</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.balanceRow}>
                        <Text style={styles.balanceLabel}>Toplam Grup Alacağı</Text>
                        <Text style={styles.totalBalance}>{totalBalance} ₺</Text>
                    </View>
                </View>

                {/* ÖĞRENCİ LİSTESİ */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Öğrenciler</Text>
                    {groupStudents.map(student => (
                        <View key={student.id}>{renderStudentItem({ item: student })}</View>
                    ))}
                    {groupStudents.length === 0 && <Text style={styles.emptyText}>Bu grupta öğrenci yok.</Text>}
                </View>

                {/* DERS GEÇMİŞİ */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Grup Ders Geçmişi</Text>
                    {groupLessons.map(lesson => (
                        <View key={lesson.id} style={styles.lessonCard}>
                            <Text style={styles.lessonDate}>
                                {new Date(lesson.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </Text>
                            <Text style={styles.lessonTopic}>{lesson.topic || 'Konu Belirtilmemiş'}</Text>
                        </View>
                    ))}
                    {groupLessons.length === 0 && <Text style={styles.emptyText}>Henüz grup dersi yapılmamış.</Text>}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 50, backgroundColor: Colors.card },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
    iconBtn: { padding: 8, backgroundColor: Colors.background, borderRadius: 12 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    groupCard: { margin: 20, padding: 20, backgroundColor: Colors.card, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    groupHeader: { flexDirection: 'row', alignItems: 'center' },
    groupName: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
    groupSub: { color: Colors.textSecondary, marginTop: 4 },
    divider: { height: 1, backgroundColor: Colors.border, marginVertical: 16 },
    balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    balanceLabel: { fontSize: 14, color: Colors.textSecondary },
    totalBalance: { fontSize: 24, fontWeight: 'bold', color: Colors.primary },

    section: { paddingHorizontal: 20, marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 12 },

    studentCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.card, padding: 16, borderRadius: 16, marginBottom: 10 },
    studentInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    studentName: { fontSize: 16, fontWeight: '600', color: Colors.text },
    studentSub: { fontSize: 12, color: Colors.textSecondary },
    balanceContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    balanceValue: { fontWeight: 'bold', fontSize: 16 },

    lessonCard: { backgroundColor: Colors.card, padding: 16, borderRadius: 12, marginBottom: 8 },
    lessonDate: { fontSize: 14, fontWeight: '600', color: Colors.text },
    lessonTopic: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
    emptyText: { color: Colors.textSecondary, fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
});
