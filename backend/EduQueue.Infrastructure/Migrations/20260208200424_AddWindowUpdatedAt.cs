using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduQueue.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWindowUpdatedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Windows",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Windows");
        }
    }
}
