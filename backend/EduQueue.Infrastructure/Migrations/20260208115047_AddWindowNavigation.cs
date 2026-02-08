using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduQueue.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWindowNavigation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Windows_WindowId",
                table: "Tickets");

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Windows_WindowId",
                table: "Tickets",
                column: "WindowId",
                principalTable: "Windows",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Windows_WindowId",
                table: "Tickets");

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Windows_WindowId",
                table: "Tickets",
                column: "WindowId",
                principalTable: "Windows",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
