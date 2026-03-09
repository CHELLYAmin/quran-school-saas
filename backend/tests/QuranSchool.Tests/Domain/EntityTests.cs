using QuranSchool.Domain.Entities;
using QuranSchool.Domain.Enums;
using QuranSchool.Domain.Common;
using FluentAssertions;
using Xunit;

namespace QuranSchool.Tests.Domain;

public class EntityTests
{
    [Fact]
    public void BaseEntity_ShouldHaveDefaultValues()
    {
        var entity = new Student();
        entity.Id.Should().NotBeEmpty();
        entity.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        entity.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        entity.IsDeleted.Should().BeFalse();
    }

    [Fact]
    public void Student_FullName_ShouldCombineFirstAndLastName()
    {
        var student = new Student { FirstName = "Ahmed", LastName = "Benali" };
        student.FullName.Should().Be("Ahmed Benali");
    }

    [Fact]
    public void User_ShouldDefaultToInactiveRefreshToken()
    {
        var user = new User();
        user.RefreshToken.Should().BeNull();
        user.RefreshTokenExpiryTime.Should().BeNull();
    }

    [Fact]
    public void User_DefaultLanguage_ShouldBeFrench()
    {
        var user = new User();
        user.PreferredLanguage.Should().Be("fr");
    }

    [Fact]
    public void Group_DefaultCapacity_ShouldBe30()
    {
        var group = new Group();
        group.MaxCapacity.Should().Be(30);
    }

    [Fact]
    public void Payment_DefaultStatus_ShouldBePending()
    {
        var payment = new Payment();
        payment.Status.Should().Be(PaymentStatus.Pending);
    }

    [Fact]
    public void Progress_DefaultStatus_ShouldBeNotStarted()
    {
        var progress = new Progress();
        progress.Status.Should().Be(ProgressStatus.NotStarted);
    }

    [Fact]
    public void School_ShouldBeActiveByDefault()
    {
        var school = new School();
        school.IsActive.Should().BeTrue();
    }

    [Fact]
    public void ExamResult_ShouldHaveGradeAndPassStatus()
    {
        var result = new ExamResult { Score = 85, IsPassed = true, Grade = "A" };
        result.IsPassed.Should().BeTrue();
        result.Grade.Should().Be("A");
    }

    [Fact]
    public void Roles_ShouldContainAllSevenRoles()
    {
        var roles = QuranSchool.Domain.Constants.Roles.All;
        roles.Should().HaveCount(7);
        roles.Should().Contain(QuranSchool.Domain.Constants.Roles.SuperAdmin);
        roles.Should().Contain(QuranSchool.Domain.Constants.Roles.Admin);
        roles.Should().Contain(QuranSchool.Domain.Constants.Roles.Teacher);
        roles.Should().Contain(QuranSchool.Domain.Constants.Roles.Examiner);
        roles.Should().Contain(QuranSchool.Domain.Constants.Roles.Parent);
        roles.Should().Contain(QuranSchool.Domain.Constants.Roles.Student);
        roles.Should().Contain(QuranSchool.Domain.Constants.Roles.Accountant);
    }
}
