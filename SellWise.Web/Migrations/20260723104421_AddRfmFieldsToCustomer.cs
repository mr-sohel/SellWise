using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SellWise.Web.Migrations
{
    /// <inheritdoc />
    public partial class AddRfmFieldsToCustomer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FrequencyScore",
                table: "Customers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastOrderDate",
                table: "Customers",
                type: "datetime2",
                nullable: true);

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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FrequencyScore",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "LastOrderDate",
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
    }
}
