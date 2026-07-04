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

// ─── Category Presets (for onboarding) ──────────────────────────────────────

export const CATEGORY_PRESET_IDS = [
  'gadgets',
  'clothing',
  'beauty',
  'home',
  'grocery',
  'sports',
  'books',
  'health',
  'auto',
  'general',
] as const;

export type CategoryPresetId = (typeof CATEGORY_PRESET_IDS)[number];

export interface CategoryPreset {
  id: CategoryPresetId;
  icon: string;
  label: { en: string; bn: string };
  categories: string[];
}

export const CATEGORY_PRESETS: CategoryPreset[] = [
  {
    id: 'gadgets',
    icon: '📱',
    label: { en: 'Gadgets & Electronics', bn: 'গ্যাজেট ও ইলেকট্রনিক্স' },
    categories: ['Mobile Phones', 'Phone Accessories', 'Computers & Laptops', 'Audio & Speakers', 'Cameras'],
  },
  {
    id: 'clothing',
    icon: '👕',
    label: { en: 'Clothing & Fashion', bn: 'পোশাক ও ফ্যাশন' },
    categories: ["Men's Clothing", "Women's Clothing", 'Shoes', 'Bags & Accessories', 'Traditional Wear'],
  },
  {
    id: 'beauty',
    icon: '💄',
    label: { en: 'Beauty & Personal Care', bn: 'সৌন্দর্য ও ব্যক্তিগত যত্ন' },
    categories: ['Skincare', 'Makeup', 'Haircare', 'Fragrances', 'Personal Care'],
  },
  {
    id: 'home',
    icon: '🏠',
    label: { en: 'Home & Kitchen', bn: 'হোম ও কিচেন' },
    categories: ['Kitchenware', 'Furniture', 'Home Decor', 'Bedding', 'Lighting'],
  },
  {
    id: 'grocery',
    icon: '🛒',
    label: { en: 'Grocery & Super Shop', bn: 'গ্রোসারি ও সুপার শপ' },
    categories: ['Rice & Grains', 'Oil & Spices', 'Snacks & Beverages', 'Dairy & Eggs', 'Cleaning Supplies'],
  },
  {
    id: 'sports',
    icon: '⚽',
    label: { en: 'Sports & Outdoors', bn: 'খেলাধুলা ও আউটডোর' },
    categories: ['Fitness Equipment', 'Sportswear', 'Outdoor Gear', 'Cycling', 'Cricket'],
  },
  {
    id: 'books',
    icon: '📚',
    label: { en: 'Books & Stationery', bn: 'বই ও স্টেশনারি' },
    categories: ['Books', 'Pens & Pencils', 'Office Supplies', 'Art Supplies', 'Bags & Pouches'],
  },
  {
    id: 'health',
    icon: '💊',
    label: { en: 'Health & Medicine', bn: 'স্বাস্থ্য ও ওষুধ' },
    categories: ['Vitamins & Supplements', 'First Aid', 'Personal Hygiene', 'Medical Devices', 'Baby Care'],
  },
  {
    id: 'auto',
    icon: '🚗',
    label: { en: 'Auto & Accessories', bn: 'অটো ও এক্সেসরিজ' },
    categories: ['Car Parts', 'Bike Accessories', 'Car Electronics', 'Car Care', 'Helmets'],
  },
  {
    id: 'general',
    icon: '🏪',
    label: { en: 'General Store', bn: 'জেনারেল স্টোর' },
    categories: ['Mixed Items', 'Seasonal Products', 'Gift Items', 'Toy', 'Pet Supplies'],
  },
];

/**
 * Returns all category names for the given preset IDs.
 */
export function getCategoriesFromPresets(presetIds: CategoryPresetId[]): string[] {
  return CATEGORY_PRESETS
    .filter(p => presetIds.includes(p.id))
    .flatMap(p => p.categories);
}

/**
 * Auto-detects business_type from selected category presets.
 */
export function detectBusinessType(presetIds: CategoryPresetId[]): BusinessType {
  if (presetIds.includes('grocery')) return 'small_shop';
  return 'online_store';
}

// ─── Legacy defaults (kept for backward compatibility) ──────────────────────

export const DEFAULT_CATEGORIES_BY_TYPE: Record<BusinessType, string[]> = {
  facebook_seller: ['Electronics', 'Accessories', 'Audio', 'Clothing', 'Beauty', 'Home & Kitchen'],
  small_shop: ['Grocery', 'Snacks & Beverages', 'Dairy & Eggs', 'Household', 'Personal Care', 'Stationery'],
  online_store: ['Electronics', 'Clothing', 'Beauty', 'Home & Kitchen', 'Sports', 'Books'],
  wholesaler: ['General Merchandise'],
};
