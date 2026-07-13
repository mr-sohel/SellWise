import { db } from '../config/db';
import { userRepository } from '../repositories/user.repository';
import type { PoolClient } from 'pg';

const TARGET_EMAIL = 'akash@gmail.com';

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
  // ── Men's Clothing ─────────────────────────────────────────────
  { name: 'Men Cotton Casual Shirt', name_bn: 'ছেলেদের সুতির শার্ট', sku: 'MC-011', category: 'Men\'s Clothing', cost: 400, price: 800, stock: 100, threshold: 20, unit: 'pcs' },
  { name: 'Slim Fit Denim Jeans', name_bn: 'স্লিম ফিট ডেনিম জিন্স', sku: 'MC-012', category: 'Men\'s Clothing', cost: 600, price: 1200, stock: 80, threshold: 15, unit: 'pcs' },
  { name: 'Classic Polo T-Shirt', name_bn: 'ক্লাসিক পোলো টি-শার্ট', sku: 'MC-013', category: 'Men\'s Clothing', cost: 250, price: 500, stock: 150, threshold: 30, unit: 'pcs' },
  { name: 'Formal Trousers', name_bn: 'ফরমাল প্যান্ট', sku: 'MC-014', category: 'Men\'s Clothing', cost: 500, price: 950, stock: 60, threshold: 10, unit: 'pcs' },
  { name: 'Winter Puffer Jacket', name_bn: 'শীতের জ্যাকেট', sku: 'MC-015', category: 'Men\'s Clothing', cost: 1200, price: 2500, stock: 40, threshold: 5, unit: 'pcs' },

  // ── Women's Clothing ────────────────────────────────────────
  { name: 'Designer Cotton Saree', name_bn: 'ডিজাইনার সুতির শাড়ি', sku: 'WC-011', category: 'Women\'s Clothing', cost: 1200, price: 2500, stock: 50, threshold: 10, unit: 'pcs' },
  { name: 'Embroidery Salwar Kameez', name_bn: 'এমব্রয়ডারি সালোয়ার কামিজ', sku: 'WC-012', category: 'Women\'s Clothing', cost: 1500, price: 3000, stock: 40, threshold: 8, unit: 'set' },
  { name: 'Casual Kurti Tops', name_bn: 'ক্যাজুয়াল কুর্তি', sku: 'WC-013', category: 'Women\'s Clothing', cost: 400, price: 850, stock: 120, threshold: 20, unit: 'pcs' },
  { name: 'Western Long Dress', name_bn: 'ওয়েস্টার্ন লং ড্রেস', sku: 'WC-014', category: 'Women\'s Clothing', cost: 800, price: 1800, stock: 60, threshold: 10, unit: 'pcs' },
  { name: 'Stretchable Leggings', name_bn: 'লেগিংস', sku: 'WC-015', category: 'Women\'s Clothing', cost: 200, price: 400, stock: 200, threshold: 40, unit: 'pcs' },

  // ── Accessories ──────────────────────────────────────
  { name: 'Genuine Leather Belt', name_bn: 'চামড়ার বেল্ট', sku: 'AC-014', category: 'Accessories', cost: 300, price: 600, stock: 100, threshold: 15, unit: 'pcs' },
  { name: 'Men Leather Wallet', name_bn: 'ছেলেদের চামড়ার মানিব্যাগ', sku: 'AC-015', category: 'Accessories', cost: 350, price: 750, stock: 90, threshold: 15, unit: 'pcs' },
  { name: 'UV Protection Sunglasses', name_bn: 'সানগ্লাস', sku: 'AC-016', category: 'Accessories', cost: 400, price: 900, stock: 80, threshold: 15, unit: 'pcs' },
  { name: 'Women Handbag', name_bn: 'মেয়েদের হ্যান্ডব্যাগ', sku: 'AC-017', category: 'Accessories', cost: 800, price: 1600, stock: 45, threshold: 5, unit: 'pcs' },
  { name: 'Cotton Baseball Cap', name_bn: 'কটন ক্যাপ', sku: 'AC-018', category: 'Accessories', cost: 150, price: 300, stock: 120, threshold: 20, unit: 'pcs' },
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
