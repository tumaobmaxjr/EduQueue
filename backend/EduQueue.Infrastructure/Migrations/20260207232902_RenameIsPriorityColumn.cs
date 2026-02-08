using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduQueue.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameIsPriorityColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "isPriority",
                table: "Tickets",
                newName: "IsPriority");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsPriority",
                table: "Tickets",
                newName: "isPriority");
        }
    }
}
