using EduQueue.Application.DTOs;
using EduQueue.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EduQueue.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WindowsController : ControllerBase
    {
        private readonly IWindowService _windowService;

        public WindowsController(IWindowService windowService)
        {
            _windowService = windowService;
        }

        [HttpPost]
        public async Task<ActionResult<WindowDto>> CreateWindow(CreateWindowDto dto)
        {
            try
            {
                var window = await _windowService.CreateWindowAsync(dto);
                return CreatedAtAction(nameof(GetWindow), new { id = window.Id }, window);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<WindowDto>> GetWindow(Guid id)
        {
            var window = await _windowService.GetWindowByIdAsync(id);
            if (window == null) return NotFound();
            return Ok(window);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<WindowDto>>> GetAllWindows()
        {
            var windows = await _windowService.GetAllWindowsAsync();
            return Ok(windows);
        }

        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<WindowDto>>> GetActiveWindows()
        {
            var windows = await _windowService.GetActiveWindowsAsync();
            return Ok(windows);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWindow(Guid id, CreateWindowDto dto)
        {
            try
            {
                await _windowService.UpdateWindowAsync(id, dto);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWindow(Guid id)
        {
            try
            {
                await _windowService.DeleteWindowAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
