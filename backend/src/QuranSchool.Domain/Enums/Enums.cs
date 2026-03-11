namespace QuranSchool.Domain.Enums;

public enum ExamType
{
    Hifdh = 0,
    Tajwid = 1,
    Revision = 2,
    Reading = 3
}

public enum ExamStatus
{
    InProgress = 0,
    Completed = 1,
    Cancelled = 2,
    Planned = 3
}

public enum VerseEvaluationStatus
{
    Correct = 0,
    Blocked = 1,
    Forgotten = 2
}

public enum WordAnnotationType
{
    Blocked = 0,
    Forgotten = 1,
    TajwidError = 2
}

public enum AttendanceStatus
{
    Present = 0,
    Absent = 1,
    Late = 2,
    Excused = 3
}

public enum PaymentStatus
{
    Pending = 0,
    Paid = 1,
    Overdue = 2,
    Cancelled = 3,
    Refunded = 4
}

public enum ProgressStatus
{
    NotStarted = 0,
    InProgress = 1,
    NeedsRevision = 2,
    Memorized = 3,
    Mastered = 4
}

public enum DayOfWeekEnum
{
    Sunday = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6
}
// ... existing enums ...

public enum HomeworkType
{
    Memorization = 0,
    Revision = 1,
    Tajwid = 2,
    Reading = 3,
    Written = 4
}

public enum HomeworkStatus
{
    Pending = 0,
    Submitted = 1,
    Graded = 2,
    Late = 3,
    Excused = 4
}

public enum DonationRecordStatus
{
    Pending = 0,
    Validated = 1,
    ReceiptIssued = 2
}

public enum DonationPaymentType
{
    Interac = 0,
    Cash = 1,
    Cheque = 2,
    Card = 3
}

public enum VolunteerSignupStatus
{
    Pending = 0,
    Approved = 1,
    Rejected = 2,
    Completed = 3
}

public enum FinancialTransactionType
{
    Income = 0,
    Expense = 1
}

public enum TransactionPaymentMethod
{
    Cash = 0,
    Card = 1,
    Transfer = 2,
    Cheque = 3,
    Interac = 4
}

public enum StaffContractType
{
    CDI = 0,
    CDD = 1,
    Volunteer = 2,
    Contractor = 3
}

public enum StaffContractStatus
{
    Active = 0,
    Terminated = 1,
    OnLeave = 2
}

public enum StaffAbsenceType
{
    Sick = 0,
    Vacation = 1,
    Emergency = 2,
    Maternity = 3,
    Other = 4
}
