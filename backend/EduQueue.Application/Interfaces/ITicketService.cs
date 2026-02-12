using EduQueue.Application.DTOs;

namespace EduQueue.Application.Interfaces
{
    public interface ITicketService
    {
        Task<TicketDto> CreateTicketAsync(CreateTicketDto dto);
        Task<TicketDto?> GetTicketByIdAsync(Guid id);
        Task<IEnumerable<TicketDto>> GetAllTicketsAsync();
        Task<IEnumerable<TicketDto>> GetTicketsByWindowAsync(Guid windowId);
        Task<TicketDto> CallNextTicketAsync(Guid windowId, Guid officerId);
        Task CompleteTicketAsync(Guid ticketId);
        Task MarkNoShowAsync(Guid ticketId);
        Task TransferTicketAsync(Guid ticketId, Guid targetWindowId);
    }
}
