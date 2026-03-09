'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect, useState, useMemo } from 'react';
import { useUIStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/translations';
import { FiCheck, FiX, FiClock, FiAlertCircle, FiUsers, FiBriefcase } from 'react-icons/fi';
import { groupApi, attendanceApi, teacherAttendanceApi, userApi, sessionApi } from '@/lib/api/client';
import toast from 'react-hot-toast';
import { UserRole } from '@/types';

type AttStatus = 'Present' | 'Absent' | 'Late' | 'Excused';
type TabType = 'students' | 'teachers';

// Fallback Mock Data for Demo
const fallbackGroups = [
    {
        id: 'g1', name: 'Groupe Al-Fatiha', students: [
            { id: 's1', firstName: 'Youssef', lastName: 'Zahra', fullName: 'Youssef Zahra' },
            { id: 's2', firstName: 'Amina', lastName: 'Zahra', fullName: 'Amina Zahra' },
            { id: 's3', firstName: 'Mohamed', lastName: 'Ali', fullName: 'Mohamed Ali' },
            { id: 's4', firstName: 'Ibrahim', lastName: 'Hassan', fullName: 'Ibrahim Hassan' },
            { id: 's5', firstName: 'Fatima', lastName: 'Oumar', fullName: 'Fatima Oumar' },
        ]
    },
    {
        id: 'g2', name: 'Groupe Al-Baqarah', students: [
            { id: 's6', firstName: 'Omar', lastName: 'Farooq', fullName: 'Omar Farooq' },
            { id: 's7', firstName: 'Aisha', lastName: 'Siddiq', fullName: 'Aisha Siddiq' },
            { id: 's8', firstName: 'Khadija', lastName: 'Tul Kubra', fullName: 'Khadija Tul Kubra' },
        ]
    }
];

const fallbackTeachers = [
    { id: 't1', firstName: 'Oustadh', lastName: 'Ahmad', fullName: 'Oustadh Ahmad', roles: [UserRole.Teacher] },
    { id: 't2', firstName: 'Cheikh', lastName: 'Mahmoud', fullName: 'Cheikh Mahmoud', roles: [UserRole.Teacher, UserRole.Admin] },
    { id: 't3', firstName: 'Moallima', lastName: 'Salma', fullName: 'Moallima Salma', roles: [UserRole.Teacher] },
];

const generateFallbackSessions = () => {
    const sessions = [];
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 30);
    const end = new Date(today);
    end.setDate(today.getDate() + 30);

    const pseudoGuid = (i: number) => `00000000-0000-0000-0000-ffff${String(i).padStart(8, '0')}`;

    let idCounter = 1;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        const dateStr = d.toISOString().split('T')[0];

        // Group 1 (g1): M/W/F
        if ([1, 3, 5].includes(dayOfWeek)) {
            sessions.push({
                id: pseudoGuid(idCounter++), groupId: 'g1', groupName: 'Groupe Al-Fatiha',
                teacherId: 't1', date: dateStr, startTime: '10:00', endTime: '12:00'
            });
        }
        // Group 2 (g2): T/Th
        if ([2, 4].includes(dayOfWeek)) {
            sessions.push({
                id: pseudoGuid(idCounter++), groupId: 'g2', groupName: 'Groupe Al-Baqarah',
                teacherId: 't2', date: dateStr, startTime: '14:00', endTime: '16:00'
            });
        }
    }
    return sessions;
};

