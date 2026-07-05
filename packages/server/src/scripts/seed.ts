import { db } from '../config/db';
import { userRepository } from '../repositories/user.repository';
import { categoryRepository } from '../repositories/category.repository';
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

// ─── realistic Bangladeshi electronics products ──────────────────────────────
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

const PRODUCTS: ProductDef[] = [
  // ── Mobile Phones ──────────────────────────────────────────────────────
  { name: 'Samsung Galaxy A15 (6/128GB)', name_bn: 'স্যামসাং গ্যালাক্সি A15', sku: 'MP-001', category: 'Mobile Phones', cost: 13500, price: 16999, stock: 25, threshold: 5, unit: 'pcs' },
  { name: 'Samsung Galaxy A25 5G (8/128GB)', name_bn: 'স্যামসাং গ্যালাক্সি A25', sku: 'MP-002', category: 'Mobile Phones', cost: 22000, price: 27999, stock: 18, threshold: 4, unit: 'pcs' },
  { name: 'Xiaomi Redmi 13C (6/128GB)', name_bn: 'শাওমি রেডমি 13C', sku: 'MP-003', category: 'Mobile Phones', cost: 9500, price: 12499, stock: 30, threshold: 6, unit: 'pcs' },
  { name: 'Xiaomi Redmi Note 13 (8/128GB)', name_bn: 'শাওমি রেডমি নোট 13', sku: 'MP-004', category: 'Mobile Phones', cost: 17500, price: 21999, stock: 20, threshold: 5, unit: 'pcs' },
  { name: 'Realme Narzo 70x 5G (6/128GB)', name_bn: 'রিয়েলমি নারজো 70x', sku: 'MP-005', category: 'Mobile Phones', cost: 14000, price: 17999, stock: 22, threshold: 5, unit: 'pcs' },
  { name: 'Vivo Y27 (6/128GB)', name_bn: 'ভিভো Y27', sku: 'MP-006', category: 'Mobile Phones', cost: 13000, price: 16499, stock: 15, threshold: 4, unit: 'pcs' },
  { name: 'OPPO A18 (4/128GB)', name_bn: 'ওপো A18', sku: 'MP-007', category: 'Mobile Phones', cost: 10000, price: 13499, stock: 28, threshold: 6, unit: 'pcs' },
  { name: 'Tecno Spark 20 Pro (8/256GB)', name_bn: 'টেকনো স্পার্ক 20 প্রো', sku: 'MP-008', category: 'Mobile Phones', cost: 15000, price: 19999, stock: 12, threshold: 3, unit: 'pcs' },
  { name: 'iPhone 15 (128GB)', name_bn: 'আইফোন 15', sku: 'MP-009', category: 'Mobile Phones', cost: 95000, price: 114999, stock: 5, threshold: 2, unit: 'pcs' },
  { name: 'Samsung Galaxy A05s (4/128GB)', name_bn: 'স্যামসাং গ্যালাক্সি A05s', sku: 'MP-010', category: 'Mobile Phones', cost: 10500, price: 13999, stock: 35, threshold: 8, unit: 'pcs' },

  // ── Phone Accessories ──────────────────────────────────────────────────
  { name: 'Baseus 20W USB-C Fast Charger', name_bn: 'বাসিউস 20W ফাস্ট চার্জার', sku: 'PA-001', category: 'Phone Accessories', cost: 450, price: 799, stock: 120, threshold: 25, unit: 'pcs' },
  { name: 'Samsung 25W Super Fast Charger', name_bn: 'স্যামসাং 25W সুপার ফাস্ট চার্জার', sku: 'PA-002', category: 'Phone Accessories', cost: 800, price: 1399, stock: 80, threshold: 15, unit: 'pcs' },
  { name: 'Baseus 10000mAh MagSafe Power Bank', name_bn: 'বাসিউস পাওয়ার ব্যাংক', sku: 'PA-003', category: 'Phone Accessories', cost: 1200, price: 1999, stock: 60, threshold: 12, unit: 'pcs' },
  { name: 'Spigen Case for Samsung A15', name_bn: 'স্পাইজেন কেস', sku: 'PA-004', category: 'Phone Accessories', cost: 350, price: 699, stock: 150, threshold: 30, unit: 'pcs' },
  { name: 'Tempered Glass (Universal)', name_bn: 'টেম্পার্ড গ্লাস', sku: 'PA-005', category: 'Phone Accessories', cost: 50, price: 150, stock: 500, threshold: 100, unit: 'pcs' },
  { name: 'Anker USB-C to C Cable 1.8m', name_bn: 'অ্যাঙ্কার ইউএসবি-সি কেবল', sku: 'PA-006', category: 'Phone Accessories', cost: 300, price: 599, stock: 200, threshold: 40, unit: 'pcs' },
  { name: 'Car Phone Holder Mount', name_bn: 'কার ফোন হোল্ডার', sku: 'PA-007', category: 'Phone Accessories', cost: 200, price: 399, stock: 90, threshold: 20, unit: 'pcs' },
  { name: 'Wireless Charger Pad 15W', name_bn: 'ওয়্যারলেস চার্জার প্যাড', sku: 'PA-008', category: 'Phone Accessories', cost: 500, price: 999, stock: 70, threshold: 15, unit: 'pcs' },
  { name: 'Phone Ring Holder (360°)', name_bn: 'ফোন রিং হোল্ডার', sku: 'PA-009', category: 'Phone Accessories', cost: 30, price: 99, stock: 300, threshold: 60, unit: 'pcs' },
  { name: 'Baseus 20000mAh Power Bank', name_bn: 'বাসিউস ২০০০০mAh পাওয়ার ব্যাংক', sku: 'PA-010', category: 'Phone Accessories', cost: 1400, price: 2299, stock: 45, threshold: 10, unit: 'pcs' },

  // ── Computers & Laptops ────────────────────────────────────────────────
  { name: 'HP 250 G10 i5 13th Gen 15.6"', name_bn: 'এইচপি 250 G10 আই5', sku: 'CL-001', category: 'Computers & Laptops', cost: 55000, price: 64999, stock: 8, threshold: 2, unit: 'pcs' },
  { name: 'Lenovo IdeaPad 3 i5 12th Gen', name_bn: 'লেনোভো আইডিয়াপ্যাড 3', sku: 'CL-002', category: 'Computers & Laptops', cost: 48000, price: 57999, stock: 6, threshold: 2, unit: 'pcs' },
  { name: 'Acer Aspire 3 i3 12th Gen 14"', name_bn: 'এসার এসপায়ার 3', sku: 'CL-003', category: 'Computers & Laptops', cost: 35000, price: 42999, stock: 10, threshold: 3, unit: 'pcs' },
  { name: 'Dell Inspiron 15 i5 13th Gen', name_bn: 'ডেল ইন্সপিরন 15', sku: 'CL-004', category: 'Computers & Laptops', cost: 58000, price: 69999, stock: 5, threshold: 2, unit: 'pcs' },
  { name: 'Logitech MK270 Wireless Keyboard+Mouse', name_bn: 'লজিটেক MK270', sku: 'CL-005', category: 'Computers & Laptops', cost: 1800, price: 2999, stock: 50, threshold: 10, unit: 'set' },
  { name: 'Logitech G102 Gaming Mouse', name_bn: 'লজিটেক G102 গেমিং মাউস', sku: 'CL-006', category: 'Computers & Laptops', cost: 1500, price: 2499, stock: 40, threshold: 8, unit: 'pcs' },
  { name: 'A4Tech Bloody J70 RGB Gaming Mouse', name_bn: 'এ4টেক ব্লাডি J70', sku: 'CL-007', category: 'Computers & Laptops', cost: 1200, price: 1999, stock: 35, threshold: 8, unit: 'pcs' },
  { name: 'Kingston NV2 500GB NVMe SSD', name_bn: 'কিংস্টন NV2 500GB SSD', sku: 'CL-008', category: 'Computers & Laptops', cost: 3200, price: 4499, stock: 60, threshold: 15, unit: 'pcs' },
  { name: 'Corsair Vengeance 16GB DDR4 RAM', name_bn: 'করসেয়ার 16GB DDR4 RAM', sku: 'CL-009', category: 'Computers & Laptops', cost: 3500, price: 4999, stock: 45, threshold: 10, unit: 'pcs' },
  { name: 'Logitech C920 HD Webcam', name_bn: 'লজিটেক C920 ওয়েবক্যাম', sku: 'CL-010', category: 'Computers & Laptops', cost: 3500, price: 5499, stock: 25, threshold: 5, unit: 'pcs' },
  { name: 'Havit HV-KB435L Mechanical Keyboard', name_bn: 'হাভিট মেকানিক্যাল কীবোর্ড', sku: 'CL-011', category: 'Computers & Laptops', cost: 1800, price: 2999, stock: 30, threshold: 6, unit: 'pcs' },
  { name: 'TP-Link Archer AX23 WiFi Router', name_bn: 'টিপি-লিংক AX23 রাউটার', sku: 'CL-012', category: 'Computers & Laptops', cost: 2500, price: 3799, stock: 35, threshold: 8, unit: 'pcs' },
  { name: 'TP-Link TL-WA850RE WiFi Extender', name_bn: 'টিপি-লিংক ওয়াই-ফাই এক্সটেন্ডার', sku: 'CL-013', category: 'Computers & Laptops', cost: 1300, price: 1999, stock: 40, threshold: 8, unit: 'pcs' },

  // ── Audio & Speakers ───────────────────────────────────────────────────
  { name: 'Xiaomi Redmi Buds 4 Active', name_bn: 'শাওমি রেডমি বাডস ৪', sku: 'AU-001', category: 'Audio & Speakers', cost: 1200, price: 1899, stock: 80, threshold: 15, unit: 'pcs' },
  { name: 'JBL Tune 520BT Headphones', name_bn: 'জেবিএল টিউন 520BT', sku: 'AU-002', category: 'Audio & Speakers', cost: 2800, price: 4299, stock: 40, threshold: 8, unit: 'pcs' },
  { name: 'Edifier X200 TWS Earbuds', name_bn: 'এডিফায়ার X200', sku: 'AU-003', category: 'Audio & Speakers', cost: 1000, price: 1699, stock: 65, threshold: 12, unit: 'pcs' },
  { name: 'JBL Clip 4 Bluetooth Speaker', name_bn: 'জেবিএল ক্লিপ ৪ স্পিকার', sku: 'AU-004', category: 'Audio & Speakers', cost: 2800, price: 4299, stock: 30, threshold: 6, unit: 'pcs' },
  { name: 'Samsung Galaxy Buds FE', name_bn: 'স্যামসাং গ্যালাক্সি বাডস FE', sku: 'AU-005', category: 'Audio & Speakers', cost: 6500, price: 9499, stock: 15, threshold: 3, unit: 'pcs' },
  { name: 'Realme Buds T110', name_bn: 'রিয়েলমি বাডস T110', sku: 'AU-006', category: 'Audio & Speakers', cost: 800, price: 1299, stock: 100, threshold: 20, unit: 'pcs' },
  { name: 'Anker Soundcore A30i Earbuds', name_bn: 'অ্যাঙ্কার সাউন্ডকোর A30i', sku: 'AU-007', category: 'Audio & Speakers', cost: 1500, price: 2499, stock: 45, threshold: 10, unit: 'pcs' },
  { name: 'JBL Go 3 Portable Speaker', name_bn: 'জেবিএল Go 3 স্পিকার', sku: 'AU-008', category: 'Audio & Speakers', cost: 2200, price: 3499, stock: 35, threshold: 7, unit: 'pcs' },
  { name: 'Boya BY-M1 Lavalier Mic', name_bn: 'বোয়া BY-M1 মাইক', sku: 'AU-009', category: 'Audio & Speakers', cost: 500, price: 999, stock: 70, threshold: 15, unit: 'pcs' },
  { name: 'Havit HV-H206U Gaming Headset', name_bn: 'হাভিট HV-H206U গেমিং হেডসেট', sku: 'AU-010', category: 'Audio & Speakers', cost: 1200, price: 1999, stock: 50, threshold: 10, unit: 'pcs' },

  // ── Cameras ────────────────────────────────────────────────────────────
  { name: 'Canon EOS 1500D Body', name_bn: 'ক্যানন EOS 1500D', sku: 'CM-001', category: 'Cameras', cost: 38000, price: 46999, stock: 4, threshold: 1, unit: 'pcs' },
  { name: 'Nikon D3500 Body', name_bn: 'নিকন D3500', sku: 'CM-002', category: 'Cameras', cost: 35000, price: 43999, stock: 3, threshold: 1, unit: 'pcs' },
  { name: 'GoPro Hero 12 Black', name_bn: 'গোপ্রো হিরো 12', sku: 'CM-003', category: 'Cameras', cost: 32000, price: 42999, stock: 5, threshold: 1, unit: 'pcs' },
  { name: 'DJI Mini 4K Drone', name_bn: 'ডিজেআই মিনি 4K ড্রোন', sku: 'CM-004', category: 'Cameras', cost: 30000, price: 39999, stock: 3, threshold: 1, unit: 'pcs' },
  { name: 'SanDisk Ultra 128GB SD Card', name_bn: 'স্যানডিস্ক 128GB SD কার্ড', sku: 'CM-005', category: 'Cameras', cost: 1200, price: 1899, stock: 100, threshold: 20, unit: 'pcs' },
  { name: 'Manfrotto PIXI Mini Tripod', name_bn: 'ম্যানফ্রোটো PIXI মিনি ট্রাইপড', sku: 'CM-006', category: 'Cameras', cost: 2000, price: 3299, stock: 20, threshold: 5, unit: 'pcs' },
  { name: 'Canon EF 50mm f/1.8 STM Lens', name_bn: 'ক্যানন 50mm f/1.8 লেন্স', sku: 'CM-007', category: 'Cameras', cost: 18000, price: 24999, stock: 4, threshold: 1, unit: 'pcs' },
  { name: 'Camera Bag (Large)', name_bn: 'ক্যামেরা ব্যাগ', sku: 'CM-008', category: 'Cameras', cost: 1500, price: 2499, stock: 25, threshold: 5, unit: 'pcs' },

  // ── Smartwatches & Wearables (Viral Product Test) ────────────────────────
  { name: 'Apple Watch Series 9 (45mm)', name_bn: 'অ্যাপল ওয়াচ সিরিজ 9', sku: 'SW-001', category: 'Phone Accessories', cost: 45000, price: 54999, stock: 150, threshold: 20, unit: 'pcs' },
  { name: 'Amazfit GTR 4 Smartwatch', name_bn: 'অ্যামেজফিট জিটিআর ৪', sku: 'SW-002', category: 'Phone Accessories', cost: 14000, price: 18999, stock: 45, threshold: 10, unit: 'pcs' },
];

