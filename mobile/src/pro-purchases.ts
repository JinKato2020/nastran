export const PRO_ENTITLEMENT = 'fem_guide_for_nas_pro';
export const PRO_OFFERING = 'default';
export const PRO_PACKAGE = '$rc_lifetime';
export const IOS_PRO_PRODUCT = 'nastran_pro';

export type ProOffer = { price: string; purchase: () => Promise<boolean> };
export interface ProPurchases {
  getAccess(): Promise<boolean>;
  onAccessChange(listener: (active: boolean) => void): () => void;
  getOffer(): Promise<ProOffer | null>;
  restore(): Promise<boolean>;
}

export function hasProEntitlement(info: { entitlements: { active: Record<string, unknown> } }): boolean {
  return Boolean(info.entitlements.active[PRO_ENTITLEMENT]);
}

type LifetimePackage = { identifier: string; product: { identifier: string; priceString: string; productType: string } };
export function isProPackage(pkg: LifetimePackage | null | undefined): boolean {
  return !!pkg && pkg.identifier === PRO_PACKAGE && pkg.product.identifier === IOS_PRO_PRODUCT &&
    pkg.product.productType === 'NON_CONSUMABLE' && typeof pkg.product.priceString === 'string' && pkg.product.priceString.trim().length > 0;
}

export function validPublicAppleKey(key: string | undefined): key is string {
  return typeof key === 'string' && /^appl_[A-Za-z0-9]+$/.test(key);
}

export class PurchasePending extends Error {}
export class PurchaseCancelled extends Error {}
