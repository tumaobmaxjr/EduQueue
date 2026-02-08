using EduQueue.Application.DTOs;
using EduQueue.Domain.Entities;

namespace EduQueue.Application.Interfaces
{
    public interface IWindowService
    {
        Task<Window> CreateWindowAsync(CreateWindowDto dto);
        Task<WindowDto?> GetWindowByIdAsync(Guid id);
        Task<IEnumerable<WindowDto>> GetAllWindowsAsync();
        Task<IEnumerable<WindowDto>> GetActiveWindowsAsync();
        Task UpdateWindowAsync(Guid id, CreateWindowDto dto);
        Task DeleteWindowAsync(Guid id);
    }
}
