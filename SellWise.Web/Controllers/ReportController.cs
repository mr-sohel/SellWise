using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using SellWise.Web.Authorization;
using SellWise.Web.Data;
using SellWise.Web.ViewModels.Report;

namespace SellWise.Web.Controllers;

[OwnerOnly]
public class ReportController : BaseController
{
    private static readonly int[] AllowedPeriods = { 7, 30, 90, 365 };
    private const int MaxRowsInPdf = 50;

    public ReportController(AppDbContext db) : base(db)
    {
    }

    public async Task<IActionResult> Index()
    {
        var since = DateTime.UtcNow.AddDays(-30);
        var sales = Db.Orders.Where(o => o.StoreId == StoreId && o.OrderDate >= since
            && o.Status != "cancelled" && o.Status != "returned");

        return View(new ReportViewModel
        {
            TotalOrders = await sales.CountAsync(),
            TotalRevenue = await sales.SumAsync(o => o.Total)
        });
    }

    [HttpPost]
    public async Task<IActionResult> ExportPdf(int days = 30)
    {
        if (!AllowedPeriods.Contains(days))
            days = 30;

        var startDate = DateTime.UtcNow.AddDays(-days);
        var sales = Db.Orders.Where(o => o.StoreId == StoreId && o.OrderDate >= startDate
            && o.Status != "cancelled" && o.Status != "returned");

        var totalOrders = await sales.CountAsync();
        var totalRevenue = await sales.SumAsync(o => o.Total);
        var orders = await sales
            .Include(o => o.Customer)
            .OrderByDescending(o => o.OrderDate)
            .Take(MaxRowsInPdf)
            .ToListAsync();

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
                        row.ConstantItem(100).AlignRight().Text($"Generated: {DateTime.UtcNow:yyyy-MM-dd} (UTC)");
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

                            foreach (var order in orders)
                            {
                                table.Cell().PaddingVertical(5).Text(order.OrderDate.ToString("MMM dd, yyyy HH:mm"));
                                table.Cell().PaddingVertical(5).Text(order.Customer?.Name ?? "Walk-in");
                                table.Cell().PaddingVertical(5).Text(order.Status);
                                table.Cell().PaddingVertical(5).AlignRight().Text($"৳{order.Total:N0}");
                            }
                        });

                        if (totalOrders > MaxRowsInPdf)
                        {
                            column.Item().Text($"* Showing the {MaxRowsInPdf} most recent orders out of {totalOrders}.").FontSize(9).FontColor(Colors.Grey.Medium);
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
