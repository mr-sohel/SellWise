using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SellWise.Web.Data;
using SellWise.Web.ViewModels.Report;
using System.Linq;
using System.Threading.Tasks;
using System;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace SellWise.Web.Controllers;

[Authorize]
public class ReportController : BaseController
{
    public ReportController(AppDbContext db) : base(db)
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task<IActionResult> Index()
    {
        var storeId = GetCurrentStoreId();
        if (storeId == System.Guid.Empty) return RedirectToAction("Login", "Auth");

        var totalOrders = await Db.Orders.Where(o => o.StoreId == storeId).CountAsync();
        var totalRevenue = await Db.Orders.Where(o => o.StoreId == storeId).SumAsync(o => o.Total);

        var vm = new ReportViewModel
        {
            TotalOrders = totalOrders,
            TotalRevenue = totalRevenue
        };

        return View(vm);
    }

    [HttpPost]
    public async Task<IActionResult> ExportPdf(int days = 30)
    {
        var storeId = GetCurrentStoreId();
        if (storeId == System.Guid.Empty) return RedirectToAction("Login", "Auth");
        if (await IsEmployeeAsync(storeId))
        {
            TempData["ErrorMessage"] = "Employees are not permitted to generate PDF reports.";
            return RedirectToAction(nameof(Index));
        }

        var startDate = DateTime.UtcNow.AddDays(-days);

        var orders = await Db.Orders
            .Include(o => o.Customer)
            .Where(o => o.StoreId == storeId && o.OrderDate >= startDate)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();

        var totalOrders = orders.Count;
        var totalRevenue = orders.Sum(o => o.Total);

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header().Element(ComposeHeader);
                page.Content().Element(ComposeContent);
                page.Footer().Element(ComposeFooter);

                void ComposeHeader(IContainer headerContainer)
                {
                    headerContainer.Row(row =>
                    {
                        row.RelativeItem().Column(column =>
                        {
                            column.Item().Text($"SellWise Sales Report").FontSize(20).SemiBold().FontColor(Colors.Blue.Darken2);
                            column.Item().Text($"Period: Last {days} Days ({startDate:MMM dd, yyyy} - {DateTime.UtcNow:MMM dd, yyyy})");
                        });
                        row.ConstantItem(100).AlignRight().Text($"Generated: {DateTime.Now:d}");
                    });
                }

                void ComposeContent(IContainer contentContainer)
                {
                    contentContainer.PaddingVertical(1, Unit.Centimetre).Column(column =>
                    {
                        column.Spacing(20);

                        column.Item().Row(row =>
                        {
                            row.RelativeItem().Text($"Total Orders: {totalOrders}").FontSize(14).SemiBold();
                            row.RelativeItem().AlignRight().Text($"Total Revenue: ৳{totalRevenue:N0}").FontSize(14).SemiBold();
                        });

                        column.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

                        column.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(120);
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                            });

                            table.Header(header =>
                            {
                                header.Cell().Text("Date").SemiBold();
                                header.Cell().Text("Customer Name").SemiBold();
                                header.Cell().Text("Status").SemiBold();
                                header.Cell().AlignRight().Text("Total").SemiBold();

                                header.Cell().ColumnSpan(4)
                                    .PaddingTop(5).BorderBottom(1).BorderColor(Colors.Black);
                            });

                            foreach (var order in orders.Take(50)) // Show up to 50 recent orders
                            {
                                table.Cell().PaddingVertical(5).Text(order.OrderDate.ToLocalTime().ToString("MMM dd, yyyy HH:mm"));
                                table.Cell().PaddingVertical(5).Text(order.Customer?.Name ?? "Walk-in");
                                table.Cell().PaddingVertical(5).Text(order.Status);
                                table.Cell().PaddingVertical(5).AlignRight().Text($"৳{order.Total:N0}");
                            }
                        });

                        if (totalOrders > 50)
                        {
                            column.Item().Text($"* Showing top 50 recent orders out of {totalOrders}.").FontSize(9).FontColor(Colors.Grey.Medium);
                        }
                    });
                }

                void ComposeFooter(IContainer footerContainer)
                {
                    footerContainer.AlignCenter().Text(x =>
                    {
                        x.Span("Page ");
                        x.CurrentPageNumber();
                        x.Span(" of ");
                        x.TotalPages();
                    });
                }
            });
        });

        var pdfBytes = document.GeneratePdf();
        return File(pdfBytes, "application/pdf", $"SellWise_Report_{days}Days.pdf");
    }
}
