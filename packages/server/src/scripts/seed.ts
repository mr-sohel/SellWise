import { db } from '../config/db';
import { authService } from '../services/auth.service';
import { userRepository } from '../repositories/user.repository';
import type { PoolClient } from 'pg';

const TARGET_EMAIL = 'test@gmail.com';
const TARGET_PASSWORD = 'Sohelr';

// ─── helpers ────────────────────────────────────────────────────────────────
const ri = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const rf = (min: number, max: number) => Math.random() * (max - min) + min;
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

// ─── realistic product catalogue ─────────────────────────────────────────────
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
  // Electronics
  { name: 'Xiaomi Redmi Buds 4', name_bn: 'শাওমি রেডমি বাডস ৪', sku: 'EL-001', category: 'Electronics', cost: 900, price: 1299, stock: 85, threshold: 15, unit: 'pcs' },
  { name: 'Samsung 65W Fast Charger', name_bn: 'স্যামসাং ৬৫ডব্লিউ ফাস্ট চার্জার', sku: 'EL-002', category: 'Electronics', cost: 450, price: 699, stock: 120, threshold: 20, unit: 'pcs' },
  { name: 'Remax RGB Gaming Mouse', name_bn: 'রিম্যাক্স আরজিবি গেমিং মাউস', sku: 'EL-003', category: 'Electronics', cost: 600, price: 950, stock: 60, threshold: 10, unit: 'pcs' },
  { name: 'Baseus Power Bank 20000mAh', name_bn: 'বাসিউস পাওয়ার ব্যাংক ২০০০০', sku: 'EL-004', category: 'Electronics', cost: 1100, price: 1699, stock: 45, threshold: 10, unit: 'pcs' },
  { name: 'TP-Link TL-WA850RE Extender', name_bn: 'টিপি-লিংক ওয়াই-ফাই এক্সটেন্ডার', sku: 'EL-005', category: 'Electronics', cost: 1200, price: 1850, stock: 30, threshold: 8, unit: 'pcs' },
  { name: 'JBL Clip 4 Bluetooth Speaker', name_bn: 'জেবিএল ক্লিপ ৪ স্পিকার', sku: 'EL-006', category: 'Electronics', cost: 2200, price: 3299, stock: 25, threshold: 5, unit: 'pcs' },
  { name: 'Type-C USB Hub 7-in-1', name_bn: 'টাইপ-সি ইউএসবি হাব', sku: 'EL-007', category: 'Electronics', cost: 550, price: 899, stock: 90, threshold: 20, unit: 'pcs' },

  // Clothing
  { name: 'Men\'s Premium Cotton Polo', name_bn: 'পুরুষ প্রিমিয়াম পোলো', sku: 'CL-001', category: 'Clothing', cost: 280, price: 499, stock: 200, threshold: 30, unit: 'pcs' },
  { name: 'Women\'s Embroidered Kurti', name_bn: 'মহিলা এমব্রয়ডারি কুর্তি', sku: 'CL-002', category: 'Clothing', cost: 350, price: 649, stock: 150, threshold: 25, unit: 'pcs' },
  { name: 'Kids Cotton T-Shirt (3–12yr)', name_bn: 'শিশু কটন টি-শার্ট', sku: 'CL-003', category: 'Clothing', cost: 150, price: 275, stock: 300, threshold: 50, unit: 'pcs' },
  { name: 'Men\'s Slim Fit Jeans', name_bn: 'পুরুষ স্লিম ফিট জিন্স', sku: 'CL-004', category: 'Clothing', cost: 500, price: 899, stock: 100, threshold: 15, unit: 'pcs' },
  { name: 'Hooded Fleece Jacket', name_bn: 'হুডেড ফ্লিস জ্যাকেট', sku: 'CL-005', category: 'Clothing', cost: 600, price: 1099, stock: 70, threshold: 12, unit: 'pcs' },
  { name: 'Women\'s Printed Saree', name_bn: 'মহিলা প্রিন্টেড শাড়ি', sku: 'CL-006', category: 'Clothing', cost: 800, price: 1499, stock: 60, threshold: 10, unit: 'pcs' },

  // Beauty & Personal Care
  { name: 'Neutrogena Hydro Boost Gel', name_bn: 'নিউট্রোজিনা হাইড্রো বুস্ট', sku: 'BP-001', category: 'Beauty', cost: 750, price: 1199, stock: 80, threshold: 15, unit: 'pcs' },
  { name: 'Garnier Vitamin C Serum', name_bn: 'গার্নিয়ার ভিটামিন সি সেরাম', sku: 'BP-002', category: 'Beauty', cost: 400, price: 699, stock: 110, threshold: 20, unit: 'pcs' },
  { name: 'L\'Oreal Paris Hair Color', name_bn: 'লোরিয়াল হেয়ার কালার', sku: 'BP-003', category: 'Beauty', cost: 320, price: 549, stock: 90, threshold: 15, unit: 'pcs' },
  { name: 'Dove Body Lotion 400ml', name_bn: 'ডাভ বডি লোশন', sku: 'BP-004', category: 'Beauty', cost: 180, price: 310, stock: 150, threshold: 25, unit: 'pcs' },
  { name: 'Mamaearth Onion Shampoo', name_bn: 'মামাআর্থ অনিয়ন শ্যাম্পু', sku: 'BP-005', category: 'Beauty', cost: 350, price: 599, stock: 100, threshold: 20, unit: 'pcs' },

  // Home & Kitchen
  { name: 'Milton Thermosteel Flask 1L', name_bn: 'মিল্টন থার্মোস্টিল ফ্লাস্ক', sku: 'HK-001', category: 'Home & Kitchen', cost: 600, price: 999, stock: 55, threshold: 10, unit: 'pcs' },
  { name: 'Prestige Non-Stick Tawa 28cm', name_bn: 'প্রেস্টিজ নন-স্টিক তাওয়া', sku: 'HK-002', category: 'Home & Kitchen', cost: 450, price: 799, stock: 40, threshold: 8, unit: 'pcs' },
  { name: 'Walton Blender WBL-BS20', name_bn: 'ওয়ালটন ব্লেন্ডার', sku: 'HK-003', category: 'Home & Kitchen', cost: 900, price: 1499, stock: 30, threshold: 5, unit: 'pcs' },
  { name: 'Bamboo Cutting Board (3-pc)', name_bn: 'বাঁশের কাটিং বোর্ড', sku: 'HK-004', category: 'Home & Kitchen', cost: 280, price: 499, stock: 70, threshold: 10, unit: 'pcs' },
  { name: 'Microfiber Towel Set (4-pc)', name_bn: 'মাইক্রোফাইবার তোয়ালে সেট', sku: 'HK-005', category: 'Home & Kitchen', cost: 350, price: 599, stock: 80, threshold: 12, unit: 'pcs' },

  // Sports & Fitness
  { name: 'Adidas Running Shoes (Mens)', name_bn: 'অ্যাডিডাস রানিং জুতা', sku: 'SP-001', category: 'Sports', cost: 2200, price: 3499, stock: 40, threshold: 8, unit: 'pcs' },
  { name: 'Yoga Mat 6mm Non-Slip', name_bn: 'যোগব্যায়াম ম্যাট', sku: 'SP-002', category: 'Sports', cost: 400, price: 699, stock: 60, threshold: 10, unit: 'pcs' },
  { name: 'Resistance Bands Set (5-bands)', name_bn: 'রেজিস্ট্যান্স ব্যান্ড সেট', sku: 'SP-003', category: 'Sports', cost: 350, price: 599, stock: 75, threshold: 15, unit: 'pcs' },
  { name: 'Protein Shaker Bottle 700ml', name_bn: 'প্রোটিন শেকার বোতল', sku: 'SP-004', category: 'Sports', cost: 200, price: 349, stock: 100, threshold: 20, unit: 'pcs' },

  // Stationery & Office
  { name: 'Moleskine Classic Notebook A5', name_bn: 'মোলেস্কিন ক্লাসিক নোটবুক', sku: 'ST-001', category: 'Stationery', cost: 500, price: 849, stock: 90, threshold: 20, unit: 'pcs' },
  { name: 'Pilot G2 Gel Pen (12-pack)', name_bn: 'পাইলট জেল পেন ১২-প্যাক', sku: 'ST-002', category: 'Stationery', cost: 250, price: 420, stock: 200, threshold: 40, unit: 'box' },
  { name: 'Desk Organiser Set (6-slot)', name_bn: 'ডেস্ক অর্গানাইজার সেট', sku: 'ST-003', category: 'Stationery', cost: 380, price: 650, stock: 55, threshold: 10, unit: 'pcs' },
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

