using EduQueue.Domain.Entities;

namespace EduQueue.Domain.Interfaces
{
    public interface ITicketRepository
    {
        Task<Ticket?> GetByIdAsync(Guid id);
        Task<IEnumerable<Ticket>> GetAllAsync();
        Task<IEnumerable<Ticket>> GetByWindowIdAsync(Guid windowId);
        Task<IEnumerable<Ticket>> GetByStatusAsync(TicketStatus status);
        Task<Ticket> CreateAsync(Ticket ticket);
        Task UpdateAsync(Ticket ticket);
        Task DeleteAsync(Guid id);
        Task<int> GetCountByWindowAndDateAsync(Guid windowId, DateTime date);
    }
}
