using EduQueue.Application.DTOs;
using EduQueue.Domain.Entities;

namespace EduQueue.Application.Interfaces
{
    public interface ITicketService
    {
        Task<Ticket> CreateTicketAsync(CreateTicketDto dto);
        Task<Ticket?> GetTicketByIdAsync(Guid id);
        Task<IEnumerable<Ticket>> GetAllTicketsAsync();
        Task<IEnumerable<Ticket>> GetTicketsbyWindowAsync(Guid windowId);
        Task<Ticket> CallNextTicketAsync(Guid windowId, Guid officerId);
        Task CompleteTicketAsync(Guid ticketId);
        Task MarkNoShowAsync(Guid ticketId);
        Task TransferTicketAsync(Guid ticketId, Guid targetWindowId);
    }
}
