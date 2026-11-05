using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SellWise.Web.Migrations
{
    /// <inheritdoc />
    public partial class ConcurrencySafeguards : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "Products",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "OrderNumber",
                table: "Orders",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<Guid>(
                name: "IdempotencyKey",
                table: "Orders",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "Alerts",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            // Existing databases may already contain duplicates; clean them up so the unique
            // indexes below can be created.
            migrationBuilder.Sql(@"
DELETE a FROM Alerts a
INNER JOIN (
    SELECT Id, ROW_NUMBER() OVER (PARTITION BY StoreId, ProductId, Type ORDER BY CreatedAt DESC) AS rn
    FROM Alerts
) d ON a.Id = d.Id AND d.rn > 1;");

            migrationBuilder.Sql(@"
UPDATE o SET OrderNumber = o.OrderNumber + '-' + CAST(d.rn AS nvarchar(10))
FROM Orders o
INNER JOIN (
    SELECT Id, ROW_NUMBER() OVER (PARTITION BY StoreId, OrderNumber ORDER BY CreatedAt) AS rn
    FROM Orders
) d ON o.Id = d.Id AND d.rn > 1;");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_StoreId_IdempotencyKey",
                table: "Orders",
                columns: new[] { "StoreId", "IdempotencyKey" },
                unique: true,
                filter: "[IdempotencyKey] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_StoreId_OrderNumber",
                table: "Orders",
                columns: new[] { "StoreId", "OrderNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Alerts_StoreId_ProductId_Type",
                table: "Alerts",
                columns: new[] { "StoreId", "ProductId", "Type" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Orders_StoreId_IdempotencyKey",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_StoreId_OrderNumber",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Alerts_StoreId_ProductId_Type",
                table: "Alerts");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "IdempotencyKey",
                table: "Orders");

            migrationBuilder.AlterColumn<string>(
                name: "OrderNumber",
                table: "Orders",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "Alerts",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);
        }
    }
}
