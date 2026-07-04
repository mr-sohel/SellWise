export const BUSINESS_TYPES = [
  'facebook_seller',
  'small_shop',
  'online_store',
  'wholesaler',
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const BUSINESS_TYPE_LABELS: Record<BusinessType, { en: string; bn: string }> = {
  facebook_seller: { en: 'Facebook Seller', bn: 'ফেসবুক বিক্রেতা' },
  small_shop: { en: 'Small Shop', bn: 'ছোট দোকান' },
  online_store: { en: 'Online Store', bn: 'অনলাইন দোকান' },
  wholesaler: { en: 'Wholesaler', bn: 'পাইকারি বিক্রেতা' },
};

export const SALES_CHANNELS = [
  'facebook',
  'whatsapp',
  'walk_in',
  'website',
  'other',
] as const;

export type SalesChannel = (typeof SALES_CHANNELS)[number];

export const SALES_CHANNEL_LABELS: Record<SalesChannel, { en: string; bn: string }> = {
  facebook: { en: 'Facebook Messenger', bn: 'ফেসবুক মেসেঞ্জার' },
  whatsapp: { en: 'WhatsApp', bn: 'হোয়াটসঅ্যাপ' },
  walk_in: { en: 'Walk-in / In-Person', bn: 'ওয়াক-ইন / ইন-পার্সন' },
  website: { en: 'Website / Online', bn: 'ওয়েবসাইট / অনলাইন' },
  other: { en: 'Other', bn: 'অন্যান্য' },
};

export const DEFAULT_CATEGORIES_BY_TYPE: Record<BusinessType, string[]> = {
  facebook_seller: ['Electronics', 'Accessories', 'Audio', 'Clothing', 'Beauty', 'Home & Kitchen'],
  small_shop: ['Grocery', 'Snacks & Beverages', 'Dairy & Eggs', 'Household', 'Personal Care', 'Stationery'],
  online_store: ['Electronics', 'Clothing', 'Beauty', 'Home & Kitchen', 'Sports', 'Books'],
  wholesaler: ['General Merchandise'],
};
