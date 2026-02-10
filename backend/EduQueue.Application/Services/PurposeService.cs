using EduQueue.Application.DTOs;
using EduQueue.Application.Interfaces;
using EduQueue.Domain.Entities;
using EduQueue.Domain.Interfaces;

namespace EduQueue.Application.Services
{
    public class PurposeService : IPurposeService
    {
        private readonly IPurposeRepository _purposeRepository;

        public PurposeService(IPurposeRepository purposeRepository)
        {
            _purposeRepository = purposeRepository;
        }

        public async Task<Purpose> CreatePurposeAsync(CreatePurposeDto dto)
        {
            var purpose = new Purpose
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Description = dto.Description,
                WindowId = dto.WindowId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            return await _purposeRepository.CreateAsync(purpose);
        }

        public async Task<PurposeDto?> GetPurposeByIdAsync(Guid id)
        {
            var purpose = await _purposeRepository.GetByIdAsync(id);
            return purpose == null ? null : MapToDto(purpose);
        }

        public async Task<IEnumerable<PurposeDto>> GetAllPurposesAsync()
        {
            var purposes = await _purposeRepository.GetAllAsync();
            return purposes.Select(MapToDto);
        }

        public async Task<IEnumerable<PurposeDto>> GetActivePurposesAsync()
        {
            var purposes = await _purposeRepository.GetActiveAsync();
            return purposes.Select(MapToDto);
        }

        public async Task<IEnumerable<PurposeDto>> GetPurposesByWindowAsync(Guid windowId)
        {
            var purposes = await _purposeRepository.GetByWindowIdAsync(windowId);
            return purposes.Select(MapToDto);
        }

        public async Task UpdatePurposeAsync(Guid id, CreatePurposeDto dto)
        {
            var purpose = await _purposeRepository.GetByIdAsync(id);
            if (purpose == null) throw new InvalidOperationException("Purpose not found");

            purpose.Name = dto.Name;
            purpose.Description = dto.Description;
            purpose.WindowId = dto.WindowId;
            purpose.UpdatedAt = DateTime.UtcNow;

            await _purposeRepository.UpdateAsync(purpose);
        }

        public async Task DeletePurposeAsync(Guid id)
        {
            await _purposeRepository.DeleteAsync(id);
        }

        private PurposeDto MapToDto(Purpose purpose)
        {
            return new PurposeDto
            {
                Id = purpose.Id,
                Name = purpose.Name,
                Description = purpose.Description,
                WindowId = purpose.WindowId,
                WindowName = purpose.Window?.Name ?? "Unknown",
                IsActive = purpose.IsActive,
                CreatedAt = purpose.CreatedAt,
                UpdatedAt = purpose.UpdatedAt,
                TicketCount = purpose.Tickets.Count
            };
        }
    }
}
