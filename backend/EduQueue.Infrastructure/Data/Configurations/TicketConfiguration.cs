using EduQueue.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduQueue.Infrastructure.Data.Configurations
{
    public class TicketConfiguration : IEntityTypeConfiguration<Ticket>
    {
        public void Configure(EntityTypeBuilder<Ticket> builder)
        {
            builder.HasKey(t => t.Id);

            builder.Property(t => t.TicketNumber)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(t => t.ClientName)
                .IsRequired()
                .HasMaxLength(100);

            builder.HasIndex(t => t.TicketNumber);
            builder.HasIndex(t => new { t.WindowId, t.Status });

            // Ticket belongs to one Window
            builder.HasOne(t => t.Window)
                .WithMany(w => w.Tickets)
                .HasForeignKey(t => t.WindowId)
                .OnDelete(DeleteBehavior.Restrict);  // Prevent deleting window if tickets exist
        }
    }
}
