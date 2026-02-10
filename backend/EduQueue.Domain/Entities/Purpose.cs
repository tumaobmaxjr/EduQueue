namespace EduQueue.Domain.Entities
{
    public class Purpose
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;            // e.g., "Request Transcript of Records"
        public string Description { get; set; } = string.Empty;     // e.g., "Official TOR with registrar's seal"
        public Guid WindowId { get; set; }                          // Required: belongs to one window
        public Window Window { get; set; } = null!;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    }
}
