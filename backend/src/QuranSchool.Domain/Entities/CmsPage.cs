namespace QuranSchool.Domain.Entities;

public class CmsPage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = "page"; // page, announcement, service, about, islam
    public bool IsPublished { get; set; } = false;
    public int SortOrder { get; set; } = 0;
    public string? ParentSlug { get; set; }
    public string? FeaturedImageUrl { get; set; }
    public string? Excerpt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Optional link to school for multi-tenancy
    public Guid? SchoolId { get; set; }
    public School? School { get; set; }
}
