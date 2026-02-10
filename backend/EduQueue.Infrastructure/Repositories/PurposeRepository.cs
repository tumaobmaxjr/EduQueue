using EduQueue.Domain.Entities;
using EduQueue.Domain.Interfaces;
using EduQueue.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EduQueue.Infrastructure.Repositories
{
    public class PurposeRepository : IPurposeRepository
    {
        private readonly ApplicationDbContext _context;

        public PurposeRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Purpose?> GetByIdAsync(Guid id)
        {
            return await _context.Purposes
                .Include(p => p.Window)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Purpose>> GetAllAsync()
        {
            return await _context.Purposes
                .Include(p => p.Window)
                .ToListAsync();
        }

        public async Task<IEnumerable<Purpose>> GetActiveAsync()
        {
            return await _context.Purposes
                .Where(p => p.IsActive)
                .Include(p => p.Window)
                .ToListAsync();
        }

        public async Task<IEnumerable<Purpose>> GetByWindowIdAsync(Guid id)
        {
            return await _context.Purposes
                .Where(p => p.WindowId == id)
                .Include(p => p.Window)
                .ToListAsync();
        }

        public async Task<Purpose> CreateAsync(Purpose purpose)
        {
            _context.Add(purpose);
            await _context.SaveChangesAsync();
            return purpose;
        }

        public async Task UpdateAsync(Purpose purpose)
        {
            _context.Update(purpose);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var purpose = await _context.Purposes.FindAsync(id);
            if (purpose != null)
            {
                _context.Remove(purpose);
                await _context.SaveChangesAsync();
            }
        }
    }
}
