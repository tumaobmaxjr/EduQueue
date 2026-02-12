using EduQueue.Domain.Entities;

namespace EduQueue.Domain.Interfaces
{
    public interface IPurposeRepository
    {
        Task<Purpose?> GetByIdAsync(Guid id);
        Task<IEnumerable<Purpose>> GetAllAsync();
        Task<IEnumerable<Purpose>> GetActiveAsync();
        Task<IEnumerable<Purpose>> GetByWindowIdAsync(Guid windowId);     // Get purposes for specific window
        Task<Purpose> CreateAsync(Purpose purpose);
        Task UpdateAsync(Purpose purpose);
        Task DeleteAsync(Guid id);
    }
}
