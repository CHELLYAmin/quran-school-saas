using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
            SeoTitle = p.SeoTitle,
            SeoDescription = p.SeoDescription,
            MetaImage = p.MetaImage,
            IsSystemPage = p.IsSystemPage,
            ShowInMenu = p.ShowInMenu,
            Icon = p.Icon,
            BlocksJson = p.BlocksJson,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        }).ToList());
    }

    /// <summary>
    /// Get dynamic menu links.
    /// </summary>
    [HttpGet("menu")]
    [AllowAnonymous]
    public async Task<ActionResult<List<CmsPageDto>>> GetMenuLinks()
    {
        var links = await _context.CmsPages
            .Where(p => p.IsPublished && p.ShowInMenu)
            .OrderBy(p => p.SortOrder)
            .Select(p => new CmsPageDto
            {
                Id = p.Id,
                Title = p.Title,
                Slug = p.Slug,
                Category = p.Category,
                IsSystemPage = p.IsSystemPage,
                Icon = p.Icon,
                SortOrder = p.SortOrder
            })
            .ToListAsync();

        return Ok(links);
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
            SeoTitle = page.SeoTitle,
            SeoDescription = page.SeoDescription,
            MetaImage = page.MetaImage,
            IsSystemPage = page.IsSystemPage,
            ShowInMenu = page.ShowInMenu,
            Icon = page.Icon,
            BlocksJson = page.BlocksJson,
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
            Excerpt = dto.Excerpt,
            SeoTitle = dto.SeoTitle,
            SeoDescription = dto.SeoDescription,
            MetaImage = dto.MetaImage,
            IsSystemPage = dto.IsSystemPage,
            ShowInMenu = dto.ShowInMenu,
            Icon = dto.Icon,
            BlocksJson = dto.BlocksJson
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
            SeoTitle = page.SeoTitle,
            SeoDescription = page.SeoDescription,
            MetaImage = page.MetaImage,
            IsSystemPage = page.IsSystemPage,
            ShowInMenu = page.ShowInMenu,
            Icon = page.Icon,
            BlocksJson = page.BlocksJson,
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
        page.SeoTitle = dto.SeoTitle;
        page.SeoDescription = dto.SeoDescription;
        page.MetaImage = dto.MetaImage;
        page.IsSystemPage = dto.IsSystemPage;
        page.ShowInMenu = dto.ShowInMenu;
        page.Icon = dto.Icon;
        page.BlocksJson = dto.BlocksJson;
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
            SeoTitle = page.SeoTitle,
            SeoDescription = page.SeoDescription,
            MetaImage = page.MetaImage,
            IsSystemPage = page.IsSystemPage,
            ShowInMenu = page.ShowInMenu,
            Icon = page.Icon,
            BlocksJson = page.BlocksJson,
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

        if (page.IsSystemPage)
            return BadRequest(new { Message = "Cannot delete system pages. You can unpublish them instead." });

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
 
    // POST: api/cms/cleanup
    [HttpPost("cleanup")]
    public async Task<IActionResult> CleanupDemoData()
    {
        // 1. Purge CMS Pages
        var pages = await _context.CmsPages.ToListAsync();
        _context.CmsPages.RemoveRange(pages);
 
        // 2. Purge Donation Campaigns
        var campaigns = await _context.DonationCampaigns.ToListAsync();
        _context.DonationCampaigns.RemoveRange(campaigns);
 
        // 3. Purge Volunteer Missions
        var missions = await _context.VolunteerMissions.ToListAsync();
        _context.VolunteerMissions.RemoveRange(missions);

        // 4. Purge Ramadan Settings
        var ramadan = await _context.RamadanSettings.ToListAsync();
        _context.RamadanSettings.RemoveRange(ramadan);

        // 5. Reset Mosque Settings (Bandeau news)
        var mosqueSettings = await _context.MosqueSettings.FirstOrDefaultAsync();
        if (mosqueSettings != null)
        {
            mosqueSettings.IsLiveAnnouncementActive = false;
            mosqueSettings.LiveAnnouncementText = string.Empty;
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Demo data cleaned up successfully (CMS, Donations, Missions, Ramadan, Mosque Settings reset)." });
    }
}
