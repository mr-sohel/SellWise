import re

with open('packages/server/src/scripts/seed-clothing.ts', 'r') as f:
    content = f.read()

content = content.replace("TARGET_EMAIL = 'sohel@gmail.com';", "TARGET_EMAIL = 'akash@gmail.com';")

clothing_products = """
const ENHANCED_PRODUCTS: ProductDef[] = [
  // ── Men's Clothing ─────────────────────────────────────────────
  { name: 'Men Cotton Casual Shirt', name_bn: 'ছেলেদের সুতির শার্ট', sku: 'MC-011', category: 'Men\\'s Clothing', cost: 400, price: 800, stock: 100, threshold: 20, unit: 'pcs' },
  { name: 'Slim Fit Denim Jeans', name_bn: 'স্লিম ফিট ডেনিম জিন্স', sku: 'MC-012', category: 'Men\\'s Clothing', cost: 600, price: 1200, stock: 80, threshold: 15, unit: 'pcs' },
  { name: 'Classic Polo T-Shirt', name_bn: 'ক্লাসিক পোলো টি-শার্ট', sku: 'MC-013', category: 'Men\\'s Clothing', cost: 250, price: 500, stock: 150, threshold: 30, unit: 'pcs' },
  { name: 'Formal Trousers', name_bn: 'ফরমাল প্যান্ট', sku: 'MC-014', category: 'Men\\'s Clothing', cost: 500, price: 950, stock: 60, threshold: 10, unit: 'pcs' },
  { name: 'Winter Puffer Jacket', name_bn: 'শীতের জ্যাকেট', sku: 'MC-015', category: 'Men\\'s Clothing', cost: 1200, price: 2500, stock: 40, threshold: 5, unit: 'pcs' },

  // ── Women's Clothing ────────────────────────────────────────
  { name: 'Designer Cotton Saree', name_bn: 'ডিজাইনার সুতির শাড়ি', sku: 'WC-011', category: 'Women\\'s Clothing', cost: 1200, price: 2500, stock: 50, threshold: 10, unit: 'pcs' },
  { name: 'Embroidery Salwar Kameez', name_bn: 'এমব্রয়ডারি সালোয়ার কামিজ', sku: 'WC-012', category: 'Women\\'s Clothing', cost: 1500, price: 3000, stock: 40, threshold: 8, unit: 'set' },
  { name: 'Casual Kurti Tops', name_bn: 'ক্যাজুয়াল কুর্তি', sku: 'WC-013', category: 'Women\\'s Clothing', cost: 400, price: 850, stock: 120, threshold: 20, unit: 'pcs' },
  { name: 'Western Long Dress', name_bn: 'ওয়েস্টার্ন লং ড্রেস', sku: 'WC-014', category: 'Women\\'s Clothing', cost: 800, price: 1800, stock: 60, threshold: 10, unit: 'pcs' },
  { name: 'Stretchable Leggings', name_bn: 'লেগিংস', sku: 'WC-015', category: 'Women\\'s Clothing', cost: 200, price: 400, stock: 200, threshold: 40, unit: 'pcs' },

  // ── Accessories ──────────────────────────────────────
  { name: 'Genuine Leather Belt', name_bn: 'চামড়ার বেল্ট', sku: 'AC-014', category: 'Accessories', cost: 300, price: 600, stock: 100, threshold: 15, unit: 'pcs' },
  { name: 'Men Leather Wallet', name_bn: 'ছেলেদের চামড়ার মানিব্যাগ', sku: 'AC-015', category: 'Accessories', cost: 350, price: 750, stock: 90, threshold: 15, unit: 'pcs' },
  { name: 'UV Protection Sunglasses', name_bn: 'সানগ্লাস', sku: 'AC-016', category: 'Accessories', cost: 400, price: 900, stock: 80, threshold: 15, unit: 'pcs' },
  { name: 'Women Handbag', name_bn: 'মেয়েদের হ্যান্ডব্যাগ', sku: 'AC-017', category: 'Accessories', cost: 800, price: 1600, stock: 45, threshold: 5, unit: 'pcs' },
  { name: 'Cotton Baseball Cap', name_bn: 'কটন ক্যাপ', sku: 'AC-018', category: 'Accessories', cost: 150, price: 300, stock: 120, threshold: 20, unit: 'pcs' },
];
"""

content = re.sub(r'const ENHANCED_PRODUCTS: ProductDef\[\] = \[.*?\n\];', clothing_products.strip(), content, flags=re.DOTALL)

with open('packages/server/src/scripts/seed-clothing.ts', 'w') as f:
    f.write(content)

print("Modification complete.")
