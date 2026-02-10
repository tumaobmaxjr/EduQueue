namespace EduQueue.Application.DTOs
{
    public class CreateTicketDto
    {
        public Guid WindowId { get; set; }
        public Guid PurposeId { get; set; }
        public bool IsPriority { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string? ClientEmail { get; set; }
        public string? StudentId { get; set; }
        public string? Course { get; set; }
        public string? YearLevel { get; set; }
        public string? Department { get; set; }
    }
}
