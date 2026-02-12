namespace EduQueue.Application.DTOs
{
    public class TicketPreviewItemDto
    {
        public int Position { get; set; }
        public string TicketNumber { get; set; } = string.Empty;
        public bool IsPriority { get; set; }
    }
}
