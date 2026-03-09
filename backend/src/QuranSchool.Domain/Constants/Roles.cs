namespace QuranSchool.Domain.Constants;

public static class Roles
{
    public const string SuperAdmin = "SuperAdmin";
    public const string Admin = "Admin";
    public const string Teacher = "Teacher";
    public const string Examiner = "Examiner";
    public const string Parent = "Parent";
    public const string Student = "Student";
    public const string Accountant = "Accountant";

    public static readonly IReadOnlyList<string> All = new[]
    {
        SuperAdmin, Admin, Teacher, Examiner, Parent, Student, Accountant
    };
}
