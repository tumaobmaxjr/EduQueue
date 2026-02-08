namespace EduQueue.Application.DTOs
{
    public class TicketDto
    {
        public Guid Id { get; set; }
        public string TicketNumber { get; set; } = string.Empty;
        public Guid WindowId { get; set; }
        public string WindowName { get; set; } = string.Empty;
        public bool IsPriority { get; set; }
        public int Status { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string? ClientEmail { get; set; }
        public string? StudentId { get; set; }
        public string? Course { get; set; }
        public string? YearLevel { get; set; }
        public string? Department { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CalledAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int QueuePosition { get; set; }
    }
}
