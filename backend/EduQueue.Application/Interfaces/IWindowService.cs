using EduQueue.Application.DTOs;

namespace EduQueue.Application.Interfaces
{
    public interface IWindowService
    {
        Task<WindowDto> CreateWindowAsync(CreateWindowDto dto);
        Task<WindowDto?> GetWindowByIdAsync(Guid id);
        Task<IEnumerable<WindowDto>> GetAllWindowsAsync();
        Task<IEnumerable<WindowDto>> GetActiveWindowsAsync();
        Task UpdateWindowAsync(Guid id, CreateWindowDto dto);
        Task DeleteWindowAsync(Guid id);
    }
}
