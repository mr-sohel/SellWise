import { db } from '../config/db';
import { userRepository } from '../repositories/user.repository';
import type { PoolClient } from 'pg';

const TARGET_EMAIL = 'sohel@gmail.com';

// ─── helpers ────────────────────────────────────────────────────────────────
const ri = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const wPick = <T>(items: T[], weights: number[]): T => {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
};
const daysAgo = (n: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(ri(9, 22), ri(0, 59), ri(0, 59), 0);
  return d;
};

// ─── enhanced product definitions ──────────────────────────────────────────
interface ProductDef {
  name: string;
  name_bn: string;
  sku: string;
  category: string;
  cost: number;
  price: number;
  stock: number;
  threshold: number;
  unit: string;
}

const ENHANCED_PRODUCTS: ProductDef[] = [
  // ── Mobile Phones (expanded) ─────────────────────────────────────────────
  { name: 'Samsung Galaxy S24 Ultra (256GB)', name_bn: 'স্যামসাং গ্যালাক্সি S24 আল্ট্রা', sku: 'MP-011', category: 'Mobile Phones', cost: 85000, price: 99999, stock: 8, threshold: 2, unit: 'pcs' },
  { name: 'iPhone 15 Pro Max (256GB)', name_bn: 'আইফোন 15 প্রো ম্যাক্স', sku: 'MP-012', category: 'Mobile Phones', cost: 120000, price: 144999, stock: 5, threshold: 2, unit: 'pcs' },
  { name: 'Google Pixel 8 (128GB)', name_bn: 'গুগল পিক্সেল 8', sku: 'MP-013', category: 'Mobile Phones', cost: 45000, price: 54999, stock: 10, threshold: 3, unit: 'pcs' },
  { name: 'OnePlus 12 (256GB)', name_bn: 'ওয়ানপ্লাস 12', sku: 'MP-014', category: 'Mobile Phones', cost: 55000, price: 67999, stock: 12, threshold: 3, unit: 'pcs' },
  { name: 'Xiaomi 14 (256GB)', name_bn: 'শাওমি 14', sku: 'MP-015', category: 'Mobile Phones', cost: 48000, price: 59999, stock: 15, threshold: 4, unit: 'pcs' },
  { name: 'Samsung Galaxy A55 5G (8/256GB)', name_bn: 'স্যামসাং গ্যালাক্সি A55', sku: 'MP-016', category: 'Mobile Phones', cost: 28000, price: 34999, stock: 20, threshold: 5, unit: 'pcs' },
  { name: 'Realme GT 5 Pro (12/256GB)', name_bn: 'রিয়েলমি GT 5 প্রো', sku: 'MP-017', category: 'Mobile Phones', cost: 32000, price: 39999, stock: 18, threshold: 4, unit: 'pcs' },
  { name: 'Nothing Phone 2 (12/256GB)', name_bn: 'নাথিং ফোন 2', sku: 'MP-018', category: 'Mobile Phones', cost: 35000, price: 44999, stock: 8, threshold: 2, unit: 'pcs' },

  // ── Phone Accessories (expanded) ────────────────────────────────────────
  { name: 'Anker 65W GaN Charger', name_bn: 'অ্যাঙ্কার 65W GaN চার্জার', sku: 'PA-011', category: 'Phone Accessories', cost: 2500, price: 3999, stock: 50, threshold: 10, unit: 'pcs' },
  { name: 'Baseus 65W Car Charger', name_bn: 'বাসিউস 65W কার চার্জার', sku: 'PA-012', category: 'Phone Accessories', cost: 1200, price: 1999, stock: 60, threshold: 12, unit: 'pcs' },
  { name: 'Samsung 45W Super Fast Charger', name_bn: 'স্যামসাং 45W সুপার ফাস্ট চার্জার', sku: 'PA-013', category: 'Phone Accessories', cost: 1500, price: 2499, stock: 40, threshold: 8, unit: 'pcs' },
  { name: 'Apple 20W USB-C Charger', name_bn: 'অ্যাপল 20W USB-C চার্জার', sku: 'PA-014', category: 'Phone Accessories', cost: 1800, price: 2999, stock: 45, threshold: 10, unit: 'pcs' },
  { name: 'Baseus 30000mAh Power Bank', name_bn: 'বাসিউস 30000mAh পাওয়ার ব্যাংক', sku: 'PA-015', category: 'Phone Accessories', cost: 2200, price: 3499, stock: 30, threshold: 6, unit: 'pcs' },
  { name: 'Spigen Case for iPhone 15 Pro', name_bn: 'স্পাইজেন কেস iPhone 15 প্রো', sku: 'PA-016', category: 'Phone Accessories', cost: 800, price: 1499, stock: 80, threshold: 15, unit: 'pcs' },
  { name: 'Tempered Glass for iPhone 15 Pro', name_bn: 'টেম্পার্ড গ্লাস iPhone 15 প্রো', sku: 'PA-017', category: 'Phone Accessories', cost: 100, price: 299, stock: 200, threshold: 40, unit: 'pcs' },
  { name: 'Anker USB-C to Lightning Cable', name_bn: 'অ্যাঙ্কার USB-C to Lightning কেবল', sku: 'PA-018', category: 'Phone Accessories', cost: 400, price: 799, stock: 150, threshold: 30, unit: 'pcs' },
  { name: 'Samsung 25W Wireless Charger Duo', name_bn: 'স্যামসাং 25W ওয়্যারলেস চার্জার', sku: 'PA-019', category: 'Phone Accessories', cost: 2000, price: 3499, stock: 25, threshold: 5, unit: 'pcs' },
  { name: 'Belkin 3-in-1 Wireless Charger', name_bn: 'বেলকিন 3-in-1 ওয়্যারলেস চার্জার', sku: 'PA-020', category: 'Phone Accessories', cost: 3500, price: 5499, stock: 15, threshold: 3, unit: 'pcs' },

  // ── Computers & Laptops (expanded) ──────────────────────────────────────
  { name: 'MacBook Air M3 (13-inch, 8GB/256GB)', name_bn: 'ম্যাকবুক এয়ার M3', sku: 'CL-014', category: 'Computers & Laptops', cost: 95000, price: 114999, stock: 6, threshold: 2, unit: 'pcs' },
  { name: 'MacBook Pro M3 (14-inch, 18GB/512GB)', name_bn: 'ম্যাকবুক প্রো M3', sku: 'CL-015', category: 'Computers & Laptops', cost: 165000, price: 199999, stock: 4, threshold: 1, unit: 'pcs' },
  { name: 'ASUS ROG Strix G16 i7 RTX 4060', name_bn: 'এএসইউএস ROG Strix G16', sku: 'CL-016', category: 'Computers & Laptops', cost: 120000, price: 149999, stock: 5, threshold: 2, unit: 'pcs' },
  { name: 'HP Pavilion 15 Ryzen 5 7530U', name_bn: 'এইচপি প্যাভিলিয়ন 15', sku: 'CL-017', category: 'Computers & Laptops', cost: 45000, price: 54999, stock: 8, threshold: 2, unit: 'pcs' },
  { name: 'Lenovo ThinkPad E16 i5 13th Gen', name_bn: 'লেনোভো ThinkPad E16', sku: 'CL-018', category: 'Computers & Laptops', cost: 58000, price: 69999, stock: 6, threshold: 2, unit: 'pcs' },
  { name: 'Dell XPS 15 i7 13th Gen', name_bn: 'ডেল XPS 15', sku: 'CL-019', category: 'Computers & Laptops', cost: 110000, price: 134999, stock: 3, threshold: 1, unit: 'pcs' },
  { name: 'Logitech MX Master 3S Mouse', name_bn: 'লজিটেক MX Master 3S', sku: 'CL-020', category: 'Computers & Laptops', cost: 6500, price: 9999, stock: 20, threshold: 5, unit: 'pcs' },
  { name: 'Corsair K70 RGB Mechanical Keyboard', name_bn: 'করসেয়ার K70 RGB', sku: 'CL-021', category: 'Computers & Laptops', cost: 8000, price: 12999, stock: 15, threshold: 3, unit: 'pcs' },
  { name: 'Samsung 980 Pro 1TB NVMe SSD', name_bn: 'স্যামসাং 980 Pro 1TB SSD', sku: 'CL-022', category: 'Computers & Laptops', cost: 8500, price: 12999, stock: 25, threshold: 5, unit: 'pcs' },
  { name: 'Corsair 32GB DDR5 RAM', name_bn: 'করসেয়ার 32GB DDR5 RAM', sku: 'CL-023', category: 'Computers & Laptops', cost: 8000, price: 11999, stock: 20, threshold: 4, unit: 'pcs' },
  { name: 'Logitech Brio 4K Webcam', name_bn: 'লজিটেক Brio 4K ওয়েবক্যাম', sku: 'CL-024', category: 'Computers & Laptops', cost: 8000, price: 12999, stock: 12, threshold: 3, unit: 'pcs' },
  { name: 'HyperX Cloud II Gaming Headset', name_bn: 'হাইপারএক্স Cloud II', sku: 'CL-025', category: 'Computers & Laptops', cost: 5500, price: 8999, stock: 18, threshold: 4, unit: 'pcs' },
  { name: 'TP-Link Deco XE75 WiFi 6E Mesh', name_bn: 'টিপি-লিংক Deco XE75', sku: 'CL-026', category: 'Computers & Laptops', cost: 12000, price: 18999, stock: 10, threshold: 2, unit: 'set' },
  { name: 'USB-C Docking Station 12-in-1', name_bn: 'USB-C ডকিং স্টেশন', sku: 'CL-027', category: 'Computers & Laptops', cost: 4000, price: 6499, stock: 20, threshold: 4, unit: 'pcs' },
  { name: 'Logitech Lift Vertical Ergonomic Mouse', name_bn: 'লজিটেক Lift ভার্টিক্যাল মাউস', sku: 'CL-028', category: 'Computers & Laptops', cost: 4500, price: 6999, stock: 15, threshold: 3, unit: 'pcs' },

  // ── Audio & Speakers (expanded) ─────────────────────────────────────────
  { name: 'Sony WH-1000XM5 Headphones', name_bn: 'সোনি WH-1000XM5', sku: 'AU-011', category: 'Audio & Speakers', cost: 18000, price: 27999, stock: 12, threshold: 3, unit: 'pcs' },
  { name: 'AirPods Pro 2 USB-C', name_bn: 'এয়ারপডস প্রো 2', sku: 'AU-012', category: 'Audio & Speakers', cost: 15000, price: 22999, stock: 15, threshold: 3, unit: 'pcs' },
  { name: 'JBL Charge 5 Speaker', name_bn: 'জেবিএল চার্জ 5', sku: 'AU-013', category: 'Audio & Speakers', cost: 8000, price: 12999, stock: 20, threshold: 4, unit: 'pcs' },
  { name: 'Sony WF-1000XM5 Earbuds', name_bn: 'সোনি WF-1000XM5', sku: 'AU-014', category: 'Audio & Speakers', cost: 16000, price: 24999, stock: 10, threshold: 2, unit: 'pcs' },
  { name: 'Bose QuietComfort Ultra Headphones', name_bn: 'বোস QC আল্ট্রা', sku: 'AU-015', category: 'Audio & Speakers', cost: 25000, price: 39999, stock: 8, threshold: 2, unit: 'pcs' },
  { name: 'JBL Flip 6 Speaker', name_bn: 'জেবিএল Flip 6', sku: 'AU-016', category: 'Audio & Speakers', cost: 6000, price: 9999, stock: 25, threshold: 5, unit: 'pcs' },
  { name: 'Samsung Galaxy Buds2 Pro', name_bn: 'স্যামসাং গ্যালাক্সি বাডস2 প্রো', sku: 'AU-017', category: 'Audio & Speakers', cost: 8000, price: 12999, stock: 18, threshold: 4, unit: 'pcs' },
  { name: 'Razer BlackShark V2 Gaming Headset', name_bn: 'রেজার BlackShark V2', sku: 'AU-018', category: 'Audio & Speakers', cost: 7000, price: 10999, stock: 12, threshold: 3, unit: 'pcs' },
  { name: 'Marshall Stanmore III Speaker', name_bn: 'মার্শাল Stanmore III', sku: 'AU-019', category: 'Audio & Speakers', cost: 22000, price: 34999, stock: 5, threshold: 1, unit: 'pcs' },
  { name: 'Shure SM58 Microphone', name_bn: 'শুর SM58 মাইক', sku: 'AU-020', category: 'Audio & Speakers', cost: 8000, price: 12999, stock: 8, threshold: 2, unit: 'pcs' },

  // ── Cameras & Photography (expanded) ────────────────────────────────────
  { name: 'Canon EOS R50 Mirrorless Body', name_bn: 'ক্যানন EOS R50', sku: 'CM-009', category: 'Cameras', cost: 55000, price: 69999, stock: 5, threshold: 1, unit: 'pcs' },
  { name: 'Sony A6400 Mirrorless Body', name_bn: 'সোনি A6400', sku: 'CM-010', category: 'Cameras', cost: 65000, price: 79999, stock: 4, threshold: 1, unit: 'pcs' },
  { name: 'Fujifilm X-T30 II Body', name_bn: 'ফুজিফিল্ম X-T30 II', sku: 'CM-011', category: 'Cameras', cost: 58000, price: 72999, stock: 3, threshold: 1, unit: 'pcs' },
  { name: 'GoPro Hero 12 Black Bundle', name_bn: 'গোপ্রো হিরো 12 বান্ডল', sku: 'CM-012', category: 'Cameras', cost: 38000, price: 49999, stock: 6, threshold: 2, unit: 'pcs' },
  { name: 'DJI Air 3 Drone', name_bn: 'ডিজেআই এয়ার 3', sku: 'CM-013', category: 'Cameras', cost: 85000, price: 109999, stock: 3, threshold: 1, unit: 'pcs' },
  { name: 'Sony 50mm f/1.8 FE Lens', name_bn: 'সোনি 50mm f/1.8 FE', sku: 'CM-014', category: 'Cameras', cost: 25000, price: 34999, stock: 6, threshold: 2, unit: 'pcs' },
  { name: 'Canon EF-S 18-55mm Kit Lens', name_bn: 'ক্যানন EF-S 18-55mm', sku: 'CM-015', category: 'Cameras', cost: 12000, price: 17999, stock: 10, threshold: 3, unit: 'pcs' },
  { name: 'SanDisk Extreme Pro 256GB SD Card', name_bn: 'স্যানডিস্ক এক্সট্রিম প্রো 256GB', sku: 'CM-016', category: 'Cameras', cost: 3500, price: 5499, stock: 50, threshold: 10, unit: 'pcs' },
  { name: 'Peak Design Travel Tripod', name_bn: 'পিক ডিজাইন ট্রাভেল ট্রাইপড', sku: 'CM-017', category: 'Cameras', cost: 15000, price: 22999, stock: 8, threshold: 2, unit: 'pcs' },
  { name: 'Camera Lens Cleaning Kit', name_bn: 'ক্যামেরা লেন্স ক্লিনিং কিট', sku: 'CM-018', category: 'Cameras', cost: 300, price: 699, stock: 100, threshold: 20, unit: 'set' },

  // ── Gaming Accessories ──────────────────────────────────────────────────
  { name: 'PS5 DualSense Controller', name_bn: 'PS5 DualSense কন্ট্রোলার', sku: 'GM-001', category: 'Gaming Accessories', cost: 5500, price: 7999, stock: 25, threshold: 5, unit: 'pcs' },
  { name: 'Xbox Wireless Controller', name_bn: 'এক্সবক্স ওয়্যারলেস কন্ট্রোলার', sku: 'GM-002', category: 'Gaming Accessories', cost: 5000, price: 7499, stock: 20, threshold: 4, unit: 'pcs' },
  { name: 'Nintendo Switch OLED', name_bn: 'নিন্টেন্ডো সুইচ OLED', sku: 'GM-003', category: 'Gaming Accessories', cost: 32000, price: 39999, stock: 8, threshold: 2, unit: 'pcs' },
  { name: 'Razer DeathAdder V3 Gaming Mouse', name_bn: 'রেজার DeathAdder V3', sku: 'GM-004', category: 'Gaming Accessories', cost: 6000, price: 9999, stock: 15, threshold: 3, unit: 'pcs' },
  { name: 'SteelSeries Arctis Nova 7 Headset', name_bn: 'স্টিলসিরিজ Arctis Nova 7', sku: 'GM-005', category: 'Gaming Accessories', cost: 10000, price: 15999, stock: 10, threshold: 2, unit: 'pcs' },
  { name: 'Logitech G Pro X Superlight Mouse', name_bn: 'লজিটেক G Pro X Superlight', sku: 'GM-006', category: 'Gaming Accessories', cost: 8000, price: 12999, stock: 12, threshold: 3, unit: 'pcs' },
  { name: 'Razer Huntsman V3 Pro Keyboard', name_bn: 'রেজার Huntsman V3 Pro', sku: 'GM-007', category: 'Gaming Accessories', cost: 15000, price: 22999, stock: 8, threshold: 2, unit: 'pcs' },
  { name: 'Elgato Stream Deck MK.2', name_bn: 'এলগাটো Stream Deck MK.2', sku: 'GM-008', category: 'Gaming Accessories', cost: 10000, price: 15999, stock: 6, threshold: 2, unit: 'pcs' },
  { name: 'Corsair HS80 RGB Gaming Headset', name_bn: 'করসেয়ার HS80 RGB', sku: 'GM-009', category: 'Gaming Accessories', cost: 5000, price: 7999, stock: 14, threshold: 3, unit: 'pcs' },
  { name: 'Xbox Game Pass Ultimate 12 Month', name_bn: 'এক্সবক্স Game Pass আল্টিমেট', sku: 'GM-010', category: 'Gaming Accessories', cost: 6000, price: 8999, stock: 30, threshold: 6, unit: 'pcs' },

  // ── Home Electronics ────────────────────────────────────────────────────
  { name: 'Xiaomi Robot Vacuum X10+', name_bn: 'শাওমি রোবট ভ্যাকুয়াম X10+', sku: 'HE-001', category: 'Home Electronics', cost: 35000, price: 49999, stock: 6, threshold: 2, unit: 'pcs' },
  { name: 'Philips Air Purifier AC1215', name_bn: 'ফিলিপ্স এয়ার পিউরিফায়ার', sku: 'HE-002', category: 'Home Electronics', cost: 18000, price: 26999, stock: 8, threshold: 2, unit: 'pcs' },
  { name: 'Dyson V15 Detect Vacuum', name_bn: 'ডাইসন V15 ডিটেক্ট', sku: 'HE-003', category: 'Home Electronics', cost: 45000, price: 59999, stock: 4, threshold: 1, unit: 'pcs' },
  { name: 'Xiaomi Smart Air Purifier 4', name_bn: 'শাওমি স্মার্ট এয়ার পিউরিফায়ার 4', sku: 'HE-004', category: 'Home Electronics', cost: 12000, price: 17999, stock: 10, threshold: 3, unit: 'pcs' },
  { name: 'Amazon Echo Dot 5th Gen', name_bn: 'অ্যামাজন Echo Dot 5', sku: 'HE-005', category: 'Home Electronics', cost: 4000, price: 6499, stock: 20, threshold: 4, unit: 'pcs' },
  { name: 'Google Nest Hub Max', name_bn: 'গুগল Nest Hub Max', sku: 'HE-006', category: 'Home Electronics', cost: 15000, price: 22999, stock: 5, threshold: 1, unit: 'pcs' },
  { name: 'TP-Link Kasa Smart Plug 4-Pack', name_bn: 'টিপি-লিংক Kasa স্মার্ট প্লাগ', sku: 'HE-007', category: 'Home Electronics', cost: 2000, price: 3499, stock: 30, threshold: 6, unit: 'set' },
  { name: 'Xiaomi Mi LED Smart Bulb', name_bn: 'শাওমি Mi LED স্মার্ট বাল্ব', sku: 'HE-008', category: 'Home Electronics', cost: 500, price: 999, stock: 100, threshold: 20, unit: 'pcs' },

  // ── Tablets & E-readers ─────────────────────────────────────────────────
  { name: 'iPad 10th Gen (64GB)', name_bn: 'আইপ্যাড 10ম জেন', sku: 'TB-001', category: 'Tablets & E-readers', cost: 35000, price: 44999, stock: 10, threshold: 3, unit: 'pcs' },
  { name: 'iPad Air M2 (128GB)', name_bn: 'আইপ্যাড এয়ার M2', sku: 'TB-002', category: 'Tablets & E-readers', cost: 55000, price: 69999, stock: 6, threshold: 2, unit: 'pcs' },
  { name: 'Samsung Galaxy Tab S9 FE', name_bn: 'স্যামসাং গ্যালাক্সি Tab S9 FE', sku: 'TB-003', category: 'Tablets & E-readers', cost: 32000, price: 41999, stock: 8, threshold: 2, unit: 'pcs' },
  { name: 'Xiaomi Pad 6', name_bn: 'শাওমি প্যাড 6', sku: 'TB-004', category: 'Tablets & E-readers', cost: 28000, price: 36999, stock: 10, threshold: 3, unit: 'pcs' },
  { name: 'Kindle Paperwhite 5 (16GB)', name_bn: 'কিন্ডল পেপারওয়াইট 5', sku: 'TB-005', category: 'Tablets & E-readers', cost: 12000, price: 17999, stock: 12, threshold: 3, unit: 'pcs' },
  { name: 'Apple Pencil 2nd Gen', name_bn: 'অ্যাপল পেন্সিল 2', sku: 'TB-006', category: 'Tablets & E-readers', cost: 8000, price: 12999, stock: 15, threshold: 3, unit: 'pcs' },
  { name: 'Samsung S Pen for Tab S9', name_bn: 'স্যামসাং S Pen', sku: 'TB-007', category: 'Tablets & E-readers', cost: 3000, price: 4999, stock: 20, threshold: 4, unit: 'pcs' },
  { name: 'Logitech Crayon for iPad', name_bn: 'লজিটেক ক্রেয়ন', sku: 'TB-008', category: 'Tablets & E-readers', cost: 4000, price: 6499, stock: 10, threshold: 2, unit: 'pcs' },

  // ── Wearables & Smartwatches ────────────────────────────────────────────
  { name: 'Apple Watch Ultra 2', name_bn: 'অ্যাপল ওয়াচ আল্ট্রা 2', sku: 'SW-003', category: 'Wearables & Smartwatches', cost: 65000, price: 84999, stock: 6, threshold: 2, unit: 'pcs' },
  { name: 'Samsung Galaxy Watch 6 Classic', name_bn: 'স্যামসাং গ্যালাক্সি ওয়াচ 6 ক্লাসিক', sku: 'SW-004', category: 'Wearables & Smartwatches', cost: 25000, price: 34999, stock: 10, threshold: 3, unit: 'pcs' },
  { name: 'Fitbit Charge 6', name_bn: 'ফিটবিট চার্জ 6', sku: 'SW-005', category: 'Wearables & Smartwatches', cost: 12000, price: 17999, stock: 15, threshold: 4, unit: 'pcs' },
  { name: 'Garmin Venu 3', name_bn: 'গার্মিন Venu 3', sku: 'SW-006', category: 'Wearables & Smartwatches', cost: 30000, price: 42999, stock: 5, threshold: 1, unit: 'pcs' },
  { name: 'Xiaomi Smart Band 8 Pro', name_bn: 'শাওমি স্মার্ট ব্যান্ড 8 প্রো', sku: 'SW-007', category: 'Wearables & Smartwatches', cost: 3000, price: 4999, stock: 50, threshold: 10, unit: 'pcs' },
  { name: 'Apple Watch SE (2nd Gen)', name_bn: 'অ্যাপল ওয়াচ SE', sku: 'SW-008', category: 'Wearables & Smartwatches', cost: 22000, price: 29999, stock: 12, threshold: 3, unit: 'pcs' },
  { name: 'Samsung Galaxy Fit 3', name_bn: 'স্যামসাং গ্যালাক্সি Fit 3', sku: 'SW-009', category: 'Wearables & Smartwatches', cost: 5000, price: 7999, stock: 25, threshold: 5, unit: 'pcs' },
  { name: 'Amazfit Bip 5 Smartwatch', name_bn: 'অ্যামেজফিট Bip 5', sku: 'SW-010', category: 'Wearables & Smartwatches', cost: 4000, price: 6499, stock: 30, threshold: 6, unit: 'pcs' },

  // ── Power & Charging ────────────────────────────────────────────────────
  { name: 'APC UPS 1500VA', name_bn: 'এপিসি UPS 1500VA', sku: 'PW-001', category: 'Power & Charging', cost: 12000, price: 17999, stock: 8, threshold: 2, unit: 'pcs' },
  { name: 'CyberPower UPS 1000VA', name_bn: 'সাইবারপাওয়ার UPS', sku: 'PW-002', category: 'Power & Charging', cost: 8000, price: 12999, stock: 10, threshold: 3, unit: 'pcs' },
  { name: 'Anker PowerHouse 521 Portable Power Station', name_bn: 'অ্যাঙ্কার PowerHouse 521', sku: 'PW-003', category: 'Power & Charging', cost: 35000, price: 49999, stock: 4, threshold: 1, unit: 'pcs' },
  { name: 'Baseus 65W USB-C Hub 7-in-1', name_bn: 'বাসিউস 65W USB-C Hub', sku: 'PW-004', category: 'Power & Charging', cost: 2000, price: 3499, stock: 25, threshold: 5, unit: 'pcs' },
  { name: 'EcoFlow River 2 Portable Power Station', name_bn: 'ইকোফ্লো River 2', sku: 'PW-005', category: 'Power & Charging', cost: 25000, price: 36999, stock: 3, threshold: 1, unit: 'pcs' },
  { name: 'Belkin 12-Outlet Surge Protector', name_bn: 'বেলকিন সার্জ প্রোটেক্টর', sku: 'PW-006', category: 'Power & Charging', cost: 1500, price: 2499, stock: 30, threshold: 6, unit: 'pcs' },
];

