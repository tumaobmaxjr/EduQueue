using EduQueue.Domain.Entities;

namespace EduQueue.Domain.Interfaces
{
    public interface IWindowRepository
    {
        Task<Window?> GetByIdAsync(Guid id);
        Task<Window?> GetByCodeAsync(string code);
        Task<IEnumerable<Window>> GetAllAsync();
        Task<IEnumerable<Window>> GetActiveAsync();
        Task<Window> CreateAsync(Window window);
        Task UpdateAsync(Window window);
        Task DeleteAsync(Guid id);
    }
}
