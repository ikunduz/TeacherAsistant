import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { CheckCircle2, Crown, ShieldCheck, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../src/constants/Colors';
import { useSubscription } from '../src/context/SubscriptionContext';

const { width } = Dimensions.get('window');

export default function PaywallScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { packages, purchasePackage, restorePurchases, isPro, loading } = useSubscription();
    const [purchasing, setPurchasing] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

    const benefits = [
        { icon: <CheckCircle2 size={22} color="#10B981" />, text: t('paywall.unlimitedStudents') },
        { icon: <CheckCircle2 size={22} color="#10B981" />, text: t('paywall.proReports') },
        { icon: <CheckCircle2 size={22} color="#10B981" />, text: t('paywall.advancedAnalytics') },
        { icon: <CheckCircle2 size={22} color="#10B981" />, text: t('paywall.packageSystem') },
        { icon: <CheckCircle2 size={22} color="#10B981" />, text: t('paywall.cloudBackup') },
    ];

    const handlePurchase = async () => {
        if (!packages) return;

        // Find the relevant package based on selection
        const pkg = packages.find((p: any) =>
            selectedPlan === 'yearly' ? p.packageType === 'ANNUAL' : p.packageType === 'MONTHLY'
        );

        if (!pkg) {
            Alert.alert(t('common.error'), "No package found");
            return;
        }

        setPurchasing(true);
        const success = await purchasePackage(pkg);
        setPurchasing(false);

        if (success) {
            Alert.alert(t('common.success'), t('paywall.title'), [{ text: 'OK', onPress: () => router.back() }]);
        }
    };

    const handleRestore = async () => {
        setPurchasing(true);
        const success = await restorePurchases();
        setPurchasing(false);
        if (success) {
            Alert.alert(t('common.success'), t('paywall.title'), [{ text: 'OK', onPress: () => router.back() }]);
        } else {
            Alert.alert(t('common.error'), t('common.noData'));
        }
    };

    if (loading) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#7C3AED" /></View>;
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#7C3AED', '#4C1D95']} style={styles.header}>
                <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
                    <X size={24} color="#FFF" />
                </TouchableOpacity>

                <View style={styles.crownContainer}>
                    <Crown size={60} color="#FBBF24" />
                </View>

                <Text style={styles.title}>{t('paywall.title')}</Text>
                <Text style={styles.subtitle}>{t('paywall.subtitle')}</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.benefitsContainer}>
                    {benefits.map((b, i) => (
                        <View key={i} style={styles.benefitRow}>
                            {b.icon}
                            <Text style={styles.benefitText}>{b.text}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.plansContainer}>
                    <TouchableOpacity
                        style={[styles.planCard, selectedPlan === 'monthly' && styles.selectedPlan]}
                        onPress={() => setSelectedPlan('monthly')}
                    >
                        <View style={styles.planInfo}>
                            <Text style={styles.planName}>{t('paywall.monthly')}</Text>
                            <Text style={styles.planPrice}>₺89.99 / мес</Text>
                        </View>
                        <View style={[styles.radio, selectedPlan === 'monthly' && styles.radioActive]} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.planCard, selectedPlan === 'yearly' && styles.selectedPlan]}
                        onPress={() => setSelectedPlan('yearly')}
                    >
                        <View style={styles.bestValueBadge}>
                            <Text style={styles.bestValueText}>{t('paywall.bestValue')}</Text>
                        </View>
                        <View style={styles.planInfo}>
                            <Text style={styles.planName}>{t('paywall.yearly')}</Text>
                            <Text style={styles.planPrice}>₺699.99 / год</Text>
                            <Text style={styles.saveText}>{t('paywall.savePercent', { percent: 35 })}</Text>
                        </View>
                        <View style={[styles.radio, selectedPlan === 'yearly' && styles.radioActive]} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.subscribeBtn}
                    onPress={handlePurchase}
                    disabled={purchasing}
                >
                    {purchasing ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.subscribeBtnText}>{t('paywall.startTrial')}</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore}>
                    <Text style={styles.restoreText}>{t('paywall.restore')}</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <ShieldCheck size={16} color={Colors.textSecondary} />
                    <Text style={styles.footerText}>Secure payment with App Store & Google Play</Text>
                </View>

                <View style={styles.legalLinks}>
                    <Text style={styles.legalText}>{t('paywall.terms')}</Text>
                    <View style={styles.legalDot} />
                    <Text style={styles.legalText}>{t('paywall.privacy')}</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        paddingTop: 60,
        paddingBottom: 40,
        alignItems: 'center',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    closeBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 8 },
    crownContainer: {
        width: 100,
        height: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: { fontSize: 32, fontWeight: '900', color: '#FFF', marginBottom: 10 },
    subtitle: { fontSize: 16, color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', paddingHorizontal: 40 },

    scrollContent: { padding: 24, paddingBottom: 60 },
    benefitsContainer: { marginBottom: 30 },
    benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 16 },
    benefitText: { fontSize: 16, fontWeight: '600', color: Colors.text },

    plansContainer: { gap: 16, marginBottom: 30 },
    planCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#F3F4F6',
        backgroundColor: '#F9FAFB',
    },
    selectedPlan: {
        borderColor: '#7C3AED',
        backgroundColor: '#F5F3FF',
    },
    bestValueBadge: {
        position: 'absolute',
        top: -12,
        right: 24,
        backgroundColor: '#FBBF24',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    bestValueText: { fontSize: 12, fontWeight: '900', color: '#FFF' },
    planInfo: { flex: 1 },
    planName: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 4 },
    planPrice: { fontSize: 16, color: Colors.textSecondary, fontWeight: '600' },
    saveText: { fontSize: 12, color: '#10B981', fontWeight: 'bold', marginTop: 4 },
    radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#D1D5DB' },
    radioActive: { borderColor: '#7C3AED', borderWidth: 8 },

    subscribeBtn: {
        backgroundColor: '#7C3AED',
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    subscribeBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
    restoreBtn: { marginTop: 20, padding: 10, alignItems: 'center' },
    restoreText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },

    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 30 },
    footerText: { fontSize: 12, color: Colors.textSecondary },

    legalLinks: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 15 },
    legalText: { fontSize: 12, color: Colors.textSecondary, textDecorationLine: 'underline' },
    legalDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' },
});
