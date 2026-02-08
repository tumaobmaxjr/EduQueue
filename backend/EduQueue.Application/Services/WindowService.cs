using EduQueue.Application.DTOs;
using EduQueue.Application.Interfaces;
using EduQueue.Domain.Entities;
using EduQueue.Domain.Interfaces;

namespace EduQueue.Application.Services
{
    public class WindowService : IWindowService
    {
        private readonly IWindowRepository _windowRepository;

        public WindowService(IWindowRepository windowRepository)
        {
            _windowRepository = windowRepository;
        }

        public async Task<Window> CreateWindowAsync(CreateWindowDto dto)
        {
            var window = new Window
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Description = dto.Description,
                Location = dto.Location,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            return await _windowRepository.CreateAsync(window);
        }

        public async Task<WindowDto?> GetWindowByIdAsync(Guid id)
        {
            var window = await _windowRepository.GetByIdAsync(id);
            return window == null ? null : MapToDto(window);
        }

        public async Task<IEnumerable<WindowDto>> GetAllWindowsAsync()
        {
            var windows = await _windowRepository.GetAllAsync();
            return windows.Select(MapToDto);
        }

        public async Task<IEnumerable<WindowDto>> GetActiveWindowsAsync()
        {
            var windows = await _windowRepository.GetActiveAsync();
            return windows.Select(MapToDto);
        }

        public async Task UpdateWindowAsync(Guid id, CreateWindowDto dto)
        {
            var window = await _windowRepository.GetByIdAsync(id);
            if (window == null) throw new InvalidOperationException("Window not found");

            window.Name = dto.Name;
            window.Description = dto.Description;
            window.Location = dto.Location;
            window.UpdatedAt = DateTime.UtcNow;

            await _windowRepository.UpdateAsync(window);
        }

        public async Task DeleteWindowAsync(Guid id)
        {
            await _windowRepository.DeleteAsync(id);
        }

        private WindowDto MapToDto(Window window)
        {
            return new WindowDto
            {
                Id = window.Id,
                Name = window.Name,
                Description = window.Description,
                Location = window.Location,
                IsActive = window.IsActive,
                CreatedAt = window.CreatedAt,
                UpdatedAt = window.UpdatedAt,
                TicketCount = window.Tickets.Count
            };
        }
    }
}
