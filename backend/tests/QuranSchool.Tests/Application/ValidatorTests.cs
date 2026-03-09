using FluentValidation.TestHelper;
using QuranSchool.Application.Validators;
using QuranSchool.Application.DTOs.Auth;
using QuranSchool.Application.DTOs.Student;
using QuranSchool.Domain.Enums;
using Xunit;

namespace QuranSchool.Tests.Application;

public class ValidatorTests
{
    [Fact]
    public void LoginRequest_EmptyEmail_ShouldFail()
    {
        var validator = new LoginRequestValidator();
        var result = validator.TestValidate(new LoginRequest("", "password123"));
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void LoginRequest_InvalidEmail_ShouldFail()
    {
        var validator = new LoginRequestValidator();
        var result = validator.TestValidate(new LoginRequest("notanemail", "password123"));
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void LoginRequest_ShortPassword_ShouldFail()
    {
        var validator = new LoginRequestValidator();
        var result = validator.TestValidate(new LoginRequest("test@test.com", "123"));
        result.ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void LoginRequest_ValidInput_ShouldPass()
    {
        var validator = new LoginRequestValidator();
        var result = validator.TestValidate(new LoginRequest("test@test.com", "password123"));
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void RegisterRequest_EmptyFirstName_ShouldFail()
    {
        var validator = new RegisterRequestValidator();
        var result = validator.TestValidate(new RegisterRequest("test@test.com", "pass123", "", "Last", QuranSchool.Domain.Constants.Roles.Admin, ProfileType.Admin, Guid.NewGuid(), Guid.NewGuid()));
        result.ShouldHaveValidationErrorFor(x => x.FirstName);
    }

    [Fact]
    public void CreateStudentRequest_FutureDateOfBirth_ShouldFail()
    {
        var validator = new CreateStudentRequestValidator();
        var result = validator.TestValidate(new CreateStudentRequest("Ahmed", "Benali", DateTime.UtcNow.AddDays(1), null, null, null, null));
        result.ShouldHaveValidationErrorFor(x => x.DateOfBirth);
    }

    [Fact]
    public void CreateStudentRequest_ValidInput_ShouldPass()
    {
        var validator = new CreateStudentRequestValidator();
        var result = validator.TestValidate(new CreateStudentRequest("Ahmed", "Benali", new DateTime(2010, 5, 15), null, null, null, null));
        result.ShouldNotHaveAnyValidationErrors();
    }
}
