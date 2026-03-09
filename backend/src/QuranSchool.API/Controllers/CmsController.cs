using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuranSchool.Application.DTOs;
using QuranSchool.Domain.Entities;
using QuranSchool.Infrastructure.Data;

namespace QuranSchool.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CmsController : ControllerBase
{
    private readonly AppDbContext _context;

    public CmsController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// List all CMS pages. Use ?published=true for public site.
    /// </summary>
    [HttpGet("pages")]
    [AllowAnonymous]
    public async Task<ActionResult<List<CmsPageDto>>> GetPages([FromQuery] bool? published, [FromQuery] string? category)
    {
        var query = _context.CmsPages.AsQueryable();

        if (published.HasValue)
            query = query.Where(p => p.IsPublished == published.Value);

        if (!string.IsNullOrEmpty(category))
            query = query.Where(p => p.Category == category);

        var pages = await query.OrderBy(p => p.SortOrder).ThenByDescending(p => p.CreatedAt).ToListAsync();

        return Ok(pages.Select(p => new CmsPageDto
        {
            Id = p.Id,
            Title = p.Title,
            Slug = p.Slug,
            Content = p.Content,
            Category = p.Category,
            IsPublished = p.IsPublished,
            SortOrder = p.SortOrder,
            ParentSlug = p.ParentSlug,
            FeaturedImageUrl = p.FeaturedImageUrl,
            Excerpt = p.Excerpt,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        }).ToList());
    }

    /// <summary>
    /// Get a single CMS page by slug.
    /// </summary>
    [HttpGet("pages/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<CmsPageDto>> GetPageBySlug(string slug)
    {
        var page = await _context.CmsPages.FirstOrDefaultAsync(p => p.Slug == slug);
        if (page == null) return NotFound();

        return Ok(new CmsPageDto
        {
            Id = page.Id,
            Title = page.Title,
            Slug = page.Slug,
            Content = page.Content,
            Category = page.Category,
            IsPublished = page.IsPublished,
            SortOrder = page.SortOrder,
            ParentSlug = page.ParentSlug,
            FeaturedImageUrl = page.FeaturedImageUrl,
            Excerpt = page.Excerpt,
            CreatedAt = page.CreatedAt,
            UpdatedAt = page.UpdatedAt
        });
    }

    /// <summary>
    /// Create a new CMS page.
    /// </summary>
    [HttpPost("pages")]
    [AllowAnonymous]
    public async Task<ActionResult<CmsPageDto>> CreatePage([FromBody] CreateCmsPageDto dto)
    {
        var page = new CmsPage
        {
            Title = dto.Title,
            Slug = dto.Slug,
            Content = dto.Content,
            Category = dto.Category,
            IsPublished = dto.IsPublished,
            SortOrder = dto.SortOrder,
            ParentSlug = dto.ParentSlug,
            FeaturedImageUrl = dto.FeaturedImageUrl,
            Excerpt = dto.Excerpt
        };

        _context.CmsPages.Add(page);
        await _context.SaveChangesAsync();

        return Ok(new CmsPageDto
        {
            Id = page.Id,
            Title = page.Title,
            Slug = page.Slug,
            Content = page.Content,
            Category = page.Category,
            IsPublished = page.IsPublished,
            SortOrder = page.SortOrder,
            ParentSlug = page.ParentSlug,
            FeaturedImageUrl = page.FeaturedImageUrl,
            Excerpt = page.Excerpt,
            CreatedAt = page.CreatedAt,
            UpdatedAt = page.UpdatedAt
        });
    }

    /// <summary>
    /// Update an existing CMS page.
    /// </summary>
    [HttpPut("pages/{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<CmsPageDto>> UpdatePage(Guid id, [FromBody] UpdateCmsPageDto dto)
    {
        var page = await _context.CmsPages.FindAsync(id);
        if (page == null) return NotFound();

        page.Title = dto.Title;
        page.Slug = dto.Slug;
        page.Content = dto.Content;
        page.Category = dto.Category;
        page.IsPublished = dto.IsPublished;
        page.SortOrder = dto.SortOrder;
        page.ParentSlug = dto.ParentSlug;
        page.FeaturedImageUrl = dto.FeaturedImageUrl;
        page.Excerpt = dto.Excerpt;
        page.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new CmsPageDto
        {
            Id = page.Id,
            Title = page.Title,
            Slug = page.Slug,
            Content = page.Content,
            Category = page.Category,
            IsPublished = page.IsPublished,
            SortOrder = page.SortOrder,
            ParentSlug = page.ParentSlug,
            FeaturedImageUrl = page.FeaturedImageUrl,
            Excerpt = page.Excerpt,
            CreatedAt = page.CreatedAt,
            UpdatedAt = page.UpdatedAt
        });
    }

    /// <summary>
    /// Delete a CMS page.
    /// </summary>
    [HttpDelete("pages/{id}")]
    [AllowAnonymous]
    public async Task<ActionResult> DeletePage(Guid id)
    {
        var page = await _context.CmsPages.FindAsync(id);
        if (page == null) return NotFound();

        _context.CmsPages.Remove(page);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Toggle publish/unpublish for a page.
    /// </summary>
    [HttpPatch("pages/{id}/publish")]
    [AllowAnonymous]
    public async Task<ActionResult> TogglePublish(Guid id)
    {
        var page = await _context.CmsPages.FindAsync(id);
        if (page == null) return NotFound();

        page.IsPublished = !page.IsPublished;
        page.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { page.Id, page.IsPublished });
    }
}
