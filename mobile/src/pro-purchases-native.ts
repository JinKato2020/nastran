import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import {
  PRO_OFFERING, PurchaseCancelled, PurchasePending, hasProEntitlement,
  isProPackage, validPublicAppleKey, type ProPurchases,
} from './pro-purchases';

const appleKey = Platform.OS === 'ios' ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?.trim() : undefined;
let configured = false;

function configure() {
  if (configured) return;
  if (!validPublicAppleKey(appleKey)) throw new Error('RevenueCatのiOS公開SDKキーが設定されていません。');
  Purchases.configure({ apiKey: appleKey });
  configured = true;
}

export const nativeProPurchases: ProPurchases | null = Platform.OS === 'ios' && validPublicAppleKey(appleKey) ? {
  async getAccess() {
    configure();
    return hasProEntitlement(await Purchases.getCustomerInfo());
  },
  onAccessChange(listener) {
    configure();
    const update = (info: Awaited<ReturnType<typeof Purchases.getCustomerInfo>>) => listener(hasProEntitlement(info));
    Purchases.addCustomerInfoUpdateListener(update);
    return () => { Purchases.removeCustomerInfoUpdateListener(update); };
  },
  async getOffer() {
    configure();
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.all[PRO_OFFERING]?.lifetime;
    if (!pkg || !isProPackage(pkg)) return null;
    return {
      price: pkg.product.priceString,
      async purchase() {
        try {
          const { customerInfo } = await Purchases.purchasePackage(pkg);
          return hasProEntitlement(customerInfo);
        } catch (error) {
          const purchaseError = error as { userCancelled?: boolean; code?: string } | null;
          if (purchaseError?.userCancelled || purchaseError?.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
            throw new PurchaseCancelled();
          }
          if (purchaseError?.code === Purchases.PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) throw new PurchasePending();
          throw error;
        }
      },
    };
  },
  async restore() {
    configure();
    return hasProEntitlement(await Purchases.restorePurchases());
  },
} : null;
