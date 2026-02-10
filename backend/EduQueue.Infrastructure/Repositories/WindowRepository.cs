using EduQueue.Domain.Entities;
using EduQueue.Domain.Interfaces;
using EduQueue.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EduQueue.Infrastructure.Repositories
{
    public class WindowRepository : IWindowRepository
    {
        private readonly ApplicationDbContext _context;

        public WindowRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Window?> GetByIdAsync(Guid id)
        {
            return await _context.Windows
                .Include(w => w.Tickets)
                .FirstOrDefaultAsync(w => w.Id == id);
        }

        public async Task<Window?> GetByCodeAsync(string code)
        {
            return await _context.Windows
                .FirstOrDefaultAsync(w => w.Code == code);
        }

        public async Task<IEnumerable<Window>> GetAllAsync()
        {
            return await _context.Windows
                .Include(w => w.Tickets)
                .ToListAsync();
        }

        public async Task<IEnumerable<Window>> GetActiveAsync()
        {
            return await _context.Windows
                .Include(w => w.Tickets)
                .Where(w => w.IsActive)
                .ToListAsync();
        }

        public async Task<Window> CreateAsync(Window window)
        {
            _context.Windows.Add(window);
            await _context.SaveChangesAsync();
            return window;
        }

        public async Task UpdateAsync(Window window)
        {
            _context.Windows.Update(window);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var window = await _context.Windows.FindAsync(id);
            if (window != null)
            {
                _context.Windows.Remove(window);
                await _context.SaveChangesAsync();
            }
        }
    }
}
