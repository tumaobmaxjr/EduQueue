namespace EduQueue.Application.DTOs
{
    public class CreatePurposeDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid WindowId { get; set; }
    }
}
