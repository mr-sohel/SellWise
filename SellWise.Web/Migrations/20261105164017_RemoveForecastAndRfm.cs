using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SellWise.Web.Migrations
{
    /// <inheritdoc />
    public partial class RemoveForecastAndRfm : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Forecasts");

            migrationBuilder.DropColumn(
                name: "FrequencyScore",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "MonetaryScore",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "RecencyScore",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "RfmSegment",
                table: "Customers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FrequencyScore",
                table: "Customers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MonetaryScore",
                table: "Customers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RecencyScore",
                table: "Customers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "RfmSegment",
                table: "Customers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "Forecasts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StoreId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LowerBound = table.Column<double>(type: "float", nullable: false),
                    ModelUsed = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PredictedDemand = table.Column<double>(type: "float", nullable: false),
                    TargetDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpperBound = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Forecasts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Forecasts_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Forecasts_Stores_StoreId",
                        column: x => x.StoreId,
                        principalTable: "Stores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Forecasts_ProductId",
                table: "Forecasts",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Forecasts_StoreId",
                table: "Forecasts",
                column: "StoreId");

            migrationBuilder.CreateIndex(
                name: "IX_Forecasts_StoreId_ProductId_TargetDate",
                table: "Forecasts",
                columns: new[] { "StoreId", "ProductId", "TargetDate" },
                unique: true);
        }
    }
}
