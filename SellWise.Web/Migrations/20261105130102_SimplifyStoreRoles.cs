using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SellWise.Web.Migrations
{
    /// <inheritdoc />
    public partial class SimplifyStoreRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Roles were reduced from owner/manager/employee to owner/staff.
            migrationBuilder.Sql("UPDATE StoreMembers SET Role = 'staff' WHERE Role <> 'owner';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE StoreMembers SET Role = 'employee' WHERE Role = 'staff';");
        }
    }
}
