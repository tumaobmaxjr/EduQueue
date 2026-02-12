using EduQueue.Application.DTOs;

namespace EduQueue.Application.Interfaces
{
    public interface IPurposeService
    {
        Task<PurposeDto> CreatePurposeAsync(CreatePurposeDto dto);
        Task<PurposeDto?> GetPurposeByIdAsync(Guid id);
        Task<IEnumerable<PurposeDto>> GetAllPurposesAsync();
        Task<IEnumerable<PurposeDto>> GetActivePurposesAsync();
        Task<IEnumerable<PurposeDto>> GetPurposesByWindowAsync(Guid windowId);
        Task UpdatePurposeAsync(Guid id, CreatePurposeDto dto);
        Task DeletePurposeAsync(Guid id);
    }
}
