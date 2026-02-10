using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduQueue.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPurposeEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PurposeId",
                table: "Tickets",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "Purposes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    WindowId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Purposes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Purposes_Windows_WindowId",
                        column: x => x.WindowId,
                        principalTable: "Windows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_PurposeId",
                table: "Tickets",
                column: "PurposeId");

            migrationBuilder.CreateIndex(
                name: "IX_Purposes_IsActive",
                table: "Purposes",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Purposes_WindowId",
                table: "Purposes",
                column: "WindowId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Purposes_PurposeId",
                table: "Tickets",
                column: "PurposeId",
                principalTable: "Purposes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Purposes_PurposeId",
                table: "Tickets");

            migrationBuilder.DropTable(
                name: "Purposes");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_PurposeId",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "PurposeId",
                table: "Tickets");
        }
    }
}
