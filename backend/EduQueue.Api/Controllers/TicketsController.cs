using EduQueue.Application.DTOs;
using EduQueue.Application.Interfaces;
using EduQueue.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace EduQueue.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketsController : ControllerBase
    {
        private readonly ITicketService _ticketService;

        public TicketsController(ITicketService ticketService)
        {
            _ticketService = ticketService;
        }

        [HttpPost]
        public async Task<ActionResult<Ticket>> CreateTicket(CreateTicketDto dto)
        {
            try
            {
                var ticket = await _ticketService.CreateTicketAsync(dto);
                return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, ticket);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TicketDto>> GetTicket(Guid id)
        {
            var ticket = await _ticketService.GetTicketByIdAsync(id);
            if (ticket == null) return NotFound();

            return Ok(ticket);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TicketDto>>> GetAllTickets()
        {
            var tickets = await _ticketService.GetAllTicketsAsync();
            return Ok(tickets);
        }

        [HttpGet("window/{windowId}")]
        public async Task<ActionResult<TicketDto>> GetTicketsByWindow(Guid windowId)
        {
            var tickets = await _ticketService.GetTicketsbyWindowAsync(windowId);
            return Ok(tickets);
        }

        [HttpPost("window/{windowId}/call")]
        public async Task<ActionResult<TicketDto>> CallNextTicket(Guid windowId, [FromQuery] Guid officerId)
        {
            try
            {
                var ticket = await _ticketService.CallNextTicketAsync(windowId, officerId);
                return Ok(ticket);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{ticketId}/complete")]
        public async Task<IActionResult> CompleteTicket(Guid ticketId)
        {
            try
            {
                await _ticketService.CompleteTicketAsync(ticketId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{ticketId}/noshow")]
        public async Task<IActionResult> MarkNoShow(Guid ticketId)
        {
            try
            {
                await _ticketService.MarkNoShowAsync(ticketId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{ticketId}/transfer")]
        public async Task<IActionResult> TransferTicket(Guid ticketId, [FromQuery] Guid targetWindowId)
        {
            try
            {
                await _ticketService.TransferTicketAsync(ticketId, targetWindowId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
