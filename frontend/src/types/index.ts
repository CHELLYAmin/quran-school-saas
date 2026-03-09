export enum UserRole {
    SuperAdmin = 'SuperAdmin',
    Admin = 'Admin',
    Teacher = 'Teacher',
    Examiner = 'Examiner',
    Parent = 'Parent',
    Student = 'Student',
    Accountant = 'Accountant',
}

export enum ExamType {
    Hifdh = 'Hifdh',
    Tajwid = 'Tajwid',
    Revision = 'Revision',
    Reading = 'Reading',
}

export enum ExamStatus {
    InProgress = 'InProgress',
    Completed = 'Completed',
    Cancelled = 'Cancelled',
    Planned = 'Planned',
}

export enum VerseEvaluationStatus {
    Correct = 'Correct',
    Blocked = 'Blocked',
    Forgotten = 'Forgotten',
}

export enum WordAnnotationType {
    Blocked = 'Blocked',
    Forgotten = 'Forgotten',
    TajwidError = 'TajwidError',
}

export enum AttendanceStatus {
    Present = 'Present',
    Absent = 'Absent',
    Late = 'Late',
    Excused = 'Excused',
}

export enum PaymentStatus {
    Pending = 'Pending',
    Paid = 'Paid',
    Overdue = 'Overdue',
    Cancelled = 'Cancelled',
    Refunded = 'Refunded',
}

export enum ProgressStatus {
    NotStarted = 'NotStarted',
    InProgress = 'InProgress',
    NeedsRevision = 'NeedsRevision',
    Memorized = 'Memorized',
    Mastered = 'Mastered',
}

// === Auth & Users ===
export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { email: string; password: string; firstName: string; lastName: string; role: UserRole; isExaminer?: boolean; schoolId: string; phone?: string; }
export interface AuthResponse {
    token: string;
    refreshToken: string;
    userId: string;
    email: string;
    fullName: string;
    roles: UserRole[];
    permissions?: string[];
    schoolId: string;
    tokenExpiry?: string;
    studentId?: string;
    teacherId?: string;
    parentId?: string;
}
export interface UserResponse { id: string; email: string; firstName: string; lastName: string; fullName: string; roles: UserRole[]; phone?: string; avatarUrl?: string; isActive: boolean; isExaminer?: boolean; preferredLanguage: string; createdAt: string; }

// === School ===
export interface SchoolResponse { id: string; name: string; address?: string; phone?: string; email?: string; logoUrl?: string; description?: string; isActive: boolean; createdAt: string; }

// === Student ===
export interface StudentResponse {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email?: string;
    dateOfBirth: string;
    phone?: string;
    phoneNumber?: string;
    address?: string;
    photoUrl?: string;
    gender?: string;
    isActive: boolean;
    enrollmentDate: string;
    groupId?: string;
    groupName?: string;
    parentId?: string;
    parentName?: string;
    levelName?: string;
    level?: string;
    levelOrder?: number;
    currentLevel?: string;
    avgScore?: number;
    attendanceRate?: number;
    lastSessionNote?: string;
    notes?: string;
    createdAt: string;
}
export interface StudentListResponse { id: string; fullName: string; groupId?: string; groupName?: string; isActive: boolean; enrollmentDate: string; levelName?: string; levelOrder?: number; currentLevel?: string; }

// === Group ===
export interface GroupResponse { id: string; name: string; level?: string; levelId?: string; levelName?: string; levelOrder?: number; levelStartSurah?: number; levelEndSurah?: number; maxCapacity: number; description?: string; isActive: boolean; teacherId?: string; teacherName?: string; studentCount: number; createdAt: string; }

// === Quran ===
export interface SurahResponse { id: string; number: number; nameArabic: string; nameEnglish: string; revelationType: string; verseCount: number; }
export interface VerseResponse { id: string; surahId: string; verseNumber: number; textArabic: string; wordsCount: number; words: WordResponse[]; }
export interface WordResponse { id: string; verseId: string; wordIndex: number; wordText: string; normalizedText: string; }

// === Exam ===
export interface ExamResponse {
    id: string;
    title: string;
    type: ExamType;
    examDate: string;
    studentId: string;
    studentName: string;
    examinerId: string;
    examinerName: string;
    surahId?: string;
    surahName?: string;
    examLevel?: string;
    startVerse?: number;
    endVerse?: number;
    finalStatus: ExamStatus;
    finalScore: number;
    groupId?: string;
    groupName?: string;
    isLevelProgressionExam: boolean;
    targetLevel?: string;
    duration?: number;
    createdAt: string;
}

export interface ExamReportResponse {
    examId: string;
    title?: string;
    studentName: string;
    examType?: ExamType;
    examDate?: string;
    surahName: string;
    startVerse: number;
    endVerse: number;
    totalVersesEvaluated: number;
    blockedCount: number;
    forgottenCount: number;
    tajwidErrorCount: number;
    finalScore: number;
    duration?: number;
    globalComment?: string;
    verseDetails: VerseEvaluationDetail[];
}

export interface VerseEvaluationDetail {
    verseNumber: number;
    textArabic: string;
    status: VerseEvaluationStatus;
    assistanceGiven: boolean;
    comment?: string;
    wordAnnotations: WordAnnotationDetail[];
}