// ─── realistic Bangladeshi customers ─────────────────────────────────────────
const CUSTOMERS = [
  { name: 'Rahim Uddin', phone: '+8801711234501', email: 'rahim.uddin@gmail.com', address: 'Mirpur-10, Dhaka' },
  { name: 'Fatema Begum', phone: '+8801811234502', email: 'fatema.b@yahoo.com', address: 'Dhanmondi, Dhaka' },
  { name: 'Karim Hossain', phone: '+8801911234503', email: 'karim.h@gmail.com', address: 'Gazipur Sadar, Gazipur' },
  { name: 'Nasrin Akter', phone: '+8801711234504', email: 'nasrin.a@gmail.com', address: 'Agrabad, Chittagong' },
  { name: 'Mosharraf Ali', phone: '+8801611234505', email: null, address: 'Sylhet Sadar, Sylhet' },
  { name: 'Shapna Khatun', phone: '+8801811234506', email: 'shapna.k@hotmail.com', address: 'Khulna Sadar, Khulna' },
  { name: 'Jahangir Alam', phone: '+8801711234507', email: 'jahangir.a@gmail.com', address: 'Rajshahi Sadar, Rajshahi' },
  { name: 'Runa Laila', phone: '+8801911234508', email: null, address: 'Badda, Dhaka' },
  { name: 'Sohel Rana', phone: '+8801611234509', email: 'sohel.r@gmail.com', address: 'Uttara, Dhaka' },
  { name: 'Marium Begum', phone: '+8801811234510', email: 'marium.b@gmail.com', address: 'Gulshan, Dhaka' },
  { name: 'Anisur Rahman', phone: '+8801711234511', email: 'anisur.r@gmail.com', address: 'Mohammadpur, Dhaka' },
  { name: 'Sumaiya Islam', phone: '+8801911234512', email: 'sumaiya.i@outlook.com', address: 'Pallabi, Dhaka' },
  { name: 'Belal Hossain', phone: '+8801611234513', email: null, address: 'Narayanganj Sadar, Narayanganj' },
  { name: 'Khadija Akter', phone: '+8801811234514', email: 'khadija.a@gmail.com', address: 'Banani, Dhaka' },
  { name: 'Mizanur Rahman', phone: '+8801711234515', email: 'mizan.r@gmail.com', address: 'Khilkhet, Dhaka' },
  { name: 'Tania Akter', phone: '+8801911234516', email: 'tania.a@gmail.com', address: 'Bashundhara, Dhaka' },
  { name: 'Shahinur Islam', phone: '+8801611234517', email: null, address: 'Mymensingh Sadar, Mymensingh' },
  { name: 'Rumana Parvin', phone: '+8801811234518', email: 'rumana.p@gmail.com', address: 'Rampura, Dhaka' },
  { name: 'Habibur Rahman', phone: '+8801711234519', email: 'habib.r@yahoo.com', address: 'Baridhara, Dhaka' },
  { name: 'Shirin Akter', phone: '+8801911234520', email: 'shirin.a@gmail.com', address: 'Demra, Dhaka' },
  { name: 'Nurul Islam', phone: '+8801611234521', email: null, address: 'Comilla Sadar, Comilla' },
  { name: 'Sabrina Hossain', phone: '+8801811234522', email: 'sabrina.h@gmail.com', address: 'Eskaton, Dhaka' },
  { name: 'Rubel Miah', phone: '+8801711234523', email: 'rubel.m@gmail.com', address: 'Bogra Sadar, Bogra' },
  { name: 'Tasmia Nusrat', phone: '+8801911234524', email: 'tasmia.n@gmail.com', address: 'Tejgaon, Dhaka' },
  { name: 'Alamgir Hossain', phone: '+8801611234525', email: null, address: 'Faridpur Sadar, Faridpur' },
  { name: 'Kohinur Begum', phone: '+8801811234526', email: 'kohinur.b@gmail.com', address: 'Mohakhali, Dhaka' },
  { name: 'Monir Hossain', phone: '+8801711234527', email: 'monir.h@gmail.com', address: 'Azimpur, Dhaka' },
  { name: 'Parveen Sultana', phone: '+8801911234528', email: 'parveen.s@outlook.com', address: 'Lalbagh, Dhaka' },
  { name: 'Shahidul Islam', phone: '+8801611234529', email: null, address: 'Savar, Dhaka' },
  { name: 'Nusrat Jahan', phone: '+8801811234530', email: 'nusrat.j@gmail.com', address: 'Niketon, Dhaka' },
  { name: 'Faruk Ahmed', phone: '+8801711234531', email: 'faruk.a@gmail.com', address: 'Wari, Dhaka' },
  { name: 'Mariam Khatun', phone: '+8801911234532', email: 'mariam.k@gmail.com', address: 'Jatrabari, Dhaka' },
  { name: 'Kamrul Hasan', phone: '+8801611234533', email: null, address: 'Tongi, Gazipur' },
  { name: 'Dilruba Yesmin', phone: '+8801811234534', email: 'dilruba.y@gmail.com', address: 'Shyamoli, Dhaka' },
  { name: 'Rafiqul Islam', phone: '+8801711234535', email: 'rafiqul.i@gmail.com', address: 'Mirpur-1, Dhaka' },
  { name: 'Sadia Afrin', phone: '+8801911234536', email: 'sadia.a@gmail.com', address: 'Kalshi, Dhaka' },
  { name: 'Osman Gani', phone: '+8801611234537', email: null, address: 'Jessore Sadar, Jessore' },
  { name: 'Farhana Akter', phone: '+8801811234538', email: 'farhana.a@gmail.com', address: 'Adabor, Dhaka' },
  { name: 'Saiful Islam', phone: '+8801711234539', email: 'saiful.i@gmail.com', address: 'Brahmanbaria Sadar, Brahmanbaria' },
  { name: 'Meherjaan Begum', phone: '+8801911234540', email: null, address: 'Rayer Bazar, Dhaka' },
];