export default function AttendancePage() {
    const { locale } = useUIStore();
    const { t } = useTranslation(locale);

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useState<TabType>('students');
    const [loading, setLoading] = useState(false);

    // Data states
    const [allGroups, setAllGroups] = useState<any[]>([]);
    const [allTeachers, setAllTeachers] = useState<any[]>([]);
    const [allSessions, setAllSessions] = useState<any[]>([]);

    const [plannedSessions, setPlannedSessions] = useState<any[]>([]);
    const [selectedSession, setSelectedSession] = useState<string>('all');

    const [students, setStudents] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);

    // Attendance state: mapping Entity ID -> Status
    const [attendance, setAttendance] = useState<Record<string, AttStatus>>({});

    useEffect(() => {
        loadBaseData();
    }, []);

    useEffect(() => {
        loadAttendanceForDate();
    }, [date, activeTab, selectedSession]);

    const loadBaseData = async () => {
        try {
            const [groupRes, devRes, sessRes] = await Promise.all([
                groupApi.getAll(),
                userApi.getAll(),
                sessionApi.getAll()
            ]);
            setAllGroups(groupRes.data);
            setAllSessions(sessRes.data);

            const profs = devRes.data.filter((u: any) =>
                u.roles?.includes(UserRole.Teacher) ||
                u.roles?.includes(UserRole.Admin) ||
                u.roles?.includes(UserRole.SuperAdmin) ||
                u.isExaminer
            );
            setAllTeachers(profs.length > 0 ? profs : fallbackTeachers);
        } catch (error) {
            console.error("Error loading base data", error);
            toast.error("Mode Démonstration : Données factices (API indisponible)");
            setAllGroups(fallbackGroups);
            setAllTeachers(fallbackTeachers);
            setAllSessions(generateFallbackSessions());
        }
    };

    const loadAttendanceForDate = async () => {
        if (!date) return;
        setLoading(true);
        try {
            const attMap: Record<string, AttStatus> = {};

            // Filter sessions for this date
            const sessionsForDate = allSessions.filter(s => {
                const sDate = s.date ? (typeof s.date === 'string' ? s.date.split('T')[0] : new Date(s.date).toISOString().split('T')[0]) : '';
                return sDate === date;
            });
            setPlannedSessions(sessionsForDate);

            if (activeTab === 'students') {
                let sessionStudents: any[] = [];
                if (selectedSession === 'all') {
                    // Get all students from all sessions today
                    const groupIds = Array.from(new Set(sessionsForDate.map(s => s.groupId)));
                    sessionStudents = allGroups.filter(g => groupIds.includes(g.id)).flatMap(g => g.students || []);
                    // Deduplicate
                    sessionStudents = Array.from(new Map(sessionStudents.map(s => [s.id, s])).values());
                } else {
                    const sess = sessionsForDate.find(s => s.id === selectedSession);
                    if (sess) {
                        const targetGroup = allGroups.find(g => g.id === sess.groupId);
                        sessionStudents = targetGroup?.students || [];
                    }
                }
                setStudents(sessionStudents);
                sessionStudents.forEach((s: any) => attMap[s.id] = 'Present');

                const res = await attendanceApi.getByDate(date);
                res.data.forEach((a: any) => {
                    if (attMap[a.studentId.toLowerCase()] !== undefined || attMap[a.studentId] !== undefined) {
                        attMap[a.studentId] = a.status;
                        attMap[a.studentId.toLowerCase()] = a.status;
                    }
                });
            } else if (activeTab === 'teachers') {
                // Filter teachers to only those who have planned sessions today
                const teacherIds = Array.from(new Set(sessionsForDate.map(s => s.teacherId)));
                const activeProfs = allTeachers.filter(t => teacherIds.includes(t.id));
                setTeachers(activeProfs);

                activeProfs.forEach((t: any) => attMap[t.id] = 'Present');

                const res = await teacherAttendanceApi.getByDate(date);
                res.data.forEach((a: any) => {
                    if (attMap[a.teacherId.toLowerCase()] !== undefined || attMap[a.teacherId] !== undefined) {
                        attMap[a.teacherId] = a.status;
                        attMap[a.teacherId.toLowerCase()] = a.status;
                    }
                });
            }
            setAttendance(attMap);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const statusConfig = {
        Present: { icon: <FiCheck />, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700', label: 'Présent' },
        Absent: { icon: <FiX />, color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700', label: 'Absent' },
        Late: { icon: <FiClock />, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700', label: 'En retard' },
        Excused: { icon: <FiAlertCircle />, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700', label: 'Excusé' },
    };

    const toggleStatus = (id: string) => {
        const order: AttStatus[] = ['Present', 'Absent', 'Late', 'Excused'];
        const currentId = Object.keys(attendance).find(k => k.toLowerCase() === id.toLowerCase()) || id;
        const current = attendance[currentId] || 'Present';
        const next = order[(order.indexOf(current) + 1) % order.length];
        setAttendance({ ...attendance, [currentId]: next });
    };

    const handleSave = async () => {
        try {
            const dateObj = new Date(date).toISOString();

            if (activeTab === 'students') {
                const records = students.map(s => ({
                    studentId: s.id,
                    date: dateObj,
                    status: attendance[s.id] || attendance[s.id.toLowerCase()] || 'Present',
                    notes: ''
                }));
                await attendanceApi.bulkMark({ date: dateObj, records });
            } else {
                const records = teachers.map(t => ({
                    teacherId: t.id,
                    date: dateObj,
                    status: attendance[t.id] || attendance[t.id.toLowerCase()] || 'Present',
                    notes: ''
                }));
                await teacherAttendanceApi.bulkMark({ date: dateObj, records });
            }

            toast.success('Présences enregistrées avec succès!');
        } catch (error) {
            toast.error('Erreur de sauvegarde...');
        }
    };

    const activeList = activeTab === 'students' ? students : teachers;

    const stats = useMemo(() => {
        let present = 0, absent = 0, late = 0, excused = 0;
        activeList.forEach((person) => {
            const targetId = Object.keys(attendance).find(k => k.toLowerCase() === person.id.toLowerCase()) || person.id;
            const status = attendance[targetId] || 'Present';
            if (status === 'Present') present++;
            else if (status === 'Absent') absent++;
            else if (status === 'Late') late++;
            else if (status === 'Excused') excused++;
        });
        return { present, absent, late, excused };
    }, [attendance, activeList]);

    if (loading) return <PageSkeleton variant="table" />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{t.common.attendance}</h1>
                    <p className="text-dark-400 mt-1">Marquage et reporting des présences</p>
                </div>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field w-full sm:w-auto" />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-dark-900 p-2 rounded-2xl border border-dark-100 dark:border-dark-800">
                <div className="flex gap-2 p-1 bg-dark-50 dark:bg-dark-800 rounded-xl w-full sm:w-auto overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'students' ? 'bg-white dark:bg-dark-900 text-primary-600 shadow-sm' : 'text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'}`}
                    >
                        <FiUsers size={16} /> Élèves
                    </button>
                    <button
                        onClick={() => setActiveTab('teachers')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'teachers' ? 'bg-white dark:bg-dark-900 text-blue-600 shadow-sm' : 'text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'}`}
                    >
                        <FiBriefcase size={16} /> Enseignants
                    </button>
                </div>

                {activeTab === 'students' && (
                    <select
                        value={selectedSession}
                        onChange={e => setSelectedSession(e.target.value)}
                        className="input-field bg-dark-50 dark:bg-dark-800 border-none w-full sm:w-auto font-medium shadow-none"
                    >
                        <option value="all">Toutes les séances de la journée</option>
                        {plannedSessions.map(s => (
                            <option key={s.id} value={s.id}>Séance {s.groupName} ({s.startTime?.substring(0, 5)})</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Stats */}
            <div className={`grid grid-cols-2 md:grid-cols-5 gap-4 animate-fade-in`}>
                <div className="glass-card p-4 text-center gradient-primary text-white border-none relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-20">
                        <FiUsers size={60} className="-mt-4 -mr-4" />
                    </div>
                    <p className="text-3xl font-black relative z-10">
                        {activeList.length > 0 ? Math.round((stats.present / activeList.length) * 100) : 0}%
                    </p>
                    <p className="text-sm font-medium text-white/80 relative z-10 mt-1">Taux de présence</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-green-500">{stats.present}</p>
                    <p className="text-sm font-medium text-dark-400">Présents</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-red-500">{stats.absent}</p>
                    <p className="text-sm font-medium text-dark-400">Absents</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-amber-500">{stats.late}</p>
                    <p className="text-sm font-medium text-dark-400">En retard</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-blue-500">{stats.excused}</p>
                    <p className="text-sm font-medium text-dark-400">Excusés</p>
                </div>
            </div>

            {/* Attendance List */}
            <div className="glass-card divide-y divide-dark-100 dark:divide-dark-700 min-h-[300px]">
                {loading ? (
                    <div className="flex justify-center items-center h-48 text-dark-400">Chargement...</div>
                ) : activeList.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-48 text-dark-400 text-sm">
                        <FiAlertCircle size={32} className="mb-2 opacity-50" />
                        {activeTab === 'students' ? 'Aucun élève prévu pour cette date/séance.' : 'Aucun enseignant assigné à une séance aujourd\'hui.'}
                    </div>
                ) : (
                    activeList.map((person) => {
                        const targetId = Object.keys(attendance).find(k => k.toLowerCase() === person.id.toLowerCase()) || person.id;
                        const status = attendance[targetId] || 'Present';
                        const config = statusConfig[status];
                        const name = person.fullName || person.name || `${person.firstName || ''} ${person.lastName || ''}`.trim();

                        return (
                            <div key={person.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${activeTab === 'students' ? 'gradient-primary' : 'bg-gradient-to-br from-blue-500 to-blue-600'}`}>
                                        {name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-dark-900 dark:text-white">{name}</p>
                                            {status === 'Absent' && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 uppercase">Alerte</span>
                                            )}
                                        </div>
                                        <p className="text-xs font-medium text-dark-400 uppercase tracking-wider mt-0.5">
                                            {activeTab === 'students' ? 'Élève' : (person.roles?.[0] || 'Enseignant')}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleStatus(person.id)}
                                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold shadow-sm transition-all duration-200 active:scale-95 ${config.color}`}
                                >
                                    {config.icon}
                                    {config.label}
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {activeList.length > 0 && !loading && (
                <div className="flex justify-end sticky bottom-6 z-10">
                    <button onClick={handleSave} className="btn-primary flex items-center gap-2 shadow-xl shadow-primary-500/20">
                        <FiCheck size={18} /> {t.common.save} les présences
                    </button>
                </div>
            )}
        </div>
    );
}
