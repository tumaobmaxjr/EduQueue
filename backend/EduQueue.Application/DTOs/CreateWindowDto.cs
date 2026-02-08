namespace EduQueue.Application.DTOs
{
    public class CreateWindowDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Location { get; set; }
    }
}