export interface WordAnnotationDetail {
    wordIndex: number;
    wordText: string;
    type: WordAnnotationType;
    comment?: string;
}

// === Attendance ===
export interface AttendanceResponse { id: string; studentId: string; studentName: string; date: string; status: AttendanceStatus; notes?: string; checkInTime?: string; }

// === Payment ===
export interface PaymentResponse { id: string; studentId: string; studentName: string; amount: number; dueDate: string; paidDate?: string; status: PaymentStatus; description?: string; transactionReference?: string; discount?: number; discountReason?: string; createdAt: string; }
export interface RevenueStatsResponse { totalRevenue: number; monthlyRevenue: number; totalPayments: number; paidCount: number; overdueCount: number; pendingCount: number; }

// === Progress ===
export interface ProgressResponse { id: string; studentId: string; studentName: string; surahName?: string; surahNumber?: number; juzNumber?: number; hizbNumber?: number; startVerse?: number; endVerse?: number; status: ProgressStatus; teacherNotes?: string; recordDate: string; qualityScore?: number; createdAt: string; }
export interface StudentProgressSummary { studentId: string; studentName: string; totalJuz: number; memorizedJuz: number; inProgressJuz: number; totalSurah: number; memorizedSurah: number; averageQuality: number; lastProgressDate?: string; }

// === Schedule ===
export interface ScheduleResponse { id: string; groupId: string; groupName: string; dayOfWeek: string; startTime: string; endTime: string; roomName?: string; notes?: string; isActive: boolean; createdAt: string; }

// === Dashboard ===
export interface AdminDashboardResponse { totalStudents: number; activeStudents: number; totalTeachers: number; totalGroups: number; monthlyRevenue: number; totalRevenue: number; averageProgress: number; examPassRate: number; attendanceRate: number; overduePaymentsCount: number; examsThisMonthCount: number; revenueHistory: { month: string; amount: number }[]; groupProgress: { groupName: string; averageProgress: number; studentCount: number }[]; }
export interface TeacherDashboardResponse { totalStudents: number; groupCount: number; averageProgress: number; studentsNeedingAttention: { studentId: string; studentName: string; progress: number; status: string }[]; upcomingExams: { examId: string; title: string; examDate: string; groupName: string }[]; }

// === Communication ===
export interface MessageResponse { id: string; senderId: string; senderName: string; receiverId: string; receiverName: string; subject: string; body: string; isRead: boolean; sentAt: string; }
export interface NotificationResponse { id: string; title: string; body: string; isRead: boolean; type?: string; referenceId?: string; createdAt: string; }

// === Levels ===
export interface LevelResponse { id: string; name: string; order: number; description?: string; isActive: boolean; startSurah?: number; endSurah?: number; groupCount?: number; studentCount?: number; createdAt: string; }

// === Sessions ===
export interface SessionResponse {
    id: string;
    date: string;
    groupId: string;
    groupName: string;
    teacherId: string;
    teacherName: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    status: string;
    sessionObjective?: string;
    surahId?: string;
    startVerse?: number;
    endVerse?: number;
    isOnline: boolean;
    meetingUrl?: string;
    pedagogicalSummary?: string;
}

export interface SessionCockpitResponse {
    sessionId: string;
    groupId?: string;
    groupName: string;
    levelName?: string;
    levelStartSurah?: number;
    levelEndSurah?: number;
    status: string;
    sessionObjective?: string;
    isOnline: boolean;
    meetingUrl?: string;
}

// === Homework ===
export interface HomeworkResponse {
    id: string;
    title: string;
    description?: string;
    dueDate: string;
    groupId: string;
    groupName: string;
    type: string;
    createdAt: string;
}

export interface HomeworkAssignmentResponse {
    id: string;
    homeworkId: string;
    homeworkTitle: string;
    studentId: string;
    studentName: string;
    status: string;
    studentNotes?: string;
    teacherFeedback?: string;
    grade?: number;
    submittedAt?: string;
    dueDate: string;
}

// === Missions & Spaced Repetition ===
export enum MissionType {
    ManualAssignment = 'ManualAssignment', // Devoir manuel de l'enseignant
    SmartRevision = 'SmartRevision'        // Révision automatique de l'algorithme
}

export enum MissionTargetType {
    Surah = 'Surah',
    Hizb = 'Hizb',
    CustomText = 'CustomText'
}

export enum MissionStatus {
    Pending = 'Pending',
    Submitted = 'Submitted',
    Completed = 'Completed',
    Overdue = 'Overdue'
}

export interface StudentMissionResponse {
    id: string;
    studentId: string;
    teacherId?: string;
    studentName: string;
    teacherName?: string;
    type: MissionType;
    targetType: MissionTargetType;
    targetId?: number;
    customDescription?: string;
    dueDate: string;
    status: MissionStatus;
    qualityScore?: number; // 1 to 5 stars
    audioUrl?: string;
    teacherFeedback?: string;
    createdAt: string;
    completedAt?: string;
}

export interface ProvideMissionFeedbackRequest {
    qualityScore: number;
    feedback?: string;
}

export interface CreateManualMissionRequest {
    studentId: string;
    targetType: MissionTargetType;
    targetId?: number;
    customDescription?: string;
    dueDate: string;
}