// ─── enhanced customer definitions ─────────────────────────────────────────
const ENHANCED_CUSTOMERS = [
  // Corporate/Business customers
  { name: 'Tech Solutions BD Ltd', phone: '+8801712345001', email: 'info@techsolutionsbd.com', address: 'Gulshan-2, Dhaka', type: 'business' },
  { name: 'Digital World Corporation', phone: '+8801812345002', email: 'sales@digitalworld.com', address: 'Banani, Dhaka', type: 'business' },
  { name: 'Smart Electronics Ltd', phone: '+8801912345003', email: 'contact@smartelectronics.com', address: 'Motijheel, Dhaka', type: 'business' },
  { name: 'Future Tech Traders', phone: '+8801612345004', email: 'orders@futuretechtraders.com', address: 'Dhanmondi, Dhaka', type: 'business' },
  { name: 'Cyber Mart Bangladesh', phone: '+8801712345005', email: 'info@cybermart.com', address: 'Uttara, Dhaka', type: 'business' },
  { name: 'Gadget Galaxy Ltd', phone: '+8801812345006', email: 'sales@gadgetgalaxy.com', address: 'Mirpur-10, Dhaka', type: 'business' },
  { name: 'Digital Dreams Corporation', phone: '+8801912345007', email: 'info@digitaldreams.com', address: 'Bashundhara, Dhaka', type: 'business' },
  { name: 'Electro World Bangladesh', phone: '+8801612345008', email: 'orders@electroworld.com', address: 'Tejgaon, Dhaka', type: 'business' },
  
  // Regular customers
  { name: 'Rafiq Uddin', phone: '+8801712345101', email: 'rafiq.u@gmail.com', address: 'Uttara Sector 7, Dhaka', type: 'regular' },
  { name: 'Sumaiya Rahman', phone: '+8801812345102', email: 'sumaiya.r@gmail.com', address: 'Dhanmondi 27, Dhaka', type: 'regular' },
  { name: 'Tanvir Hossain', phone: '+8801912345103', email: 'tanvir.h@gmail.com', address: 'Banani 11, Dhaka', type: 'regular' },
  { name: 'Nusrat Jahan', phone: '+8801612345104', email: 'nusrat.j@gmail.com', address: 'Gulshan 1, Dhaka', type: 'regular' },
  { name: 'Kamal Hasan', phone: '+8801712345105', email: 'kamal.h@gmail.com', address: 'Mirpur 6, Dhaka', type: 'regular' },
  { name: 'Farhana Akter', phone: '+8801812345106', email: 'farhana.a@gmail.com', address: 'Badda, Dhaka', type: 'regular' },
  { name: 'Sohel Rana', phone: '+8801912345107', email: 'sohel.r@gmail.com', address: 'Uttara Sector 12, Dhaka', type: 'regular' },
  { name: 'Tania Islam', phone: '+8801612345108', email: 'tania.i@gmail.com', address: 'Shyamoli, Dhaka', type: 'regular' },
  { name: 'Rakibul Hasan', phone: '+8801712345109', email: 'rakibul.h@gmail.com', address: 'Mohammadpur, Dhaka', type: 'regular' },
  { name: 'Sabrina Akter', phone: '+8801812345110', email: 'sabrina.a@gmail.com', address: 'Eskaton, Dhaka', type: 'regular' },
  { name: 'Moniruzzaman', phone: '+8801912345111', email: 'moniruzzaman@gmail.com', address: 'Pallabi, Dhaka', type: 'regular' },
  { name: 'Jesmin Ara', phone: '+8801612345112', email: 'jesmin.a@gmail.com', address: 'Khilkhet, Dhaka', type: 'regular' },
  
  // Wholesale customers
  { name: 'Mega Electronics Wholesale', phone: '+8801712345201', email: 'bulk@megaelectronics.com', address: 'Chittagong Sadar', type: 'wholesale' },
  { name: 'Dhaka Digital Wholesale', phone: '+8801812345202', email: 'orders@dhakadigital.com', address: 'New Market, Dhaka', type: 'wholesale' },
  { name: 'Sylhet Tech Distributors', phone: '+8801912345203', email: 'info@sylhettech.com', address: 'Sylhet Sadar', type: 'wholesale' },
  { name: 'Rajshahi Electronics Hub', phone: '+8801612345204', email: 'sales@rajshahielectronics.com', address: 'Rajshahi Sadar', type: 'wholesale' },
  { name: 'Khulna Digital Center', phone: '+8801712345205', email: 'contact@khulnadigital.com', address: 'Khulna Sadar', type: 'wholesale' },
  { name: 'Comilla Tech World', phone: '+8801812345206', email: 'info@comillatech.com', address: 'Comilla Sadar', type: 'wholesale' },
  { name: 'Barisal Electronics Mart', phone: '+8801912345207', email: 'orders@barisalelectronics.com', address: 'Barisal Sadar', type: 'wholesale' },
  { name: 'Rangpur Digital Zone', phone: '+8801612345208', email: 'sales@rangpurdigital.com', address: 'Rangpur Sadar', type: 'wholesale' },
  
  // Online/social media customers
  { name: 'Online Customer 1', phone: '+8801712345301', email: null, address: 'Dhaka', type: 'online' },
  { name: 'Online Customer 2', phone: '+8801812345302', email: null, address: 'Chittagong', type: 'online' },
  { name: 'Online Customer 3', phone: '+8801912345303', email: null, address: 'Sylhet', type: 'online' },
  { name: 'Online Customer 4', phone: '+8801612345304', email: null, address: 'Rajshahi', type: 'online' },
  { name: 'Online Customer 5', phone: '+8801712345305', email: null, address: 'Khulna', type: 'online' },
  { name: 'Online Customer 6', phone: '+8801812345306', email: null, address: 'Gazipur', type: 'online' },
  { name: 'Online Customer 7', phone: '+8801912345307', email: null, address: 'Narayanganj', type: 'online' },
  { name: 'Online Customer 8', phone: '+8801612345308', email: null, address: 'Mymensingh', type: 'online' },
  
  // Family/group customers
  { name: 'Rahman Family', phone: '+8801712345401', email: 'rahman.family@gmail.com', address: 'Banani, Dhaka', type: 'family' },
  { name: 'Hossain Family', phone: '+8801812345402', email: 'hossain.family@gmail.com', address: 'Dhanmondi, Dhaka', type: 'family' },
  { name: 'Ahmed Family', phone: '+8801912345403', email: 'ahmed.family@gmail.com', address: 'Gulshan, Dhaka', type: 'family' },
  { name: 'Khan Family', phone: '+8801612345404', email: 'khan.family@gmail.com', address: 'Uttara, Dhaka', type: 'family' },
  { name: 'Ali Family', phone: '+8801712345405', email: 'ali.family@gmail.com', address: 'Mirpur, Dhaka', type: 'family' },
  { name: 'Islam Family', phone: '+8801812345406', email: 'islam.family@gmail.com', address: 'Bashundhara, Dhaka', type: 'family' },
  { name: 'Uddin Family', phone: '+8801912345407', email: 'uddin.family@gmail.com', address: 'Mohammadpur, Dhaka', type: 'family' },
  { name: 'Chowdhury Family', phone: '+8801612345408', email: 'chowdhury.family@gmail.com', address: 'Baridhara, Dhaka', type: 'family' },
];

