using EduQueue.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduQueue.Infrastructure.Data.Configurations
{
    public class PurposeConfiguration : IEntityTypeConfiguration<Purpose>
    {
        public void Configure(EntityTypeBuilder<Purpose> builder)
        {
            builder.HasKey(p => p.Id);

            builder.Property(p => p.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(p => p.Description)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(p => p.UpdatedAt)
                .IsRequired(false);

            builder.HasIndex(p => p.IsActive);
            builder.HasIndex(p => p.WindowId);

            // Purpose belongs to one Window
            builder.HasOne(p => p.Window)
                .WithMany(w => w.Purposes)  // Window has many Purposes
                .HasForeignKey(p => p.WindowId)
                .OnDelete(DeleteBehavior.Restrict);  // Can't delete window if purposes exist
        }
    }
}
