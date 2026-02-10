using EduQueue.Application.DTOs;
using EduQueue.Application.Interfaces;
using EduQueue.Domain.Entities;
using EduQueue.Domain.Interfaces;

namespace EduQueue.Application.Services
{
    public class TicketService : ITicketService
    {
        private readonly ITicketRepository _ticketRepository;
        private readonly IPurposeRepository _purposeRepository;
        private readonly IWindowRepository _windowRepository;

        public TicketService(
            ITicketRepository ticketRepository,
            IPurposeRepository purposeRepository,
            IWindowRepository windowReository)
        {
            _ticketRepository = ticketRepository;
            _purposeRepository = purposeRepository;
            _windowRepository = windowReository;
        }

        public async Task<TicketDto> CreateTicketAsync(CreateTicketDto dto)
        {
            // Get window to access Code
            var window = await _windowRepository.GetByIdAsync(dto.WindowId);
            if (window == null)
                throw new InvalidOperationException("Window not found");

            // Validate purpose belongs to window
            var purpose = await _purposeRepository.GetByIdAsync(dto.PurposeId);
            if (purpose == null)
                throw new InvalidOperationException("Purpose not found");
            if (purpose.WindowId != dto.WindowId)
                throw new InvalidOperationException("Purpose does not belong to this window");
            if (!purpose.IsActive)
                throw new InvalidOperationException("This purpose is currently not available");

            var ticketCount = await _ticketRepository.GetCountByWindowAndDateAsync(dto.WindowId, DateTime.UtcNow);

            var prefix = dto.IsPriority ? "P" : "R";
            var sequenceNumber = ticketCount + 1;
            var ticketNumber = $"{prefix}-{window.Code}-{sequenceNumber:D3}";

            var ticket = new Ticket
            {
                Id = Guid.NewGuid(),
                TicketNumber = ticketNumber,
                WindowId = dto.WindowId,
                PurposeId = dto.PurposeId,
                IsPriority = dto.IsPriority,
                Status = TicketStatus.Queued,
                ClientName = dto.ClientName,
                ClientEmail = dto.ClientEmail,
                StudentId = dto.StudentId,
                Course = dto.Course,
                YearLevel = dto.YearLevel,
                Department = dto.Department,
                CreatedAt = DateTime.UtcNow,
                QueuePosition = sequenceNumber
            };

            var createdTicket = await _ticketRepository.CreateAsync(ticket);
            return MapToDto(createdTicket);
        }

        public async Task<TicketDto?> GetTicketByIdAsync(Guid id)
        {
            var ticket = await _ticketRepository.GetByIdAsync(id);
            return ticket == null ? null : MapToDto(ticket);
        }

        public async Task<IEnumerable<TicketDto>> GetAllTicketsAsync()
        {
            var tickets = await _ticketRepository.GetAllAsync();
            return tickets.Select(MapToDto);
        }

        public async Task<IEnumerable<TicketDto>> GetTicketsbyWindowAsync(Guid windowId)
        {
            var tickets = await _ticketRepository.GetByWindowIdAsync(windowId);
            return tickets.Select(MapToDto);
        }

        public async Task<TicketDto> CallNextTicketAsync(Guid windowId, Guid officerId)
        {
            var tickets = await _ticketRepository.GetByWindowIdAsync(windowId);

            // Get next eligible ticket (Queued or NoShow can be recalled)
            var nextTicket = tickets
                .Where(t => t.Status == TicketStatus.Queued || t.Status == TicketStatus.NoShow)
                .OrderBy(t => t.CreatedAt)
                .FirstOrDefault();

            if (nextTicket == null)
            {
                throw new InvalidOperationException("No tickets in queue");
            }

            nextTicket.Status = TicketStatus.Called;
            nextTicket.CalledAt = DateTime.UtcNow;
            nextTicket.ServedByOfficerId = officerId;

            await _ticketRepository.UpdateAsync(nextTicket);
            return MapToDto(nextTicket);
        }

        public async Task CompleteTicketAsync(Guid ticketId)
        {
            var ticket = await _ticketRepository.GetByIdAsync(ticketId);
            if (ticket == null) throw new InvalidOperationException("Ticket not found");

            if (ticket.Status != TicketStatus.Called && ticket.Status != TicketStatus.Serving)
            {
                throw new InvalidOperationException($"Cannot complete ticket with status '{ticket.Status}'. Only tickets that are Called or Serving can be completed.");
            }

            ticket.Status = TicketStatus.Completed;
            ticket.CompletedAt = DateTime.UtcNow;

            await _ticketRepository.UpdateAsync(ticket);
        }

        public async Task MarkNoShowAsync(Guid ticketId)
        {
            var ticket = await _ticketRepository.GetByIdAsync(ticketId);
            if (ticket == null) throw new InvalidOperationException("Ticket not found");

            if (ticket.Status != TicketStatus.Called)
            {
                throw new InvalidOperationException($"Cannot mark ticket as NoShow with status '{ticket.Status}'. Only tickets that are Called can be marked as NoShow.");
            }

            ticket.Status = TicketStatus.NoShow;
            ticket.SkipCount++;

            await _ticketRepository.UpdateAsync(ticket);
        }

        public async Task TransferTicketAsync(Guid ticketId, Guid targetWindowId)
        {
            var ticket = await _ticketRepository.GetByIdAsync(ticketId);
            if (ticket == null) throw new InvalidOperationException("Ticket not found");

            // Status validation - can only transfer active tickets
            if (ticket.Status != TicketStatus.Queued && ticket.Status != TicketStatus.Called)
            {
                throw new InvalidOperationException($"Cannot transfer ticket with status '{ticket.Status}'. Only tickets that are Queued or Called can be transferred.");
            }

            ticket.Status = TicketStatus.Transferred;
            ticket.WindowId = targetWindowId;

            await _ticketRepository.UpdateAsync(ticket);
        }

        private TicketDto MapToDto(Ticket ticket)
        {
            return new TicketDto
            {
                Id = ticket.Id,
                TicketNumber = ticket.TicketNumber,
                WindowId = ticket.WindowId,
                WindowName = ticket.Window?.Name ?? "Unknown",  // Safe navigation
                PurposeId = ticket.PurposeId,
                PurposeName = ticket.Purpose?.Name ?? "Unknown",
                IsPriority = ticket.IsPriority,
                Status = (int)ticket.Status,
                ClientName = ticket.ClientName,
                ClientEmail = ticket.ClientEmail,
                StudentId = ticket.StudentId,
                Course = ticket.Course,
                YearLevel = ticket.YearLevel,
                Department = ticket.Department,
                CreatedAt = ticket.CreatedAt,
                CalledAt = ticket.CalledAt,
                CompletedAt = ticket.CompletedAt,
                QueuePosition = ticket.QueuePosition
            };
        }
    }
}
