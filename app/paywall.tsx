import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { CheckCircle2, Crown, Shield, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Dimensions, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSubscription } from '../src/context/SubscriptionContext';

const { width } = Dimensions.get('window');

export default function PaywallScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { packages, purchasePackage, restorePurchases, isPro, loading } = useSubscription();
    const [purchasing, setPurchasing] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');

    const benefits = [
        { text: t('paywall.unlimitedStudents') || 'Unlimited Students & Groups' },
        { text: t('paywall.proReports') || 'Professional Branded PDF Reports' },
        { text: t('paywall.advancedAnalytics') || 'Advanced Financial Analytics' },
        { text: t('paywall.packageSystem') || 'Premium Package Tracking System' },
        { text: t('profile.backupRestoreTitle') || 'Cloud Backup & Sync' },
    ];

    const getPackageByType = (type: 'ANNUAL' | 'MONTHLY') => {
        if (!packages) return null;
        return packages.find(p => p.packageType === type);
    };

    const yearlyPackage = getPackageByType('ANNUAL');
    const monthlyPackage = getPackageByType('MONTHLY');

    const handlePurchase = async () => {
        const pkg = selectedPlan === 'yearly' ? yearlyPackage : monthlyPackage;

        if (!pkg) {
            Alert.alert(t('common.error'), "Package not available");
            return;
        }

        setPurchasing(true);
        const success = await purchasePackage(pkg);
        setPurchasing(false);

        if (success) {
            Alert.alert(
                t('common.success') || 'Success',
                t('paywall.welcomePro') || 'Welcome to CoachPro!',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        }
    };

    const handleRestore = async () => {
        setPurchasing(true);
        const success = await restorePurchases();
        setPurchasing(false);
        if (success) {
            Alert.alert(t('common.success'), t('paywall.restored') || 'Purchases restored!', [{ text: 'OK', onPress: () => router.back() }]);
        } else {
            Alert.alert(t('common.error'), t('paywall.noRestore') || 'No purchases to restore');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E91E63" />
                <Text style={styles.loadingText}>{t('common.loading') || 'Loading...'}</Text>
            </View>
        );
    }

    // Calculate savings
    const monthlyPrice = monthlyPackage?.product?.price || 3.99;
    const yearlyPrice = yearlyPackage?.product?.price || 24.99;
    const yearlyMonthly = yearlyPrice / 12;
    const savingsPercent = Math.round((1 - yearlyMonthly / monthlyPrice) * 100);

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#FCE4EC', '#FFFFFF']} style={styles.gradient}>
                {/* Close Button */}
                <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
                    <X size={24} color="#666" />
                </TouchableOpacity>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.crownContainer}>
                            <Crown size={48} color="#E91E63" />
                        </View>
                        <Text style={styles.title}>{t('paywall.unlockPotential') || 'Unlock Your Full Potential'}</Text>
                        <Text style={styles.subtitle}>{t('paywall.joinElite') || 'Join elite coaches worldwide and scale your business.'}</Text>
                    </View>

                    {/* Benefits */}
                    <View style={styles.benefitsContainer}>
                        {benefits.map((benefit, index) => (
                            <View key={index} style={styles.benefitRow}>
                                <CheckCircle2 size={20} color="#4CAF50" />
                                <Text style={styles.benefitText}>{benefit.text}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Plan Cards */}
                    <View style={styles.plansContainer}>
                        {/* Yearly Plan - Featured */}
                        <TouchableOpacity
                            style={[styles.planCard, styles.yearlyCard, selectedPlan === 'yearly' && styles.selectedCard]}
                            onPress={() => setSelectedPlan('yearly')}
                        >
                            <View style={styles.saveBadge}>
                                <Text style={styles.saveBadgeText}>{t('paywall.save') || 'SAVE'} {savingsPercent}%</Text>
                            </View>
                            <View style={styles.planHeader}>
                                <Text style={styles.planLabel}>{t('paywall.yearlyAccess') || 'YEARLY ACCESS'}</Text>
                            </View>
                            <View style={styles.priceRow}>
                                {yearlyPackage ? (
                                    <>
                                        <Text style={styles.priceMain}>{yearlyPackage.product.priceString}</Text>
                                        <Text style={styles.pricePeriod}>/ {t('paywall.year') || 'year'}</Text>
                                    </>
                                ) : (
                                    <ActivityIndicator size="small" color="#E91E63" />
                                )}
                            </View>
                            <Text style={styles.priceNote}>
                                {t('paywall.only') || 'Only'} ${yearlyMonthly.toFixed(2)}/{t('paywall.month') || 'month'}
                            </Text>
                            <View style={[styles.radioCircle, selectedPlan === 'yearly' && styles.radioSelected]}>
                                {selectedPlan === 'yearly' && <View style={styles.radioInner} />}
                            </View>
                        </TouchableOpacity>

                        {/* Monthly Plan */}
                        <TouchableOpacity
                            style={[styles.planCard, styles.monthlyCard, selectedPlan === 'monthly' && styles.selectedCard]}
                            onPress={() => setSelectedPlan('monthly')}
                        >
                            <View style={styles.planHeader}>
                                <Text style={styles.planLabelGray}>{t('paywall.monthlyAccess') || 'MONTHLY ACCESS'}</Text>
                            </View>
                            <View style={styles.priceRow}>
                                {monthlyPackage ? (
                                    <>
                                        <Text style={styles.priceMainGray}>{monthlyPackage.product.priceString}</Text>
                                        <Text style={styles.pricePeriodGray}>/ {t('paywall.month') || 'month'}</Text>
                                    </>
                                ) : (
                                    <ActivityIndicator size="small" color="#888" />
                                )}
                            </View>
                            <View style={[styles.radioCircle, selectedPlan === 'monthly' && styles.radioSelected]}>
                                {selectedPlan === 'monthly' && <View style={styles.radioInner} />}
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* CTA Button */}
                    <TouchableOpacity
                        style={styles.ctaButton}
                        onPress={handlePurchase}
                        disabled={purchasing}
                    >
                        {purchasing ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.ctaText}>{t('paywall.startJourney') || 'Start My Pro Journey'}</Text>
                        )}
                    </TouchableOpacity>

                    {/* Guarantee */}
                    <View style={styles.guaranteeRow}>
                        <Shield size={14} color="#888" />
                        <Text style={styles.guaranteeText}>{t('paywall.guarantee') || '7-day money-back guarantee'}</Text>
                    </View>

                    {/* Footer Links */}
                    <View style={styles.footerLinks}>
                        <TouchableOpacity onPress={handleRestore}>
                            <Text style={styles.footerLink}>{t('paywall.restore') || 'Restore Purchase'}</Text>
                        </TouchableOpacity>
                        <Text style={styles.footerDot}>•</Text>
                        <TouchableOpacity onPress={() => Linking.openURL('https://coachpro-app.github.io/terms')}>
                            <Text style={styles.footerLink}>{t('paywall.terms') || 'Terms of Service'}</Text>
                        </TouchableOpacity>
                        <Text style={styles.footerDot}>•</Text>
                        <TouchableOpacity onPress={() => Linking.openURL('https://coachpro-app.github.io/privacy')}>
                            <Text style={styles.footerLink}>{t('paywall.privacy') || 'Privacy Policy'}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FCE4EC',
    },
    loadingText: {
        marginTop: 12,
        color: '#E91E63',
        fontSize: 16,
    },
    closeBtn: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 20,
    },
    scrollContent: {
        padding: 24,
        paddingTop: 80,
    },

    // Header
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    crownContainer: {
        width: 88,
        height: 88,
        backgroundColor: 'rgba(233, 30, 99, 0.1)',
        borderRadius: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#E91E63',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#1A1A2E',
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 16,
    },

    // Benefits
    benefitsContainer: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
    },
    benefitText: {
        fontSize: 15,
        color: '#333',
        flex: 1,
        fontWeight: '500',
    },

    // Plan Cards
    plansContainer: {
        gap: 14,
        marginBottom: 24,
    },
    planCard: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 2,
        position: 'relative',
    },
    yearlyCard: {
        backgroundColor: '#FFF0F5',
        borderColor: '#E91E63',
    },
    monthlyCard: {
        backgroundColor: '#FAFAFA',
        borderColor: '#E0E0E0',
    },
    selectedCard: {
        shadowColor: '#E91E63',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveBadge: {
        position: 'absolute',
        top: -10,
        right: 16,
        backgroundColor: '#4CAF50',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
    },
    saveBadgeText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '800',
    },
    planHeader: {
        marginBottom: 8,
    },
    planLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#E91E63',
        letterSpacing: 1,
    },
    planLabelGray: {
        fontSize: 12,
        fontWeight: '700',
        color: '#888',
        letterSpacing: 1,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    priceMain: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1A1A2E',
    },
    priceMainGray: {
        fontSize: 28,
        fontWeight: '700',
        color: '#444',
    },
    pricePeriod: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    pricePeriodGray: {
        fontSize: 15,
        color: '#888',
    },
    priceNote: {
        fontSize: 13,
        color: '#E91E63',
        marginTop: 4,
        fontWeight: '600',
    },
    radioCircle: {
        position: 'absolute',
        right: 20,
        top: '50%',
        marginTop: -12,
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#DDD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioSelected: {
        borderColor: '#E91E63',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#E91E63',
    },

    // CTA
    ctaButton: {
        backgroundColor: '#E91E63',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#E91E63',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
    ctaText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    // Guarantee
    guaranteeRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        marginTop: 16,
    },
    guaranteeText: {
        fontSize: 13,
        color: '#888',
    },

    // Footer
    footerLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 24,
    },
    footerLink: {
        fontSize: 12,
        color: '#888',
        textDecorationLine: 'underline',
    },
    footerDot: {
        color: '#CCC',
        fontSize: 12,
    },
});