const SOURCES = ['Facebook', 'Instagram', 'Facebook', 'Online', 'Online', 'In-Store', 'WhatsApp'];
const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'delivered', 'delivered', 'delivered', 'cancelled', 'returned'];
const EXPENSE_CATEGORIES = ['Rent', 'Utilities', 'Marketing', 'Salary', 'Packaging', 'Shipping', 'Supplies', 'Other'];

// Seasonal multiplier: simulate higher sales around Eid (day 60-90 ago) and year-end
function seasonalWeight(dAgo: number): number {
  // Eid peak: ~70 days ago
  if (dAgo >= 55 && dAgo <= 90) return 2.5;
  // Pahela Baishakh: ~30 days ago
  if (dAgo >= 20 && dAgo <= 40) return 1.8;
  // Normal with slight weekend bumps (ignored at this granularity)
  return 1.0;
}

async function seed() {
  console.log('Starting realistic seed...');
  let client: PoolClient | null = null;

  try {
    // 1. Resolve user + store
    let user = await userRepository.findByEmail(TARGET_EMAIL);
    let storeId: string;

    if (!user) {
      console.log(`Creating user ${TARGET_EMAIL}...`);
      const result = await authService.signup({ email: TARGET_EMAIL, password: TARGET_PASSWORD, preferred_lang: 'en' });
      user = result.user as any;
      storeId = result.store.id;
    } else {
      const result = await authService.login({ email: TARGET_EMAIL, password: TARGET_PASSWORD });
      if (!result.store) throw new Error('User has no store!');
      storeId = result.store.id;
      console.log(`Found existing user. Store: ${storeId}`);
    }

    client = await db.connect();

    // 2. Clear existing seed data so it is idempotent
    console.log('Clearing old seed data...');
    await client.query(`DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE store_id = $1)`, [storeId]);
    await client.query(`DELETE FROM orders WHERE store_id = $1`, [storeId]);
    await client.query(`DELETE FROM customers WHERE store_id = $1`, [storeId]);
    await client.query(`DELETE FROM expenses WHERE store_id = $1`, [storeId]);
    await client.query(`DELETE FROM products WHERE store_id = $1`, [storeId]);

    // 3. Insert products
    console.log(`Inserting ${PRODUCTS.length} products...`);
    const dbProducts: any[] = [];
    for (const p of PRODUCTS) {
      const { rows } = await client.query(
        `INSERT INTO products (store_id, name, name_bn, sku, category, cost_price, selling_price, stock_quantity, low_stock_threshold, unit, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [storeId, p.name, p.name_bn, p.sku, p.category, p.cost, p.price, p.stock, p.threshold, p.unit, true]
      );
      dbProducts.push(rows[0]);
    }
    console.log('Products inserted.');

    // 4. Insert customers
    console.log(`Inserting ${CUSTOMERS.length} customers...`);
    const dbCustomers: any[] = [];
    for (const c of CUSTOMERS) {
      const { rows } = await client.query(
        `INSERT INTO customers (store_id, name, phone, email, address)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [storeId, c.name, c.phone, c.email, c.address]
      );
      dbCustomers.push(rows[0]);
    }
    console.log('Customers inserted.');

    // 5. Generate orders — 12 months history, ~800 orders
    // RFM spread: 15 champions, 10 loyal, 8 at-risk, 5 lost, rest normal
    console.log('Generating orders (12 months)...');
    let orderCount = 0;
    const totalDays = 365;

    // Build a weight distribution across days (seasonal bumps)
    const dayWeights: number[] = Array.from({ length: totalDays }, (_, i) => seasonalWeight(i));

    // Champion customers: high freq, recent
    const champions = dbCustomers.slice(0, 8);
    const loyal = dbCustomers.slice(8, 16);
    const occasional = dbCustomers.slice(16, 30);
    const atRisk = dbCustomers.slice(30, 36);   // last purchase 90-180 days ago
    const lost = dbCustomers.slice(36, 40);      // last purchase 200+ days ago

    const orderBatches: Array<{ customer: any; day: number; numItems: number }> = [];

    // Champions: 15-25 orders each in last 90 days
    for (const c of champions) {
      const cnt = ri(15, 25);
      for (let i = 0; i < cnt; i++) orderBatches.push({ customer: c, day: ri(0, 90), numItems: ri(1, 4) });
    }

    // Loyal: 6-14 orders each in last 180 days
    for (const c of loyal) {
      const cnt = ri(6, 14);
      for (let i = 0; i < cnt; i++) orderBatches.push({ customer: c, day: ri(0, 180), numItems: ri(1, 3) });
    }

    // Occasional: 2-6 orders spread over the year
    for (const c of occasional) {
      const cnt = ri(2, 6);
      for (let i = 0; i < cnt; i++) orderBatches.push({ customer: c, day: ri(0, 360), numItems: ri(1, 3) });
    }

    // At-risk: 1-3 orders, all 90-200 days ago
    for (const c of atRisk) {
      const cnt = ri(1, 3);
      for (let i = 0; i < cnt; i++) orderBatches.push({ customer: c, day: ri(90, 200), numItems: ri(1, 2) });
    }

    // Lost: 1-2 orders, 220+ days ago
    for (const c of lost) {
      const cnt = ri(1, 2);
      for (let i = 0; i < cnt; i++) orderBatches.push({ customer: c, day: ri(220, 360), numItems: 1 });
    }

    // Pad to ~800 total with random customer-day combos
    while (orderBatches.length < 800) {
      const day = wPick(Array.from({ length: totalDays }, (_, i) => i), dayWeights);
      orderBatches.push({ customer: pick(dbCustomers), day, numItems: ri(1, 5) });
    }

    // Shuffle so inserts aren't grouped
    orderBatches.sort(() => Math.random() - 0.5);

    let orderSeq = 1000;
    for (const batch of orderBatches) {
      const orderDate = daysAgo(batch.day);

      // Pick products (no duplicate per order)
      const shuffled = [...dbProducts].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, batch.numItems);

      let subtotal = 0;
      const items: any[] = [];
      for (const p of selected) {
        const qty = ri(1, 4);
        subtotal += p.selling_price * qty;
        items.push({ p, qty });
      }

      const deliveryCharge = ri(60, 130);
      const discount = ri(0, 1) === 0 ? ri(0, Math.floor(subtotal * 0.12)) : 0;
      const total = subtotal + deliveryCharge - discount;

      const status = batch.day < 7
        ? wPick(STATUSES, [15, 20, 15, 10, 5, 0, 0, 0, 5, 0])  // recent: mostly pending/confirmed
        : wPick(STATUSES, [2, 3, 4, 5, 60, 0, 0, 0, 8, 3]);     // older: mostly delivered

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
    console.log(`Inserted ${orderCount} orders.`);

    // 6. Update customer aggregates
    await client.query(`
      UPDATE customers c
      SET total_orders = (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.status NOT IN ('cancelled','returned')),
          total_spent  = (SELECT COALESCE(SUM(total),0) FROM orders o WHERE o.customer_id = c.id AND o.status NOT IN ('cancelled','returned'))
      WHERE c.store_id = $1
    `, [storeId]);
    console.log('Customer aggregates updated.');

    // 7. Expenses — 12 months (~120 entries, realistic amounts)
    console.log('Generating expenses...');
    // Fixed monthly expenses
    for (let month = 0; month < 12; month++) {
      const baseDay = month * 30 + ri(0, 5);
      // Rent
      await client.query(
        `INSERT INTO expenses (store_id, category, amount, expense_date, notes) VALUES ($1,$2,$3,$4,$5)`,
        [storeId, 'Rent', 25000, daysAgo(baseDay + 1), 'Monthly office/warehouse rent']
      );
      // Salary
      await client.query(
        `INSERT INTO expenses (store_id, category, amount, expense_date, notes) VALUES ($1,$2,$3,$4,$5)`,
        [storeId, 'Salary', ri(35000, 50000), daysAgo(baseDay + 2), `Staff salaries - month ${month + 1}`]
      );
      // Utilities
      await client.query(
        `INSERT INTO expenses (store_id, category, amount, expense_date, notes) VALUES ($1,$2,$3,$4,$5)`,
        [storeId, 'Utilities', ri(3000, 7000), daysAgo(baseDay + 3), 'Electricity, internet, water']
      );
    }

    // Variable expenses spread over the year
    const variableExpenses = [
      { category: 'Marketing', note: 'Facebook/Instagram ad spend', min: 5000, max: 20000 },
      { category: 'Marketing', note: 'Influencer collaboration', min: 8000, max: 25000 },
      { category: 'Packaging', note: 'Boxes, tape, bubble wrap order', min: 3000, max: 8000 },
      { category: 'Shipping', note: 'Courier service payment', min: 4000, max: 12000 },
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
    console.log(`   Login     : ${TARGET_EMAIL} / ${TARGET_PASSWORD}`);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    client?.release();
    await db.end();
  }
}

seed();
