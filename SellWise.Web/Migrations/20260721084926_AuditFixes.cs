using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SellWise.Web.Migrations
{
    /// <inheritdoc />
    public partial class AuditFixes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Products_StoreId",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Orders_StoreId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Expenses_StoreId",
                table: "Expenses");

            migrationBuilder.DropIndex(
                name: "IX_Alerts_StoreId",
                table: "Alerts");

            migrationBuilder.CreateIndex(
                name: "IX_Products_StoreId_IsActive",
                table: "Products",
                columns: new[] { "StoreId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_StoreId_OrderDate",
                table: "Orders",
                columns: new[] { "StoreId", "OrderDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_StoreId_ExpenseDate",
                table: "Expenses",
                columns: new[] { "StoreId", "ExpenseDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Alerts_StoreId_IsRead",
                table: "Alerts",
                columns: new[] { "StoreId", "IsRead" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Products_StoreId_IsActive",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Orders_StoreId_OrderDate",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Expenses_StoreId_ExpenseDate",
                table: "Expenses");

            migrationBuilder.DropIndex(
                name: "IX_Alerts_StoreId_IsRead",
                table: "Alerts");

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StoreId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NameBn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Categories_Stores_StoreId",
                        column: x => x.StoreId,
                        principalTable: "Stores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Products_StoreId",
                table: "Products",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_StoreId",
                table: "Orders",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_StoreId",
                table: "Expenses",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_Alerts_StoreId",
                table: "Alerts",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_StoreId",
                table: "Categories",
                column: "StoreId");
        }
    }
}
