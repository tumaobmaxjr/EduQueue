using EduQueue.Application.DTOs;
using EduQueue.Application.Interfaces;
using EduQueue.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace EduQueue.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PurposesController : ControllerBase
    {
        private readonly IPurposeService _purposeService;

        public PurposesController(IPurposeService purposeService)
        {
            _purposeService = purposeService;
        }

        [HttpPost]
        public async Task<ActionResult<Purpose>> CreatePurpose(CreatePurposeDto dto)
        {
            try
            {
                var purpose = await _purposeService.CreatePurposeAsync(dto);
                return CreatedAtAction(nameof(GetPurpose), new { id = purpose.Id }, purpose);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PurposeDto>> GetPurpose(Guid id)
        {
            var purpose = await _purposeService.GetPurposeByIdAsync(id);
            if (purpose == null) return NotFound();

            return Ok(purpose);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PurposeDto>>> GetAllPurposes()
        {
            var purposes = await _purposeService.GetAllPurposesAsync();
            return Ok(purposes);
        }

        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<PurposeDto>>> GetActivePurposes()
        {
            var purposes = await _purposeService.GetActivePurposesAsync();
            return Ok(purposes);
        }

        [HttpGet("window/{windowId}")]
        public async Task<ActionResult<IEnumerable<PurposeDto>>> GetPurposesByWindow(Guid windowId)
        {
            var purposes = await _purposeService.GetPurposesByWindowAsync(windowId);
            return Ok(purposes);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePurpose(Guid id, CreatePurposeDto dto)
        {
            try
            {
                await _purposeService.UpdatePurposeAsync(id, dto);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePurpose(Guid id)
        {
            try
            {
                await _purposeService.DeletePurposeAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
