namespace EduQueue.Application.DTOs
{
    public class TicketPreviewResponseDto
    {
        public int CurrentPosition { get; set; }
        public int TotalQueueLength { get; set; }
        public List<TicketPreviewItemDto> NextTickets { get; set; } = new();
    }
}
