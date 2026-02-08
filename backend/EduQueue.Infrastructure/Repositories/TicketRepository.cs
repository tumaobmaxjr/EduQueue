using EduQueue.Domain.Entities;
using EduQueue.Domain.Interfaces;
using EduQueue.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EduQueue.Infrastructure.Repositories
{
    public class TicketRepository : ITicketRepository
    {
        private readonly ApplicationDbContext _context;

        public TicketRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Ticket?> GetByIdAsync(Guid id)
        {
            return await _context.Tickets
                .Include(t => t.Window)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<IEnumerable<Ticket>> GetAllAsync()
        {
            return await _context.Tickets
                .Include(t => t.Window)
                .ToListAsync();
        }

        public async Task<IEnumerable<Ticket>> GetByWindowIdAsync(Guid windowId)
        {
            return await _context.Tickets
                .Include(t => t.Window)
                .Where(t => t.WindowId == windowId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Ticket>> GetByStatusAsync(TicketStatus status)
        {
            return await _context.Tickets
                .Where(t => t.Status == status)
                .ToListAsync();
        }

        public async Task<Ticket> CreateAsync(Ticket ticket)
        {
            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();
            return ticket;
        }

        public async Task UpdateAsync(Ticket ticket)
        {
            _context.Tickets.Update(ticket);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket != null)
            {
                _context.Tickets.Remove(ticket);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<int> GetCountByWindowAndDateAsync(Guid windowId, DateTime date)
        {
            return await _context.Tickets
                .CountAsync(t => t.WindowId == windowId &&
                    t.CreatedAt.Date == date.Date);
        }
    }
}