const SOURCES = ['Facebook', 'Facebook', 'Facebook', 'WhatsApp', 'Online', 'Online', 'In-Store', 'TikTok'];
const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'delivered', 'delivered', 'delivered', 'cancelled', 'returned'];
const EXPENSE_CATEGORIES = ['Rent', 'Utilities', 'Marketing', 'Salary', 'Packaging', 'Shipping', 'Supplies', 'Other'];

function seasonalWeight(dAgo: number): number {
  if (dAgo >= 60 && dAgo <= 80) return 4.5;
  if (dAgo >= 180 && dAgo <= 210) return 3.0;
  if (dAgo % 30 >= 0 && dAgo % 30 <= 5) return 2.0;
  if (dAgo % 7 === 0 || dAgo % 7 === 1) return 1.5;
  return 0.8;
}

async function seedEnhanced() {
  console.log('Starting enhanced seed for additional data...');
  let client: PoolClient | null = null;

  try {
    const user = await userRepository.findByEmail(TARGET_EMAIL);
    if (!user) throw new Error(`User ${TARGET_EMAIL} not found. Please sign up and complete onboarding first.`);

    const storeResult = await db.query(
      `SELECT s.id FROM stores s JOIN store_members sm ON s.id = sm.store_id WHERE sm.user_id = $1`,
      [user.id]
    );
    if (storeResult.rows.length === 0) throw new Error('No store found for user.');
    const storeId = storeResult.rows[0].id;

    client = await db.connect();

    // Insert additional products
    const catResult = await client.query(`SELECT id, name FROM categories WHERE store_id = $1`, [storeId]);
    const catMap: Record<string, string> = {};
    for (const row of catResult.rows) catMap[row.name] = row.id;

    console.log(`Inserting ${ENHANCED_PRODUCTS.length} additional products...`);
    const dbProducts: any[] = [];
    for (const p of ENHANCED_PRODUCTS) {
      const categoryId = catMap[p.category];
      const { rows } = await client.query(
        `INSERT INTO products (store_id, name, name_bn, sku, category, cost_price, selling_price, stock_quantity, low_stock_threshold, unit, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [storeId, p.name, p.name_bn, p.sku, p.category, p.cost, p.price, p.stock, p.threshold, p.unit, true]
      );
      dbProducts.push(rows[0]);
    }
    console.log('Additional products inserted.');

    // Insert additional customers
    console.log(`Inserting ${ENHANCED_CUSTOMERS.length} additional customers...`);
    const dbCustomers: any[] = [];
    for (const c of ENHANCED_CUSTOMERS) {
      const { rows } = await client.query(
        `INSERT INTO customers (store_id, name, phone, email, address)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [storeId, c.name, c.phone, c.email, c.address]
      );
      dbCustomers.push(rows[0]);
    }
    console.log('Additional customers inserted.');

    // Generate additional orders (500 more)
    console.log('Generating 500 additional orders...');
    let orderCount = 0;
    const totalDays = 365;
    const dayWeights: number[] = Array.from({ length: totalDays }, (_, i) => seasonalWeight(i));

    // Get existing products from database
    const existingProductsResult = await client.query(`SELECT * FROM products WHERE store_id = $1 AND is_active = true`, [storeId]);
    const allProducts = existingProductsResult.rows;

    // Get existing customers from database
    const existingCustomersResult = await client.query(`SELECT * FROM customers WHERE store_id = $1`, [storeId]);
    const allCustomers = existingCustomersResult.rows;

    // Create orders for different customer segments
    const businessCustomers = allCustomers.filter(c => c.name.includes('Ltd') || c.name.includes('Corporation') || c.name.includes('Wholesale') || c.name.includes('Distributors') || c.name.includes('Electronics Hub') || c.name.includes('Digital Center') || c.name.includes('Tech World'));
    const regularCustomers = allCustomers.filter(c => !c.name.includes('Ltd') && !c.name.includes('Corporation') && !c.name.includes('Wholesale') && !c.name.includes('Distributors') && !c.name.includes('Electronics Hub') && !c.name.includes('Digital Center') && !c.name.includes('Tech World') && !c.name.includes('Online Customer'));
    const onlineCustomers = allCustomers.filter(c => c.name.includes('Online Customer'));
    const familyCustomers = allCustomers.filter(c => c.name.includes('Family'));

    // Generate 100 business orders (larger quantities)
    for (let i = 0; i < 100; i++) {
      const customer = pick(businessCustomers);
      const day = wPick(Array.from({ length: totalDays }, (_, i) => i), dayWeights);
      const orderDate = daysAgo(day);
      
      const numItems = ri(2, 5);
      const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, numItems);

      let subtotal = 0;
      const items: any[] = [];
      for (const p of selected) {
        const qty = ri(5, 15); // Business customers buy in bulk
        subtotal += p.selling_price * qty;
        items.push({ p, qty });
      }

      const deliveryCharge = ri(0, 100); // Free or low delivery for business
      const discount = ri(0, 1) === 0 ? ri(0, Math.floor(subtotal * 0.15)) : 0; // Up to 15% discount
      const total = subtotal + deliveryCharge - discount;

      const status = day < 7
        ? wPick(STATUSES, [10, 15, 20, 15, 10, 0, 0, 0, 10, 0])
        : wPick(STATUSES, [2, 3, 4, 5, 65, 0, 0, 0, 8, 3]);

      const { rows: orderRows } = await client.query(
        `INSERT INTO orders (store_id, customer_id, order_number, status, source, total, delivery_charge, discount, notes, order_date, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11) RETURNING id`,
        [
          storeId, customer.id,
          `SW-E${orderCount + 10000}`,
          status,
          pick(['In-Store', 'WhatsApp', 'Online']),
          total, deliveryCharge, discount,
          `Business order - ${customer.name}`,
          orderDate, orderDate,
        ]
      );

      const orderId = orderRows[0].id;
      for (const { p, qty } of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, unit_price, cost_price, quantity, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [orderId, p.id, p.name, p.selling_price, p.cost_price, qty, orderDate]
        );
      }
      orderCount++;
    }

    // Generate 200 online/social media orders
    for (let i = 0; i < 200; i++) {
      const customer = pick([...onlineCustomers, ...regularCustomers]);
      const day = wPick(Array.from({ length: totalDays }, (_, i) => i), dayWeights);
      const orderDate = daysAgo(day);
      
      const numItems = ri(1, 2);
      const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, numItems);

      let subtotal = 0;
      const items: any[] = [];
      for (const p of selected) {
        const qty = ri(1, 2);
        subtotal += p.selling_price * qty;
        items.push({ p, qty });
      }

      const deliveryCharge = ri(60, 150);
      const discount = ri(0, 1) === 0 ? ri(0, Math.floor(subtotal * 0.10)) : 0;
      const total = subtotal + deliveryCharge - discount;

      const status = day < 7
        ? wPick(STATUSES, [15, 20, 15, 10, 5, 0, 0, 0, 5, 0])
        : wPick(STATUSES, [2, 3, 4, 5, 60, 0, 0, 0, 8, 3]);

      const { rows: orderRows } = await client.query(
        `INSERT INTO orders (store_id, customer_id, order_number, status, source, total, delivery_charge, discount, notes, order_date, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11) RETURNING id`,
        [
          storeId, customer.id,
          `SW-E${orderCount + 10000}`,
          status,
          pick(['Facebook', 'TikTok', 'Online']),
          total, deliveryCharge, discount,
          'Online order',
          orderDate, orderDate,
        ]
      );

      const orderId = orderRows[0].id;
      for (const { p, qty } of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, unit_price, cost_price, quantity, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [orderId, p.id, p.name, p.selling_price, p.cost_price, qty, orderDate]
        );
      }
      orderCount++;
    }

    // Generate 200 family/group orders
    for (let i = 0; i < 200; i++) {
      const customer = pick([...familyCustomers, ...regularCustomers]);
      const day = wPick(Array.from({ length: totalDays }, (_, i) => i), dayWeights);
      const orderDate = daysAgo(day);
      
      const numItems = ri(2, 4);
      const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, numItems);

      let subtotal = 0;
      const items: any[] = [];
      for (const p of selected) {
        const qty = ri(1, 3);
        subtotal += p.selling_price * qty;
        items.push({ p, qty });
      }

      const deliveryCharge = ri(60, 150);
      const discount = ri(0, 1) === 0 ? ri(0, Math.floor(subtotal * 0.12)) : 0;
      const total = subtotal + deliveryCharge - discount;

      const status = day < 7
        ? wPick(STATUSES, [12, 18, 15, 12, 8, 0, 0, 0, 8, 0])
        : wPick(STATUSES, [2, 3, 4, 5, 62, 0, 0, 0, 8, 3]);

      const { rows: orderRows } = await client.query(
        `INSERT INTO orders (store_id, customer_id, order_number, status, source, total, delivery_charge, discount, notes, order_date, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11) RETURNING id`,
        [
          storeId, customer.id,
          `SW-E${orderCount + 10000}`,
          status,
          pick(['Facebook', 'In-Store', 'WhatsApp']),
          total, deliveryCharge, discount,
          'Family/group order',
          orderDate, orderDate,
        ]
      );

      const orderId = orderRows[0].id;
      for (const { p, qty } of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, unit_price, cost_price, quantity, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [orderId, p.id, p.name, p.selling_price, p.cost_price, qty, orderDate]
        );
      }
      orderCount++;
    }

    console.log(`Inserted ${orderCount} additional orders.`);

    // Update customer aggregates
    await client.query(`
      UPDATE customers c
      SET total_orders = (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.status NOT IN ('cancelled','returned')),
          total_spent  = (SELECT COALESCE(SUM(total),0) FROM orders o WHERE o.customer_id = c.id AND o.status NOT IN ('cancelled','returned'))
      WHERE c.store_id = $1
    `, [storeId]);
    console.log('Customer aggregates updated.');

    // Additional expenses
    console.log('Generating additional expenses...');
    for (let i = 0; i < 30; i++) {
      const expenseType = pick([
        { category: 'Marketing', note: 'Social media campaign - Facebook/Instagram', min: 8000, max: 25000 },
        { category: 'Marketing', note: 'Influencer collaboration payment', min: 10000, max: 30000 },
        { category: 'Packaging', note: 'Premium packaging materials', min: 5000, max: 12000 },
        { category: 'Shipping', note: 'Express courier service (Pathao/Redex)', min: 6000, max: 15000 },
        { category: 'Supplies', note: 'Office and warehouse supplies', min: 2000, max: 5000 },
        { category: 'Other', note: 'Business development and networking', min: 3000, max: 8000 },
      ]);
      
      await client.query(
        `INSERT INTO expenses (store_id, category, amount, expense_date, notes) VALUES ($1,$2,$3,$4,$5)`,
        [storeId, expenseType.category, ri(expenseType.min, expenseType.max), daysAgo(ri(0, 365)), expenseType.note]
      );
    }
    console.log('Additional expenses inserted.');

    console.log('\n✅  Enhanced seed complete!');
    console.log(`   Additional Products  : ${ENHANCED_PRODUCTS.length}`);
    console.log(`   Additional Customers : ${ENHANCED_CUSTOMERS.length}`);
    console.log(`   Additional Orders    : ${orderCount}`);
    console.log(`   Store               : ${storeId}`);
  } catch (err) {
    console.error('Enhanced seed failed:', err);
    process.exit(1);
  } finally {
    client?.release();
    await db.end();
  }
}

seedEnhanced();
