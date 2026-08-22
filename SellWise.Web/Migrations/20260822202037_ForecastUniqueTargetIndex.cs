using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SellWise.Web.Migrations
{
    /// <inheritdoc />
    public partial class ForecastUniqueTargetIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Remove duplicate cache rows (keep newest per store/product/target date)
            // so the unique index below can be created safely.
            migrationBuilder.Sql(@"
DELETE f
FROM Forecasts f
INNER JOIN (
    SELECT Id, ROW_NUMBER() OVER (PARTITION BY StoreId, ProductId, TargetDate ORDER BY CreatedAt DESC) AS rn
    FROM Forecasts
) d ON f.Id = d.Id AND d.rn > 1;");

            migrationBuilder.CreateIndex(
                name: "IX_Forecasts_StoreId_ProductId_TargetDate",
                table: "Forecasts",
                columns: new[] { "StoreId", "ProductId", "TargetDate" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Forecasts_StoreId_ProductId_TargetDate",
                table: "Forecasts");
        }
    }
}
