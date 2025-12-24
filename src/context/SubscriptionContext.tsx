import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';

interface SubscriptionContextType {
    isPro: boolean;
    isElite: boolean;
    packages: PurchasesPackage[] | null;
    loading: boolean;
    purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
    restorePurchases: () => Promise<boolean>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// API Keys - Replace with real keys from RevenueCat Dashboard
const API_KEY_ANDROID = "goog_placeholder_api_key";
const API_KEY_IOS = "appl_placeholder_api_key";

export const PREMIUM_LIMITS = {
    FREE_STUDENT_LIMIT: 5,
    FREE_GROUP_LIMIT: 1,
};

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    // DEV MODE: isPro = true for testing (set to false for production)
    const [isPro, setIsPro] = useState(__DEV__ ? true : false);
    const [isElite, setIsElite] = useState(false);
    const [packages, setPackages] = useState<PurchasesPackage[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                // Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

                if (Platform.OS === 'android' && API_KEY_ANDROID !== "goog_placeholder_api_key") {
                    Purchases.configure({ apiKey: API_KEY_ANDROID });
                } else if (Platform.OS === 'ios' && API_KEY_IOS !== "appl_placeholder_api_key") {
                    Purchases.configure({ apiKey: API_KEY_IOS });
                } else {
                    console.warn("RevenueCat: Placeholder API keys detected or platform unsupported. Skipping configuration.");
                    setLoading(false);
                    return;
                }

                const customerInfo = await Purchases.getCustomerInfo();
                updateStatus(customerInfo);

                const offerings = await Purchases.getOfferings();
                if (offerings.current !== null) {
                    setPackages(offerings.current.availablePackages);
                }

                const listener = (info: CustomerInfo) => {
                    updateStatus(info);
                };
                Purchases.addCustomerInfoUpdateListener(listener);

            } catch (e: any) {
                // Expo Go limitasyonu veya geçersiz API anahtarı durumunda uygulamayı kilitleme
                console.warn("RevenueCat Setup Warning:", e.message);
                // Geliştirme sırasında her şeyi açık görmek isterseniz burayı true yapabilirsiniz:
                // setIsPro(true); 
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    const updateStatus = (customerInfo: CustomerInfo) => {
        // These entitlement IDs should match what you set in RevenueCat Dashboard
        setIsPro(customerInfo.entitlements.active['pro'] !== undefined);
        setIsElite(customerInfo.entitlements.active['elite'] !== undefined);
    };

    const purchasePackage = async (pkg: any) => {
        try {
            const { customerInfo } = await Purchases.purchasePackage(pkg);
            updateStatus(customerInfo);
            return customerInfo.entitlements.active['pro'] !== undefined;
        } catch (e: any) {
            if (!e.userCancelled) {
                console.error("Purchase Error:", e);
            }
            return false;
        }
    };

    const restorePurchases = async () => {
        try {
            const customerInfo = await Purchases.restorePurchases();
            updateStatus(customerInfo);
            return customerInfo.entitlements.active['pro'] !== undefined;
        } catch (e) {
            console.error("Restore Error:", e);
            return false;
        }
    };

    return (
        <SubscriptionContext.Provider value={{ isPro, isElite, packages, loading, purchasePackage, restorePurchases }}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (!context) throw new Error('useSubscription must be used within a SubscriptionProvider');
    return context;
}
