using FluentValidation;
using QuranSchool.Application.DTOs.Auth;
using QuranSchool.Application.DTOs.Student;
using QuranSchool.Application.DTOs.Group;
using QuranSchool.Application.DTOs.Exam;
using QuranSchool.Application.DTOs.Payment;

namespace QuranSchool.Application.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
    }
}

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Role).NotEmpty();
        RuleFor(x => x.ProfileType).IsInEnum();
        RuleFor(x => x.ProfileId).NotEmpty();
        RuleFor(x => x.SchoolId).NotEmpty();
    }
}

public class CreateStudentRequestValidator : AbstractValidator<CreateStudentRequest>
{
    public CreateStudentRequestValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DateOfBirth).NotEmpty().LessThan(DateTime.UtcNow);
    }
}

public class UpdateStudentRequestValidator : AbstractValidator<UpdateStudentRequest>
{
    public UpdateStudentRequestValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DateOfBirth).NotEmpty().LessThan(DateTime.UtcNow);
    }
}

public class CreateGroupRequestValidator : AbstractValidator<CreateGroupRequest>
{
    public CreateGroupRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.MaxCapacity).GreaterThan(0).LessThanOrEqualTo(100);
    }
}

public class StartExamRequestValidator : AbstractValidator<StartExamRequest>
{
    public StartExamRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.StudentId).NotEmpty();
        RuleFor(x => x.ExaminerId).NotEmpty();
        RuleFor(x => x).Must(x => x.SurahId.HasValue || !string.IsNullOrEmpty(x.ExamLevel))
            .WithMessage("You must provide either a SurahId or an ExamLevel.");
        RuleFor(x => x.StartVerse).GreaterThan(0).When(x => x.SurahId.HasValue);
        RuleFor(x => x.EndVerse).GreaterThanOrEqualTo(x => x.StartVerse).When(x => x.StartVerse.HasValue && x.SurahId.HasValue);
    }
}

public class CreatePaymentRequestValidator : AbstractValidator<CreatePaymentRequest>
{
    public CreatePaymentRequestValidator()
    {
        RuleFor(x => x.StudentId).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.DueDate).NotEmpty();
    }
}
