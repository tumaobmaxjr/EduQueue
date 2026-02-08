using EduQueue.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduQueue.Infrastructure.Data.Configurations
{
    public class WindowConfiguration : IEntityTypeConfiguration<Window>
    {
        public void Configure(EntityTypeBuilder<Window> builder)
        {
            builder.HasKey(w => w.Id);

            builder.Property(w => w.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(w => w.Description)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(w => w.Location)
                .HasMaxLength(200);

            builder.Property(w => w.UpdatedAt)
                .IsRequired(false);

            builder.HasIndex(w => w.IsActive);

            // Window has many Tickets
            builder.HasMany(w => w.Tickets)
                .WithOne(t => t.Window)
                .HasForeignKey(t => t.WindowId);
        }
    }
}
