using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduQueue.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWindowEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Windows",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Windows", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Windows_IsActive",
                table: "Windows",
                column: "IsActive");

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Windows_WindowId",
                table: "Tickets",
                column: "WindowId",
                principalTable: "Windows",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Windows_WindowId",
                table: "Tickets");

            migrationBuilder.DropTable(
                name: "Windows");
        }
    }
}
