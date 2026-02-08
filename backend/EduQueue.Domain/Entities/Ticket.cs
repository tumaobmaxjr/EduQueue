namespace EduQueue.Domain.Entities
{
    public class Ticket
    {
        public Guid Id { get; set; }
        public string TicketNumber { get; set; } = string.Empty;
        public Guid WindowId { get; set; }
        public bool IsPriority { get; set; }
        public TicketStatus Status { get; set; } = TicketStatus.Queued;

        public string ClientName { get; set; } = string.Empty;
        public string? ClientEmail { get; set; }
        public string? StudentId { get; set; }
        public string? Course { get; set; }
        public string? YearLevel { get; set; }
        public string? Department { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CalledAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public Guid? ServedByOfficerId { get; set; }
        public int SkipCount { get; set; } = 0;                 // For tracking "not present" skips
        public int QueuePosition { get; set; }                  // Position in queue (for display)

        // Navigation Property
        public Window Window { get; set; } = null!;
    }

    public enum TicketStatus
    {
        Queued,         // 0. Waiting in line
        Called,         // 1. Officer called the number
        Serving,        // 2. Currently being served
        Completed,      // 3. Done successfully
        NoShow,         // 4. Client didn't show up
        Transferred     // 5. Moved to another window
    }
}
