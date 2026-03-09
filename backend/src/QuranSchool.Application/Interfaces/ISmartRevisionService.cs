using QuranSchool.Application.DTOs;

namespace QuranSchool.Application.Interfaces;

public interface ISmartRevisionService
{
    Task<StudentMissionDto?> GenerateSmartRevisionAsync(Guid studentId, CancellationToken cancellationToken = default);
    Task<int> GenerateBatchRevisionsAsync(Guid groupId, CancellationToken cancellationToken = default);
}
