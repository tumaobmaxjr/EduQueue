using EduQueue.Application.DTOs;
using EduQueue.Domain.Entities;

namespace EduQueue.Application.Interfaces
{
    public interface ITicketService
    {
        Task<Ticket> CreateTicketAsync(CreateTicketDto dto);
        Task<TicketDto?> GetTicketByIdAsync(Guid id);
        Task<IEnumerable<TicketDto>> GetAllTicketsAsync();
        Task<IEnumerable<TicketDto>> GetTicketsbyWindowAsync(Guid windowId);
        Task<TicketDto> CallNextTicketAsync(Guid windowId, Guid officerId);
        Task CompleteTicketAsync(Guid ticketId);
        Task MarkNoShowAsync(Guid ticketId);
        Task TransferTicketAsync(Guid ticketId, Guid targetWindowId);
    }
}
