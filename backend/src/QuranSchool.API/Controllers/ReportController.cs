using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using QuranSchool.Application.Interfaces;

namespace QuranSchool.API.Controllers;

[ApiController]
[Route("api/report")]
public class ReportController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [Authorize]
    [HttpGet("student/{id}/progress-pdf")]
    public async Task<IActionResult> GetStudentProgressPdf(Guid id)
    {
        try
        {
            var pdfBytes = await _reportService.GenerateStudentProgressPdfAsync(id);
            return File(pdfBytes, "application/pdf", $"Rapport_Progression_{id}.pdf");
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
