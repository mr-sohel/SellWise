using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using SellWise.Web.Data;
using SellWise.Web.Models;
using SellWise.Web.ViewModels.Order;

namespace SellWise.Web.Controllers;

[Authorize]
public class OrderController : BaseController
{
    public OrderController(AppDbContext db) : base(db) { }

    public async Task<IActionResult> Index()
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        var orders = await Db.Orders
            .Include(o => o.Customer)
            .Include(o => o.Items)
            .Where(o => o.StoreId == storeId)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();
            
        return View(orders);
    }

    [HttpGet]
    public async Task<IActionResult> Create()
    {
        var storeId = GetCurrentStoreId();
        var products = await Db.Products.Where(p => p.StoreId == storeId && p.IsActive).ToListAsync();
        var customers = await Db.Customers.Where(c => c.StoreId == storeId).ToListAsync();

        var model = new OrderFormViewModel
        {
            AvailableProducts = products.Select(p => new SelectListItem { Value = p.Id.ToString(), Text = $"{p.Name} (৳{p.SellingPrice} - Stock: {p.StockQuantity})" }),
            AvailableCustomers = customers.Select(c => new SelectListItem { Value = c.Id.ToString(), Text = c.Name })
        };
        
        return View(model);
    }

    [HttpPost]
    public async Task<IActionResult> Create(OrderFormViewModel model)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == Guid.Empty) return RedirectToAction("Login", "Auth");

        if (!model.Items.Any() || model.Items.All(i => i.ProductId == Guid.Empty))
        {
            ModelState.AddModelError("", "Please add at least one product to the order.");
        }

        if (ModelState.IsValid)
        {
            using var transaction = await Db.Database.BeginTransactionAsync();
            try
            {
                var order = new Order
                {
                    StoreId = storeId,
                    CustomerId = model.CustomerId,
                    Source = model.Source,
                    DeliveryCharge = model.DeliveryCharge,
                    Discount = model.Discount,
                    Notes = model.Notes,
                    Status = "completed",
                    OrderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}"
                };

                decimal subtotal = 0;

                foreach (var item in model.Items.Where(i => i.ProductId != Guid.Empty && i.Quantity > 0))
                {
                    var product = await Db.Products
                        .FirstOrDefaultAsync(p => p.Id == item.ProductId && p.StoreId == storeId);
                    
                    if (product == null)
                    {
                        ModelState.AddModelError("", $"Product not found in your store.");
                        await transaction.RollbackAsync();
                        return await RepopulateAndReturn(model, storeId);
                    }

                    if (product.StockQuantity < item.Quantity)
                    {
                        ModelState.AddModelError("", $"Insufficient stock for {product.Name}. Available: {product.StockQuantity}, requested: {item.Quantity}.");
                        await transaction.RollbackAsync();
                        return await RepopulateAndReturn(model, storeId);
                    }

                    var orderItem = new OrderItem
                    {
                        ProductId = product.Id,
                        ProductName = product.Name,
                        UnitPrice = product.SellingPrice,
                        CostPrice = product.CostPrice,
                        Quantity = item.Quantity
                    };
                    order.Items.Add(orderItem);
                    subtotal += (product.SellingPrice * item.Quantity);
                    
                    product.StockQuantity -= item.Quantity;
                }

                if (model.Discount > subtotal + model.DeliveryCharge)
                {
                    ModelState.AddModelError("", "Discount cannot exceed the order total.");
                    await transaction.RollbackAsync();
                    return await RepopulateAndReturn(model, storeId);
                }

                order.Total = subtotal + model.DeliveryCharge - model.Discount;

                Db.Orders.Add(order);
                await Db.SaveChangesAsync();
                await transaction.CommitAsync();

                return RedirectToAction(nameof(Index));
            }
            catch
            {
                await transaction.RollbackAsync();
                ModelState.AddModelError("", "An error occurred while creating the order.");
            }
        }

        return await RepopulateAndReturn(model, storeId);
    }

    private async Task<IActionResult> RepopulateAndReturn(OrderFormViewModel model, Guid storeId)
    {
        var products = await Db.Products.Where(p => p.StoreId == storeId && p.IsActive).ToListAsync();
        var customers = await Db.Customers.Where(c => c.StoreId == storeId).ToListAsync();
        model.AvailableProducts = products.Select(p => new SelectListItem { Value = p.Id.ToString(), Text = $"{p.Name} (৳{p.SellingPrice})" });
        model.AvailableCustomers = customers.Select(c => new SelectListItem { Value = c.Id.ToString(), Text = c.Name });
        return View(model);
    }
}
