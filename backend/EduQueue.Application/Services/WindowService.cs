using System.ComponentModel.DataAnnotations;
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

        public async Task<WindowDto> CreateWindowAsync(CreateWindowDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Code))
                throw new ValidationException("Window code is required");

            dto.Code = dto.Code.ToUpper();

            // Check uniqueness
            var existing = await _windowRepository.GetByCodeAsync(dto.Code);
            if (existing != null)
                throw new InvalidOperationException($"Window code '{dto.Code}' already exists");

            var window = new Window
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Description = dto.Description,
                Code = dto.Code.ToUpper(),
                Location = dto.Location,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var createdWindow = await _windowRepository.CreateAsync(window);

            return MapToDto(window);
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
                Code = window.Code,
                Location = window.Location,
                IsActive = window.IsActive,
                CreatedAt = window.CreatedAt,
                UpdatedAt = window.UpdatedAt,
                TicketCount = window.Tickets.Count
            };
        }
    }
}
