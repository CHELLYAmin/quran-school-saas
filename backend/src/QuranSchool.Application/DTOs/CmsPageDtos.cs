namespace QuranSchool.Application.DTOs;

public class CmsPageDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = "page";
    public bool IsPublished { get; set; }
    public int SortOrder { get; set; }
    public string? ParentSlug { get; set; }
    public string? FeaturedImageUrl { get; set; }
    public string? Excerpt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateCmsPageDto
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = "page";
    public bool IsPublished { get; set; } = false;
    public int SortOrder { get; set; } = 0;
    public string? ParentSlug { get; set; }
    public string? FeaturedImageUrl { get; set; }
    public string? Excerpt { get; set; }
}

public class UpdateCmsPageDto
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = "page";
    public bool IsPublished { get; set; }
    public int SortOrder { get; set; }
    public string? ParentSlug { get; set; }
    public string? FeaturedImageUrl { get; set; }
    public string? Excerpt { get; set; }
}
