using SellWise.Web.Data;
using SellWise.Web.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SellWise.Web.Services;

public class DemoSeederService
{
    private readonly AppDbContext _db;

    public DemoSeederService(AppDbContext db)
    {
        _db = db;
    }

    public async Task SeedStoreAsync(Guid storeId)
    {
        if (_db.Products.Any(p => p.StoreId == storeId))
            return;

        var store = await _db.Stores.FindAsync(storeId);
        if (store == null) return;

        // --- Customers (200 Bangladeshi names) ---
        var firstNames = new[] { "Rakib", "Jahid", "Ayesha", "Sumi", "Sakib", "Ritu", "Mim", "Shapna", "Fatema", "Khadija", "Habibur", "Karim", "Belal", "Mizanur", "Shirin", "Jahangir", "Marium", "Tanvir", "Nusrat", "Farhan", "Imran", "Tasnim", "Sabrina", "Arif", "Mst", "Rafiq", "Shibli", "Farzana", "Mamun", "Hasan", "Rubel", "Kamal", "Jamal", "Salim", "Babul", "Firoz", "Rana", "Piash", "Sharmin", "Monira", "Ruma", "Jesmin", "Poly", "Tuli", "Ruma", "Shanta", "Bithi", "Lily", "Nira", "Rokeya" };
        var lastNames = new[] { "Hossain", "Ahmed", "Khan", "Begum", "Hasan", "Uddin", "Islam", "Chowdhury", "Rahman", "Akter", "Parvin", "Khatun", "Alam", "Mia", "Sheikh", "Mollah", "Sarkar", "Biswas", "Mondal", "Das", "Gupta", "Sen", "Banerjee", "Roy", "Paul", "Datta", "Majumder", "Chakraborty", "Bhowmick", "Sinha" };
        var domains = new[] { "hotmail.com", "gmail.com", "yahoo.com", "outlook.com" };

        var customers = new List<Customer>();
        var rnd = new Random(42);

        for (int i = 0; i < 200; i++)
        {
            var fn = firstNames[rnd.Next(firstNames.Length)];
            var ln = lastNames[rnd.Next(lastNames.Length)];
            var name = $"{fn} {ln}";
            var phone = $"017{rnd.Next(10000000, 99999999)}";
            var email = $"{fn.ToLower()}.{ln.ToLower()}{rnd.Next(1, 99)}@{domains[rnd.Next(domains.Length)]}";

            customers.Add(new Customer
            {
                StoreId = storeId,
                Name = name,
                Phone = phone,
                Email = email,
                TotalOrders = 0,
                TotalSpent = 0,
                CreatedAt = DateTime.UtcNow.AddDays(-rnd.Next(30, 365)),
                UpdatedAt = DateTime.UtcNow
            });
        }
        _db.Customers.AddRange(customers);

        // --- Products (53 products across categories) ---
        var products = new List<Product>
        {
            // Mobile Phones (20)
            new() { StoreId = storeId, Name = "Samsung Galaxy A15 (6/128GB)", Sku = "SW-001", Category = "Mobile Phones", CostPrice = 12000, SellingPrice = 18999, StockQuantity = 25, LowStockThreshold = 10, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Samsung Galaxy A25 5G (8/128GB)", Sku = "SW-002", Category = "Mobile Phones", CostPrice = 22000, SellingPrice = 32999, StockQuantity = 40, LowStockThreshold = 10, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Xiaomi Redmi Note 13 (8/128GB)", Sku = "SW-003", Category = "Mobile Phones", CostPrice = 15000, SellingPrice = 21999, StockQuantity = 60, LowStockThreshold = 15, Unit = "pcs" },
            new() { StoreId = storeId, Name = "iPhone 15 (128GB)", Sku = "SW-004", Category = "Mobile Phones", CostPrice = 85000, SellingPrice = 109999, StockQuantity = 15, LowStockThreshold = 5, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Realme Narzo 70x 5G (6/128GB)", Sku = "SW-005", Category = "Mobile Phones", CostPrice = 11000, SellingPrice = 16999, StockQuantity = 22, LowStockThreshold = 10, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Vivo Y27 (6/128GB)", Sku = "SW-006", Category = "Mobile Phones", CostPrice = 13000, SellingPrice = 19999, StockQuantity = 8, LowStockThreshold = 10, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Tecno Spark 20C (4/128GB)", Sku = "SW-007", Category = "Mobile Phones", CostPrice = 7000, SellingPrice = 10999, StockQuantity = 35, LowStockThreshold = 10, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Samsung Galaxy A15 (4/128GB)", Sku = "SW-008", Category = "Mobile Phones", CostPrice = 10000, SellingPrice = 15999, StockQuantity = 30, LowStockThreshold = 10, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Xiaomi 14 CIVI (12/256GB)", Sku = "SW-009", Category = "Mobile Phones", CostPrice = 35000, SellingPrice = 49999, StockQuantity = 12, LowStockThreshold = 5, Unit = "pcs" },
            new() { StoreId = storeId, Name = "OnePlus Nord CE4 Lite (8/128GB)", Sku = "SW-010", Category = "Mobile Phones", CostPrice = 18000, SellingPrice = 26999, StockQuantity = 18, LowStockThreshold = 8, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Google Pixel 8a (8/128GB)", Sku = "SW-011", Category = "Mobile Phones", CostPrice = 30000, SellingPrice = 44999, StockQuantity = 10, LowStockThreshold = 5, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Samsung Galaxy S24 FE (8/128GB)", Sku = "SW-012", Category = "Mobile Phones", CostPrice = 45000, SellingPrice = 64999, StockQuantity = 8, LowStockThreshold = 3, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Redmi 13C (6/128GB)", Sku = "SW-013", Category = "Mobile Phones", CostPrice = 8500, SellingPrice = 12999, StockQuantity = 45, LowStockThreshold = 15, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Samsung Galaxy M15 (6/128GB)", Sku = "SW-014", Category = "Mobile Phones", CostPrice = 13500, SellingPrice = 19999, StockQuantity = 28, LowStockThreshold = 10, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Realme C67 (6/128GB)", Sku = "SW-015", Category = "Mobile Phones", CostPrice = 9500, SellingPrice = 14999, StockQuantity = 33, LowStockThreshold = 10, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Infinix Hot 40 Pro (8/256GB)", Sku = "SW-016", Category = "Mobile Phones", CostPrice = 12000, SellingPrice = 18999, StockQuantity = 20, LowStockThreshold = 8, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Nothing Phone (2a) (8/128GB)", Sku = "SW-017", Category = "Mobile Phones", CostPrice = 22000, SellingPrice = 33999, StockQuantity = 14, LowStockThreshold = 5, Unit = "pcs" },
            new() { StoreId = storeId, Name = "iPhone 14 (128GB)", Sku = "SW-018", Category = "Mobile Phones", CostPrice = 65000, SellingPrice = 84999, StockQuantity = 10, LowStockThreshold = 3, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Samsung Galaxy A05 (4/64GB)", Sku = "SW-019", Category = "Mobile Phones", CostPrice = 7000, SellingPrice = 10999, StockQuantity = 50, LowStockThreshold = 15, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Motorola Moto G84 (8/256GB)", Sku = "SW-020", Category = "Mobile Phones", CostPrice = 20000, SellingPrice = 29999, StockQuantity = 16, LowStockThreshold = 5, Unit = "pcs" },

            // Phone Accessories (10)
            new() { StoreId = storeId, Name = "Tempered Glass (Universal)", Sku = "SW-021", Category = "Phone Accessories", CostPrice = 50, SellingPrice = 199, StockQuantity = 500, LowStockThreshold = 50, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Silicone Phone Case (Universal)", Sku = "SW-022", Category = "Phone Accessories", CostPrice = 80, SellingPrice = 299, StockQuantity = 300, LowStockThreshold = 30, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Fast Charger 25W (Type-C)", Sku = "SW-023", Category = "Phone Accessories", CostPrice = 300, SellingPrice = 799, StockQuantity = 150, LowStockThreshold = 20, Unit = "pcs" },
            new() { StoreId = storeId, Name = "USB-C Cable 1.5m", Sku = "SW-024", Category = "Phone Accessories", CostPrice = 50, SellingPrice = 199, StockQuantity = 400, LowStockThreshold = 50, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Wireless Charger Pad 15W", Sku = "SW-025", Category = "Phone Accessories", CostPrice = 500, SellingPrice = 1299, StockQuantity = 80, LowStockThreshold = 10, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Car Phone Holder Mount", Sku = "SW-026", Category = "Phone Accessories", CostPrice = 100, SellingPrice = 399, StockQuantity = 120, LowStockThreshold = 15, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Power Bank 10000mAh", Sku = "SW-027", Category = "Phone Accessories", CostPrice = 600, SellingPrice = 1499, StockQuantity = 60, LowStockThreshold = 10, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Phone Stand Holder (Adjustable)", Sku = "SW-028", Category = "Phone Accessories", CostPrice = 100, SellingPrice = 349, StockQuantity = 200, LowStockThreshold = 20, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Screen Protector Kit", Sku = "SW-029", Category = "Phone Accessories", CostPrice = 30, SellingPrice = 149, StockQuantity = 600, LowStockThreshold = 50, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Camera Lens Protector (Universal)", Sku = "SW-030", Category = "Phone Accessories", CostPrice = 40, SellingPrice = 179, StockQuantity = 450, LowStockThreshold = 40, Unit = "pcs" },

            // Computers & Laptops (10)
            new() { StoreId = storeId, Name = "HP 250 G10 i5 13th Gen 15.6\"", Sku = "SW-031", Category = "Computers & Laptops", CostPrice = 45000, SellingPrice = 62999, StockQuantity = 8, LowStockThreshold = 3, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Lenovo IdeaPad 3 i5 12th Gen", Sku = "SW-032", Category = "Computers & Laptops", CostPrice = 40000, SellingPrice = 56999, StockQuantity = 6, LowStockThreshold = 3, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Acer Aspire 3 i3 12th Gen 14\"", Sku = "SW-033", Category = "Computers & Laptops", CostPrice = 30000, SellingPrice = 42999, StockQuantity = 10, LowStockThreshold = 3, Unit = "pcs" },
            new() { StoreId = storeId, Name = "ASUS VivoBook 15 i5 12th Gen", Sku = "SW-034", Category = "Computers & Laptops", CostPrice = 42000, SellingPrice = 59999, StockQuantity = 7, LowStockThreshold = 3, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Dell Inspiron 15 i5 13th Gen", Sku = "SW-035", Category = "Computers & Laptops", CostPrice = 48000, SellingPrice = 67999, StockQuantity = 5, LowStockThreshold = 2, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Logitech G102 Gaming Mouse", Sku = "SW-036", Category = "Computers & Laptops", CostPrice = 1200, SellingPrice = 1899, StockQuantity = 40, LowStockThreshold = 10, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Havit HV-H206U Gaming Headset", Sku = "SW-037", Category = "Computers & Laptops", CostPrice = 1500, SellingPrice = 2499, StockQuantity = 25, LowStockThreshold = 8, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Baseus 20000mAh Power Bank", Sku = "SW-038", Category = "Computers & Laptops", CostPrice = 1800, SellingPrice = 2999, StockQuantity = 30, LowStockThreshold = 8, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Edifier X200 TWS Earbuds", Sku = "SW-039", Category = "Audio", CostPrice = 800, SellingPrice = 1499, StockQuantity = 50, LowStockThreshold = 10, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Samsung Galaxy Buds FE", Sku = "SW-040", Category = "Audio", CostPrice = 5000, SellingPrice = 8999, StockQuantity = 15, LowStockThreshold = 5, Unit = "pcs" },

            // Cameras (10)
            new() { StoreId = storeId, Name = "Canon EF 50mm f/1.8 STM Lens", Sku = "CM-007", Category = "Cameras", CostPrice = 15000, SellingPrice = 24999, StockQuantity = 4, LowStockThreshold = 2, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Manfrotto PIXI Mini Tripod", Sku = "CM-006", Category = "Cameras", CostPrice = 1500, SellingPrice = 3299, StockQuantity = 20, LowStockThreshold = 5, Unit = "pcs" },
            new() { StoreId = storeId, Name = "SanDisk Ultra 128GB SD Card", Sku = "CM-005", Category = "Cameras", CostPrice = 800, SellingPrice = 1899, StockQuantity = 100, LowStockThreshold = 20, Unit = "pcs" },
            new() { StoreId = storeId, Name = "DJI Mini 4K Drone", Sku = "CM-004", Category = "Cameras", CostPrice = 25000, SellingPrice = 39999, StockQuantity = 3, LowStockThreshold = 2, Unit = "pcs" },
            new() { StoreId = storeId, Name = "GoPro Hero 12 Black", Sku = "CM-003", Category = "Cameras", CostPrice = 28000, SellingPrice = 42999, StockQuantity = 5, LowStockThreshold = 3, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Nikon D3500 Body", Sku = "CM-002", Category = "Cameras", CostPrice = 28000, SellingPrice = 43999, StockQuantity = 3, LowStockThreshold = 2, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Canon EOS 1500D Body", Sku = "CM-001", Category = "Cameras", CostPrice = 30000, SellingPrice = 46999, StockQuantity = 4, LowStockThreshold = 2, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Camera Bag (Large)", Sku = "CM-008", Category = "Cameras", CostPrice = 1200, SellingPrice = 2499, StockQuantity = 25, LowStockThreshold = 5, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Amazonbasics Tripod (60-inch)", Sku = "CM-009", Category = "Cameras", CostPrice = 2000, SellingPrice = 3999, StockQuantity = 15, LowStockThreshold = 5, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Amazfit GTR 4 Smartwatch", Sku = "CM-010", Category = "Wearables", CostPrice = 12000, SellingPrice = 18999, StockQuantity = 12, LowStockThreshold = 5, Unit = "pcs" },

            // Wearables (3)
            new() { StoreId = storeId, Name = "Apple Watch Series 9 (45mm)", Sku = "SW-041", Category = "Wearables", CostPrice = 35000, SellingPrice = 54999, StockQuantity = 150, LowStockThreshold = 20, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Samsung Galaxy Watch 6 (40mm)", Sku = "SW-042", Category = "Wearables", CostPrice = 18000, SellingPrice = 29999, StockQuantity = 18, LowStockThreshold = 5, Unit = "pcs" },
            new() { StoreId = storeId, Name = "Xiaomi Smart Band 8", Sku = "SW-043", Category = "Wearables", CostPrice = 2000, SellingPrice = 3999, StockQuantity = 80, LowStockThreshold = 15, Unit = "pcs" },
        };

        _db.Products.AddRange(products);
        await _db.SaveChangesAsync();

        // --- Orders (~11000 orders over 90 days with Realistic Trend & Seasonality) ---
        var orderNum = 17000;
        var customerArr = customers.ToArray();
        var productArr = products.ToArray();
        var statuses = new[] { "completed", "completed", "completed", "completed", "pending" };

        _db.ChangeTracker.AutoDetectChangesEnabled = false;

        int orderCount = 0;
        for (int d = 90; d >= 0; d--)
        {
            var currentDate = DateTime.UtcNow.AddDays(-d);
            // Bangladesh weekend is typically Friday & Saturday
            bool isWeekend = currentDate.DayOfWeek == DayOfWeek.Friday || currentDate.DayOfWeek == DayOfWeek.Saturday;

            // 1. General Upward Trend: Starts around 60 orders/day, grows to ~140/day
            double trendMultiplier = (90 - d) / 90.0; // 0.0 to 1.0
            double baseOrders = 60 + (80 * trendMultiplier);

            // 2. Weekly Seasonality: Weekends have 50% more sales
            if (isWeekend) baseOrders *= 1.5;

            // 3. Random Daily Noise (+/- 20%)
            int dailyOrders = (int)(baseOrders * (0.8 + (rnd.NextDouble() * 0.4)));

            for (int i = 0; i < dailyOrders; i++)
            {
                var date = currentDate.Date.AddHours(rnd.Next(8, 22)).AddMinutes(rnd.Next(0, 60));

                // 4. Product Selection with Lifecycle Trends
                Product product = productArr[rnd.Next(productArr.Length)];

                // Re-roll to create product lifecycles
                if (product.Name.Contains("15") || product.Name.Contains("S24"))
                {
                    // Newer phones: sell more recently
                    if (rnd.NextDouble() > trendMultiplier) product = productArr[rnd.Next(productArr.Length)];
                }
                else if (product.Name.Contains("14") || product.Name.Contains("12th") || product.Name.Contains("3"))
                {
                    // Older models: sold more in the past
                    if (rnd.NextDouble() < trendMultiplier) product = productArr[rnd.Next(productArr.Length)];
                }

                var qty = rnd.Next(1, 4);
                var customer = customerArr[rnd.Next(customerArr.Length)];
                var status = statuses[rnd.Next(statuses.Length)];
                var isDelivery = rnd.Next(5) == 0;

                var order = new Order
                {
                    StoreId = storeId,
                    CustomerId = customer.Id,
                    OrderNumber = $"SW-V{orderNum + orderCount}",
                    Status = status,
                    Total = product.SellingPrice * qty,
                    DeliveryCharge = isDelivery ? 60 : 0,
                    Discount = 0,
                    Notes = null,
                    OrderDate = date,
                    CreatedAt = date,
                    UpdatedAt = date
                };

                order.Items.Add(new OrderItem
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    UnitPrice = product.SellingPrice,
                    CostPrice = product.CostPrice,
                    Quantity = qty,
                    CreatedAt = date
                });

                _db.Orders.Add(order);

                customer.TotalOrders++;
                customer.TotalSpent += order.Total;

                orderCount++;

                if (orderCount % 1000 == 0)
                {
                    await _db.SaveChangesAsync();
                    _db.ChangeTracker.Clear();
                }
            }
        }

        await _db.SaveChangesAsync();
        _db.ChangeTracker.AutoDetectChangesEnabled = true;

        // --- Expenses (3 months of expenses) ---
        var expenseCategories = new[] { "Rent", "Salary", "Utilities", "Marketing", "Packaging", "Supplies", "Other" };
        var expenseNotes = new Dictionary<string, string[]>
        {
            ["Rent"] = new[] { "Monthly office/warehouse rent" },
            ["Salary"] = new[] { "Staff salaries - monthly payroll", "Sales team incentives", "Security staff payment" },
            ["Utilities"] = new[] { "Electricity, internet, water bill", "Internet service provider" },
            ["Marketing"] = new[] { "Facebook/Instagram ads", "Google Ads campaign", "Flyer printing and distribution" },
            ["Packaging"] = new[] { "Boxes, tape, bubble wrap", "Branded packaging materials" },
            ["Supplies"] = new[] { "Office supplies restocking", "Printer ink and paper" },
            ["Other"] = new[] { "Miscellaneous business expenses", "Delivery logistics" }
        };

        for (int i = 0; i < 60; i++)
        {
            var cat = expenseCategories[rnd.Next(expenseCategories.Length)];
            var amount = cat switch
            {
                "Rent" => 25000m,
                "Salary" => 30000m + rnd.Next(5000, 15000),
                "Utilities" => 3000m + rnd.Next(1000, 5000),
                "Marketing" => 5000m + rnd.Next(3000, 15000),
                "Packaging" => 2000m + rnd.Next(1000, 5000),
                "Supplies" => 500m + rnd.Next(500, 2000),
                _ => 1000m + rnd.Next(500, 5000)
            };

            _db.Expenses.Add(new Expense
            {
                StoreId = storeId,
                Category = cat,
                Amount = amount,
                ExpenseDate = DateTime.UtcNow.AddDays(-rnd.Next(0, 90)),
                Notes = expenseNotes[cat][rnd.Next(expenseNotes[cat].Length)],
                CreatedAt = DateTime.UtcNow
            });
        }

        // --- Inventory Alerts ---
        var lowStockProducts = productArr.Where(p => p.StockQuantity <= p.LowStockThreshold * 2).Take(12);
        foreach (var p in lowStockProducts)
        {
            _db.Alerts.Add(new InventoryAlert
            {
                StoreId = storeId,
                ProductId = p.Id,
                Type = "Low Stock",
                Message = $"Only {p.StockQuantity} unit{(p.StockQuantity == 1 ? "" : "s")} left — predicted demand: {rnd.Next(10, 50)} in 30 days. Recommend ordering {rnd.Next(5, 20)} units.",
                Severity = p.StockQuantity <= p.LowStockThreshold ? "critical" : "warning",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();
    }
}
