using SellWise.Web.Services;
using SellWise.Web.ViewModels.Product;

namespace SellWise.Tests.Unit;

public class ProductServiceTests : IDisposable
{
    private readonly TestDb _db = new();

    public void Dispose() => _db.Dispose();

    private static ProductFormViewModel EditForm(Guid id, int version, decimal price) => new()
    {
        Id = id, Version = version, Name = "Widget", Category = "General",
        CostPrice = 10, SellingPrice = price, LowStockThreshold = 5, Unit = "pcs"
    };

    [Fact]
    public async Task Update_WithAStaleVersion_ReportsAConflictInsteadOfOverwriting()
    {
        var store = _db.AddStore();
        var product = _db.AddProduct(store.Id, stock: 5);

        // Two owners open the edit form at version 0; the first one saves.
        var first = await new ProductService(_db.CreateContext()).UpdateProductAsync(store.Id, product.Id, EditForm(product.Id, 0, 150m));
        var second = await new ProductService(_db.CreateContext()).UpdateProductAsync(store.Id, product.Id, EditForm(product.Id, 0, 999m));

        Assert.Equal(UpdateResult.Updated, first);
        Assert.Equal(UpdateResult.Conflict, second);
        using var ctx = _db.CreateContext();
        Assert.Equal(150m, ctx.Products.Single().SellingPrice);
    }

    [Fact]
    public async Task Update_IsNotBlockedBySalesThatChangedStock()
    {
        var store = _db.AddStore();
        var product = _db.AddProduct(store.Id, stock: 5);
        var service = new ProductService(_db.CreateContext());
        await service.RestockProductAsync(store.Id, product.Id, 3);   // stock changes, version doesn't

        var result = await new ProductService(_db.CreateContext()).UpdateProductAsync(store.Id, product.Id, EditForm(product.Id, 0, 150m));

        Assert.Equal(UpdateResult.Updated, result);
        Assert.Equal(8, _db.StockOf(product.Id));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    [InlineData(ProductService.MaxRestockQuantity + 1)]
    public async Task Restock_RejectsOutOfRangeQuantities(int quantity)
    {
        var store = _db.AddStore();
        var product = _db.AddProduct(store.Id, stock: 5);

        var result = await new ProductService(_db.CreateContext()).RestockProductAsync(store.Id, product.Id, quantity);

        Assert.False(result.Success);
        Assert.Equal(5, _db.StockOf(product.Id));
    }

    [Fact]
    public async Task Restock_CannotPushStockPastTheCap()
    {
        var store = _db.AddStore();
        var product = _db.AddProduct(store.Id, stock: ProductService.MaxStock - 10);

        var result = await new ProductService(_db.CreateContext()).RestockProductAsync(store.Id, product.Id, 50);

        Assert.False(result.Success);
        Assert.Equal(ProductService.MaxStock - 10, _db.StockOf(product.Id));
    }
}
