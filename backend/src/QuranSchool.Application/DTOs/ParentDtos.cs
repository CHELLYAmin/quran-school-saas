namespace QuranSchool.Application.DTOs.Parent;

public record ParentResponse(
    Guid Id,
    string FullName,
    string? Phone,
    string? Address,
    string? Occupation,
    int ChildrenCount,
    DateTime CreatedAt
);

public record CreateParentRequest(string FirstName, string LastName, string Email, string? Phone, string? Address, string? Occupation);
public record UpdateParentRequest(string FirstName, string LastName, string Email, string? Phone, string? Address, string? Occupation);
