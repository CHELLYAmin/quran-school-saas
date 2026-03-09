using Microsoft.EntityFrameworkCore;
using QuranSchool.Infrastructure.Data;
using QuranSchool.Infrastructure.Seed;
using Xunit;

namespace QuranSchool.Tests.IntegrationTests;

public class DatabaseSeederTests
{
    private DbContextOptions<AppDbContext> CreateInMemoryOptions()
    {
        return new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
    }

    [Fact]
    public async Task SeedLargeDatasetAsync_ShouldEnforceMaxCapacityOf20StudentsPerGroup()
    {
        // Arrange
        var options = CreateInMemoryOptions();
        using var context = new AppDbContext(options);
        var seeder = new AdvancedDataSeeder(context);

        // Act
        await seeder.SeedLargeDatasetAsync();

        // Assert
        var groups = await context.Groups.Include(g => g.Students).ToListAsync();
        
        Assert.NotEmpty(groups);
        
        foreach (var group in groups)
        {
            Assert.True(group.Students.Count <= 20, $"Group {group.Name} exceeded max capacity (has {group.Students.Count} students).");
        }
    }

    [Fact]
    public async Task SeedLargeDatasetAsync_ShouldCreateStudentsAndPayments()
    {
        // Arrange
        var options = CreateInMemoryOptions();
        using var context = new AppDbContext(options);
        var seeder = new AdvancedDataSeeder(context);

        // Act
        await seeder.SeedLargeDatasetAsync();

        // Assert
        var studentCount = await context.Students.CountAsync();
        var paymentCount = await context.Payments.CountAsync();

        Assert.True(studentCount > 0, "No students were seeded.");
        Assert.True(paymentCount > 0, "No payments were seeded.");
    }
}