const SOURCES = ['Facebook', 'Facebook', 'Facebook', 'WhatsApp', 'Online', 'Online', 'In-Store', 'TikTok'];
const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'delivered', 'delivered', 'delivered', 'cancelled', 'returned'];
const EXPENSE_CATEGORIES = ['Rent', 'Utilities', 'Marketing', 'Salary', 'Packaging', 'Shipping', 'Supplies', 'Other'];

function seasonalWeight(dAgo: number): number {
  // Simulate massive Eid shopping spike ~60-80 days ago
  if (dAgo >= 60 && dAgo <= 80) return 4.5;

  // Simulate end of year / winter sale ~180-210 days ago
  if (dAgo >= 180 && dAgo <= 210) return 3.0;

  // Payday spikes (start of every 30 day cycle)
  if (dAgo % 30 >= 0 && dAgo % 30 <= 5) return 2.0;

  // Weekend spikes (assuming every 7th and 8th day relative to now is a weekend)
  if (dAgo % 7 === 0 || dAgo % 7 === 1) return 1.5;

  return 0.8; // Baseline
}

async function seed() {
  console.log('Starting realistic seed...');
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

    // Clear existing seed data
    console.log('Clearing old seed data...');
    await client.query(`DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE store_id = $1)`, [storeId]);
    await client.query(`DELETE FROM orders WHERE store_id = $1`, [storeId]);
    await client.query(`DELETE FROM customers WHERE store_id = $1`, [storeId]);
    await client.query(`DELETE FROM expenses WHERE store_id = $1`, [storeId]);
    await client.query(`DELETE FROM products WHERE store_id = $1`, [storeId]);

    // Insert products using actual category IDs
    const catResult = await client.query(`SELECT id, name FROM categories WHERE store_id = $1`, [storeId]);
    const catMap: Record<string, string> = {};
    for (const row of catResult.rows) catMap[row.name] = row.id;

    console.log(`Inserting ${PRODUCTS.length} products...`);
    const dbProducts: any[] = [];
    for (const p of PRODUCTS) {
      const categoryId = catMap[p.category];
      const { rows } = await client.query(
        `INSERT INTO products (store_id, name, name_bn, sku, category, cost_price, selling_price, stock_quantity, low_stock_threshold, unit, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [storeId, p.name, p.name_bn, p.sku, p.category, p.cost, p.price, p.stock, p.threshold, p.unit, true]
      );
      dbProducts.push(rows[0]);
    }
    console.log('Products inserted.');

    // Insert customers (Expanded to 200)
    console.log(`Inserting 200+ customers...`);
    const dbCustomers: any[] = [];

    // Insert base customers
    for (const c of CUSTOMERS) {
      const { rows } = await client.query(
        `INSERT INTO customers (store_id, name, phone, email, address)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [storeId, c.name, c.phone, c.email, c.address]
      );
      dbCustomers.push(rows[0]);
    }

    // Generate 160 more synthetic customers to bulk up the data
    const firstNames = ['Abu', 'Abdur', 'Asif', 'Rakib', 'Mehdi', 'Jahid', 'Nazmul', 'Sakib', 'Tamim', 'Mashrafe', 'Sadia', 'Nusrat', 'Ayesha', 'Fatema', 'Sumi', 'Tania', 'Mim', 'Ritu'];
    const lastNames = ['Rahman', 'Islam', 'Hasan', 'Hossain', 'Ahmed', 'Ali', 'Uddin', 'Khan', 'Chowdhury', 'Akter', 'Begum', 'Khatun', 'Parvin'];
    const areas = ['Uttara, Dhaka', 'Mirpur, Dhaka', 'Dhanmondi, Dhaka', 'Gulshan, Dhaka', 'Banani, Dhaka', 'Badda, Dhaka', 'Chittagong Sadar', 'Sylhet Sadar', 'Rajshahi', 'Khulna'];

    for (let i = 0; i < 160; i++) {
      const fname = pick(firstNames);
      const lname = pick(lastNames);
      const { rows } = await client.query(
        `INSERT INTO customers (store_id, name, phone, email, address)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [storeId, `${fname} ${lname}`, `+8801${ri(3,9)}${ri(1000000,9999999)}`, `${fname.toLowerCase()}.${ri(1,999)}@gmail.com`, pick(areas)]
      );
      dbCustomers.push(rows[0]);
    }
    console.log('Customers inserted.');

    // Generate orders — 12 months, ~3500 orders
    console.log('Generating high-volume orders (12 months)...');
    let orderCount = 0;
    const totalDays = 365;
    const dayWeights: number[] = Array.from({ length: totalDays }, (_, i) => seasonalWeight(i));

    // Distribution
    const champions = dbCustomers.slice(0, 20);
    const loyal = dbCustomers.slice(20, 60);
    const occasional = dbCustomers.slice(60, 150);
    const atRisk = dbCustomers.slice(150, 180);
    const lost = dbCustomers.slice(180, 200);

    const orderBatches: Array<{ customer: any; day: number; numItems: number }> = [];

    for (const c of champions) {
      const cnt = ri(25, 45); // highly active
      for (let i = 0; i < cnt; i++) orderBatches.push({ customer: c, day: wPick(Array.from({ length: totalDays }, (_, i) => i), dayWeights), numItems: ri(1, 6) });
    }
    for (const c of loyal) {
      const cnt = ri(10, 24);
      for (let i = 0; i < cnt; i++) orderBatches.push({ customer: c, day: wPick(Array.from({ length: totalDays }, (_, i) => i), dayWeights), numItems: ri(1, 4) });
    }
    for (const c of occasional) {
      const cnt = ri(3, 9);
      for (let i = 0; i < cnt; i++) orderBatches.push({ customer: c, day: wPick(Array.from({ length: totalDays }, (_, i) => i), dayWeights), numItems: ri(1, 2) });
    }
    for (const c of atRisk) {
      const cnt = ri(1, 4);
      for (let i = 0; i < cnt; i++) orderBatches.push({ customer: c, day: ri(90, 200), numItems: ri(1, 2) });
    }
    for (const c of lost) {
      const cnt = ri(1, 2);
      for (let i = 0; i < cnt; i++) orderBatches.push({ customer: c, day: ri(220, 360), numItems: 1 });
    }

    // Fill the rest up to 3500 orders
    while (orderBatches.length < 3500) {
      const day = wPick(Array.from({ length: totalDays }, (_, i) => i), dayWeights);
      orderBatches.push({ customer: pick(dbCustomers), day, numItems: ri(1, 5) });
    }

    orderBatches.sort(() => Math.random() - 0.5);

    let orderSeq = 1000;
    for (const batch of orderBatches) {
      const orderDate = daysAgo(batch.day);
      // Exclude Apple Watch from random 12-month pool to keep its data clean
      const regularProducts = dbProducts.filter(p => p.sku !== 'SW-001');
      const shuffled = [...regularProducts].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, batch.numItems);

      let subtotal = 0;
      const items: any[] = [];
      for (const p of selected) {
        const qty = ri(1, 3);
        subtotal += p.selling_price * qty;
        items.push({ p, qty });
      }

      const deliveryCharge = ri(60, 150);
      const discount = ri(0, 1) === 0 ? ri(0, Math.floor(subtotal * 0.10)) : 0;
      const total = subtotal + deliveryCharge - discount;

      const status = batch.day < 7
        ? wPick(STATUSES, [15, 20, 15, 10, 5, 0, 0, 0, 5, 0])
        : wPick(STATUSES, [2, 3, 4, 5, 60, 0, 0, 0, 8, 3]);

      const { rows: orderRows } = await client.query(
        `INSERT INTO orders (store_id, customer_id, order_number, status, source, total, delivery_charge, discount, notes, order_date, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11) RETURNING id`,
        [
          storeId, batch.customer.id,
          `SW-${orderSeq++}`,
          status,
          pick(SOURCES),
          total, deliveryCharge, discount,
          null,
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
    console.log(`Inserted ${orderCount} normal orders.`);

    // ── Inject Viral Product Trend ───────────────────────────────────────
    console.log('Injecting viral trend for Apple Watch Series 9...');
    const viralProduct = dbProducts.find(p => p.sku === 'SW-001');
    if (viralProduct) {
      let viralOrderCount = 0;
      // Generate 60 days of data to trigger Prophet and ensure 0% sparsity
      for (let day = 60; day >= -2; day--) {
        // Base volume: very low for the first 40 days, then massive exponential spike that STAYS high
        let baseVolume = 1;
        if (day <= 20) {
           // Cap the day variable for math purposes to prevent negative bases causing NaN
           const mathDay = Math.max(day, -2);
           baseVolume = Math.pow((25 - mathDay), 2) * 2;
        }
        const dailyOrders = Math.floor(baseVolume + ri(0, 5));

        for (let i = 0; i < dailyOrders; i++) {
          const orderDate = daysAgo(day);
          const customer = pick(dbCustomers);
          const qty = ri(1, 2);
          const subtotal = viralProduct.selling_price * qty;
          const deliveryCharge = ri(60, 150);
          const total = subtotal + deliveryCharge;

          const { rows: orderRows } = await client.query(
            `INSERT INTO orders (store_id, customer_id, order_number, status, source, total, delivery_charge, discount, notes, order_date, created_at, updated_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11) RETURNING id`,
            [
              storeId, customer.id,
              `SW-V${orderSeq++}`,
              'delivered',
              'Online',
              total, deliveryCharge, 0,
              'Viral trend order',
              orderDate, orderDate,
            ]
          );

          await client.query(
            `INSERT INTO order_items (order_id, product_id, product_name, unit_price, cost_price, quantity, created_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [orderRows[0].id, viralProduct.id, viralProduct.name, viralProduct.selling_price, viralProduct.cost_price, qty, orderDate]
          );
          viralOrderCount++;
          orderCount++;
        }
      }
      console.log(`Injected ${viralOrderCount} viral orders for ${viralProduct.name} over the last 60 days.`);
    }

    // Update customer aggregates
    await client.query(`
      UPDATE customers c
      SET total_orders = (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.status NOT IN ('cancelled','returned')),
          total_spent  = (SELECT COALESCE(SUM(total),0) FROM orders o WHERE o.customer_id = c.id AND o.status NOT IN ('cancelled','returned'))
      WHERE c.store_id = $1
    `, [storeId]);
    console.log('Customer aggregates updated.');

    // Expenses — 12 months
    console.log('Generating expenses...');
    for (let month = 0; month < 12; month++) {
      const baseDay = month * 30 + ri(0, 5);
      await client.query(
        `INSERT INTO expenses (store_id, category, amount, expense_date, notes) VALUES ($1,$2,$3,$4,$5)`,
        [storeId, 'Rent', 25000, daysAgo(baseDay + 1), 'Monthly office/warehouse rent']
      );
      await client.query(
        `INSERT INTO expenses (store_id, category, amount, expense_date, notes) VALUES ($1,$2,$3,$4,$5)`,
        [storeId, 'Salary', ri(35000, 50000), daysAgo(baseDay + 2), `Staff salaries - month ${month + 1}`]
      );
      await client.query(
        `INSERT INTO expenses (store_id, category, amount, expense_date, notes) VALUES ($1,$2,$3,$4,$5)`,
        [storeId, 'Utilities', ri(3000, 7000), daysAgo(baseDay + 3), 'Electricity, internet, water']
      );
    }

    const variableExpenses = [
      { category: 'Marketing', note: 'Facebook/Instagram ad spend', min: 5000, max: 20000 },
      { category: 'Marketing', note: 'Influencer collaboration', min: 8000, max: 25000 },
      { category: 'Packaging', note: 'Boxes, tape, bubble wrap', min: 3000, max: 8000 },
      { category: 'Shipping', note: 'Courier service payment (Sundarban/Pathao)', min: 4000, max: 12000 },
      { category: 'Supplies', note: 'Office supplies restock', min: 1000, max: 3000 },
      { category: 'Other', note: 'Miscellaneous business expense', min: 500, max: 5000 },
    ];

    for (let i = 0; i < 60; i++) {
      const e = pick(variableExpenses);
      await client.query(
        `INSERT INTO expenses (store_id, category, amount, expense_date, notes) VALUES ($1,$2,$3,$4,$5)`,
        [storeId, e.category, ri(e.min, e.max), daysAgo(ri(0, 365)), e.note]
      );
    }
    console.log('Expenses inserted.');

    console.log('\n✅  Seed complete!');
    console.log(`   Products  : ${PRODUCTS.length}`);
    console.log(`   Customers : ${CUSTOMERS.length}`);
    console.log(`   Orders    : ${orderCount}`);
    console.log(`   Store     : ${storeId}`);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    client?.release();
    await db.end();
  }
}

seed();
