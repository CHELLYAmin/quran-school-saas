'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    FiPlus, FiCalendar, FiUsers, FiPlay, FiCheckCircle, FiClock,
    FiBookOpen, FiX, FiSearch, FiChevronLeft, FiChevronRight,
    FiArrowRight, FiBarChart2, FiTrendingUp, FiSettings, FiTrash2, FiVideo
} from 'react-icons/fi';
import Link from 'next/link';
import { sessionApi, groupApi } from '@/lib/api/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════
type SessionStatus = 'Planned' | 'InProgress' | 'Completed' | 'Cancelled';
type ViewMode = 'day' | 'week' | 'month';
type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Dim … 6=Sam

interface TimeSlot {
    id: string;
    dayOfWeek: DayOfWeek;   // 0=Dim, 1=Lun, …
    startTime: string;
    endTime: string;
}

interface GroupConfig {
    id?: string;
    name: string;
    studentCount: number;
    slots: TimeSlot[];
}

interface Session {
    id: string;
    groupName?: string;
    teacherName?: string;
    date: string;           // YYYY-MM-DD
    startTime: string;
    endTime: string;
    status: SessionStatus;
    statusRaw?: number;
    objective: string;
    studentCount: number;
    presentCount: number;
    recitationCount: number;
    averageScore?: number;
    isOnline?: boolean;
    meetingUrl?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
const DAY_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const DAY_LABELS_FULL = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTH_LABELS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

function toDateStr(d: Date): string {
    return d.toISOString().slice(0, 10);
}
function addDays(d: Date, n: number): Date {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
}
function startOfWeek(d: Date): Date {
    const r = new Date(d);
    const day = r.getDay();
    // Start on Monday (EU style)
    const diff = day === 0 ? -6 : 1 - day;
    r.setDate(r.getDate() + diff);
    r.setHours(0, 0, 0, 0);
    return r;
}
function startOfMonth(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function isSameDay(a: Date, b: Date): boolean {
    return toDateStr(a) === toDateStr(b);
}
function formatShort(d: Date): string {
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
function formatFull(d: Date): string {
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA GENERATION — generates sessions from group slots
// ═══════════════════════════════════════════════════════════════════════════════
const INITIAL_GROUPS: GroupConfig[] = [
    {
        name: 'Groupe A - Hifz', studentCount: 8, slots: [
            { id: 's1', dayOfWeek: 1, startTime: '10:00', endTime: '12:00' },
            { id: 's2', dayOfWeek: 3, startTime: '10:00', endTime: '12:00' },
            { id: 's3', dayOfWeek: 5, startTime: '10:00', endTime: '12:00' },
        ]
    },
    {
        name: 'Groupe B - Tajwid', studentCount: 6, slots: [
            { id: 's4', dayOfWeek: 2, startTime: '14:00', endTime: '16:00' },
            { id: 's5', dayOfWeek: 4, startTime: '14:00', endTime: '16:00' },
        ]
    },
    {
        name: 'Groupe C - Revision', studentCount: 10, slots: [
            { id: 's6', dayOfWeek: 6, startTime: '09:00', endTime: '11:00' },
        ]
    },
];

const OBJECTIVES = [
    'Révision Sourate Al-Baqarah (versets 1-20)',
    'Mémorisation Al-Fatiha & début Al-Baqarah',
    'Règles du Noon Sakinah et Tanween',
    'Révision générale Juz Amma',
    'Lettres solaires et lunaires',
    'Suite Al-Baqarah (versets 21-40)',
    'Makhaarij al-Huroof (points d\'articulation)',
    'Idghaam et Ikhfaa',
    'Révision Sourate Al-Mulk',
    'Sourate Yasin — 1ère moitié',
];

function generateSessions(groups: GroupConfig[], weeksBack: number, weeksForward: number): Session[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = toDateStr(today);

    const start = addDays(startOfWeek(today), -weeksBack * 7);
    const end = addDays(startOfWeek(today), (weeksForward + 1) * 7);

    const sessions: Session[] = [];
    const pseudoGuid = (i: number) => `00000000-0000-0000-0000-${String(i).padStart(12, '0')}`;

    let idCounter = 1;

    for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
        const dayOfWeek = d.getDay() as DayOfWeek;
        const dateStr = toDateStr(d);

        for (const group of groups) {
            for (const slot of group.slots) {
                if (slot.dayOfWeek !== dayOfWeek) continue;

                const isPast = dateStr < todayStr;
                const isToday = dateStr === todayStr;
                const isFuture = dateStr > todayStr;

                let status: SessionStatus = 'Planned';
                let presentCount = 0;
                let recitationCount = 0;
                let averageScore: number | undefined;

                if (isPast) {
                    status = 'Completed';
                    presentCount = Math.max(group.studentCount - Math.floor(Math.random() * 2), group.studentCount - 1);
                    recitationCount = presentCount;
                    averageScore = 65 + Math.floor(Math.random() * 30);
                } else if (isToday) {
                    // First today session is InProgress, rest Planned
                    const todaySessions = sessions.filter(s => s.date === todayStr && s.groupName === group.name);
                    status = todaySessions.length === 0 ? 'InProgress' : 'Planned';
                    if (status === 'InProgress') {
                        presentCount = group.studentCount - Math.floor(Math.random() * 2);
                        recitationCount = Math.floor(presentCount * 0.5);
                        averageScore = 70 + Math.floor(Math.random() * 20);
                    }
                }

                sessions.push({
                    id: pseudoGuid(idCounter++),
                    groupName: group.name,
                    date: dateStr,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    status,
                    objective: OBJECTIVES[(idCounter - 1) % OBJECTIVES.length],
                    studentCount: group.studentCount,
                    presentCount,
                    recitationCount,
                    averageScore,
                });
            }
        }
    }
    return sessions;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATUS CONFIG
// ═══════════════════════════════════════════════════════════════════════════════
const STATUS_CFG: Record<SessionStatus, { label: string; dot: string; text: string; bg: string; border: string }> = {
    InProgress: { label: 'En cours', dot: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/15', border: 'border-blue-200 dark:border-blue-800' },
    Completed: { label: 'Terminée', dot: 'bg-green-500', text: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/15', border: 'border-green-200 dark:border-green-800' },
    Planned: { label: 'Planifiée', dot: 'bg-slate-400', text: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/30', border: 'border-slate-200 dark:border-slate-700' },
    Cancelled: { label: 'Annulée', dot: 'bg-red-500', text: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/15', border: 'border-red-200 dark:border-red-800' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SESSION CARD (compact, reused in all views)
// ═══════════════════════════════════════════════════════════════════════════════
function SessionCard({ session, onAssignClick }: { session: Session; onAssignClick?: (session: Session) => void }) {
    const cfg = STATUS_CFG[session.status] || STATUS_CFG['Planned'];
    const hasGroup = !!session.groupName;

    const content = (
        <>
            <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className={`text-xs font-bold truncate flex-1 ${!hasGroup ? 'text-orange-500' : 'text-dark-900 dark:text-white'}`}>
                    {hasGroup ? session.groupName : 'Groupe non assigné'}
                </p>
                <div className="flex items-center gap-1.5">
                    {session.isOnline && <FiVideo size={12} className="text-blue-500" title="Séance en ligne" />}
                    <span className={`flex-shrink-0 w-2 h-2 rounded-full ${cfg.dot}`} title={cfg.label} />
                </div>
            </div>
            <p className="text-[11px] text-dark-500 dark:text-dark-400 line-clamp-1 mb-1.5">{session.objective}</p>
            <div className="flex flex-wrap items-center justify-between mt-auto pt-1 border-t border-dark-100/50 dark:border-dark-800/50 gap-1">
                <span className="text-[10px] text-dark-400 flex items-center gap-0.5 shrink-0">
                    <FiClock size={9} /> {session.startTime}–{session.endTime}
                </span>

                {!hasGroup && onAssignClick ? (
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAssignClick(session); }}
                        className="text-[10px] font-bold text-orange-600 dark:text-orange-400 flex items-center gap-0.5 hover:underline shrink-0">
                        Assigner <FiChevronRight size={8} />
                    </button>
                ) : session.status === 'InProgress' ? (
                    session.isOnline ? (
                        <Link href={`/dashboard/sessions/${session.id}/live`} className="text-[10px] font-bold text-blue-600 flex items-center gap-0.5 shrink-0 hover:underline">
                            <FiVideo size={9} /> Rejoindre Live
                        </Link>
                    ) : (
                        <span className="text-[10px] font-bold text-blue-600 flex items-center gap-0.5 shrink-0">
                            <FiPlay size={9} /> Continuer
                        </span>
                    )
                ) : session.status === 'Planned' ? (
                    <span className="text-[10px] font-bold text-primary-600 flex items-center gap-0.5 shrink-0">
                        <FiArrowRight size={9} /> Commencer
                    </span>
                ) : (
                    <span className="text-[10px] font-bold text-green-600 flex items-center gap-0.5 shrink-0">
                        {session.averageScore !== undefined ? `${session.averageScore}%` : '✓'} <FiChevronRight size={8} />
                    </span>
                )}
            </div>
        </>
    );

    if (!hasGroup && onAssignClick) {
        return (
            <div className={`block rounded-xl border ${cfg.border} ${cfg.bg} p-2.5 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col`}>
                {content}
            </div>
        );
    }


    return (
        <Link href={`/dashboard/sessions/${session.id}`}
            className={`block rounded-xl border ${cfg.border} ${cfg.bg} p-2.5 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer group flex flex-col h-full`}>
            {content}
        </Link>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function SessionsPage() {
    const router = useRouter();
    const [groups, setGroups] = useState<GroupConfig[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | SessionStatus>('all');
    const [loading, setLoading] = useState(true);

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSlotsModal, setShowSlotsModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [sessionToAssign, setSessionToAssign] = useState<Session | null>(null);
    const [selectedGroupToAssign, setSelectedGroupToAssign] = useState('');

    const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

    // ── Fetch data from backend ─────────────────────────────────────────
    const loadData = async () => {
        setLoading(true);
        try {
            const [sessRes, grpRes] = await Promise.all([
                sessionApi.getAll(),
                groupApi.getAll()
            ]);

            setGroups(grpRes.data.map((g: any) => ({
                id: g.id,
                name: g.name,
                studentCount: g.students?.length || 0,
                slots: []
            })));

            const mappedSessions = sessRes.data.map((s: any) => ({
                id: s.id,
                groupName: s.groupName,
                teacherName: s.teacherName,
                date: s.date.split('T')[0],
                startTime: s.startTime,
                endTime: s.endTime,
                status: (s.status in STATUS_CFG ? s.status : 'Planned') as SessionStatus,
                statusRaw: s.status,
                objective: s.sessionObjective || 'Séance classique',
                studentCount: s.attendances?.length || 0,
                presentCount: s.attendances?.filter((a: any) => a.status === 'Present' || a.status === 'Late' || a.status === 1 || a.status === 3).length || 0,
                recitationCount: s.recitations?.length || 0,
                isOnline: s.isOnline,
                meetingUrl: s.meetingUrl
            }));

            setSessions(mappedSessions);
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors du chargement des données. Affichage des données factices.');
            // Fallback to initial mock if API fails
            setGroups(INITIAL_GROUPS);
            setSessions(generateSessions(INITIAL_GROUPS, 4, 4));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // ── Date navigation ───────────────────────────────────────────────────────
    const navigate = useCallback((dir: -1 | 1) => {
        setCurrentDate(prev => {
            if (viewMode === 'day') return addDays(prev, dir);
            if (viewMode === 'week') return addDays(prev, dir * 7);
            return new Date(prev.getFullYear(), prev.getMonth() + dir, 1);
        });
    }, [viewMode]);

    const goToToday = () => setCurrentDate(new Date());

    // ── Period label ──────────────────────────────────────────────────────────
    const periodLabel = useMemo(() => {
        if (viewMode === 'day') return formatFull(currentDate);
        if (viewMode === 'week') {
            const ws = startOfWeek(currentDate);
            const we = addDays(ws, 6);
            return `${formatShort(ws)} – ${formatShort(we)} ${we.getFullYear()}`;
        }
        return `${MONTH_LABELS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }, [currentDate, viewMode]);

    // ── Filter sessions for current period ────────────────────────────────────
    const periodSessions = useMemo(() => {
        let start: Date, end: Date;
        if (viewMode === 'day') {
            start = new Date(currentDate); start.setHours(0, 0, 0, 0);
            end = new Date(start);
        } else if (viewMode === 'week') {
            start = startOfWeek(currentDate);
            end = addDays(start, 6);
        } else {
            start = startOfMonth(currentDate);
            end = endOfMonth(currentDate);
        }
        const startStr = toDateStr(start), endStr = toDateStr(end);
        let list = sessions.filter(s => s.date >= startStr && s.date <= endStr);
        if (statusFilter !== 'all') list = list.filter(s => s.status === statusFilter);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(s => (s.groupName?.toLowerCase().includes(q) || s.objective?.toLowerCase().includes(q)));
        }
        return list;
    }, [sessions, currentDate, viewMode, statusFilter, searchQuery]);

    // ── Stats ─────────────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const completed = periodSessions.filter(s => s.status === 'Completed');
        const avgScore = completed.length > 0
            ? Math.round(completed.reduce((n, s) => n + (s.averageScore ?? 0), 0) / completed.length)
            : null;
        return {
            total: periodSessions.length,
            inProgress: periodSessions.filter(s => s.status === 'InProgress').length,
            completed: completed.length,
            planned: periodSessions.filter(s => s.status === 'Planned').length,
            avgScore,
        };
    }, [periodSessions]);

    // ── Week view data ────────────────────────────────────────────────────────
    const weekDays = useMemo(() => {
        if (viewMode !== 'week') return [];
        const ws = startOfWeek(currentDate);
        return Array.from({ length: 7 }, (_, i) => {
            const d = addDays(ws, i);
            const dateStr = toDateStr(d);
            return {
                date: d,
                dateStr,
                label: DAY_LABELS[d.getDay()],
                dayNum: d.getDate(),
                isToday: isSameDay(d, today),
                sessions: periodSessions.filter(s => s.date === dateStr).sort((a, b) => a.startTime.localeCompare(b.startTime)),
            };
        });
    }, [currentDate, viewMode, periodSessions, today]);

    // ── Month view data ───────────────────────────────────────────────────────
    const monthWeeks = useMemo(() => {
        if (viewMode !== 'month') return [];
        const ms = startOfMonth(currentDate);
        const me = endOfMonth(currentDate);
        const calStart = startOfWeek(ms);
        const weeks: { date: Date; dateStr: string; dayNum: number; isToday: boolean; isCurrentMonth: boolean; sessions: Session[] }[][] = [];
        let current = new Date(calStart);
        while (current <= me || weeks.length < 5) {
            const week = Array.from({ length: 7 }, (_, i) => {
                const d = addDays(current, i);
                const dateStr = toDateStr(d);
                return {
                    date: d,
                    dateStr,
                    dayNum: d.getDate(),
                    isToday: isSameDay(d, today),
                    isCurrentMonth: d.getMonth() === currentDate.getMonth(),
                    sessions: periodSessions.filter(s => s.date === dateStr),
                };
            });
            weeks.push(week);
            current = addDays(current, 7);
            if (weeks.length >= 6) break;
        }
        return weeks;
    }, [currentDate, viewMode, periodSessions, today]);

    // ── Create session ────────────────────────────────────────────────────────
    const [newGroup, setNewGroup] = useState('');
    const [newDate, setNewDate] = useState(toDateStr(new Date()));
    const [newStartTime, setNewStartTime] = useState('10:00');
    const [newEndTime, setNewEndTime] = useState('12:00');
    const [newObjective, setNewObjective] = useState('');
    const [newIsOnline, setNewIsOnline] = useState(false);

    const handleCreateSession = async () => {
        if (!newGroup || !newObjective) return;
        const group = groups.find(g => g.name === newGroup);
        if (!group) return;

        try {
            await sessionApi.create({
                groupId: group.id || '', // use id from the actual group obj
                date: new Date(newDate).toISOString(),
                startTime: newStartTime,
                endTime: newEndTime,
                sessionObjective: newObjective,
                isOnline: newIsOnline
            });
            toast.success('Séance planifiée');
            setShowCreateModal(false);
            setNewObjective('');
            loadData();
        } catch (error) {
            toast.error('Erreur lors de la création');
            // Mock fallback if API is not working
            const s: Session = {
                id: String(Date.now()),
                groupName: newGroup,
                date: newDate,
                startTime: newStartTime,
                endTime: newEndTime,
                status: 'Planned',
                objective: newObjective,
                studentCount: group.studentCount ?? 0,
                presentCount: 0,
                recitationCount: 0,
            };
            setSessions(prev => [...prev, s]);
            setShowCreateModal(false);
            setNewObjective('');
        }
    };

    const handleAssignGroup = async () => {
        if (!sessionToAssign || !selectedGroupToAssign) return;
        const group = groups.find(g => g.id === selectedGroupToAssign);
        if (!group) return;

        try {
            await sessionApi.assignGroup(sessionToAssign.id, group.id || '');
            toast.success('Groupe assigné avec succès !');
            setShowAssignModal(false);
            setSelectedGroupToAssign('');
            setSessionToAssign(null);
            loadData();
        } catch (error: any) {
            console.error("Assign error", error);
            const msg = error.response?.data?.message || 'Erreur lors de l\'assignation';
            toast.error(msg);
        }
    }

    // When group selected, auto-fill next slot time
    useEffect(() => {
        if (!newGroup) return;
        const group = groups.find(g => g.name === newGroup);
        if (group && group.slots.length > 0) {
            setNewStartTime(group.slots[0].startTime);
            setNewEndTime(group.slots[0].endTime);
        }
    }, [newGroup, groups]);

    // ── Slot management ───────────────────────────────────────────────────────
    const [editingGroup, setEditingGroup] = useState<string | null>(null);
    const [newSlotDay, setNewSlotDay] = useState<DayOfWeek>(1);
    const [newSlotStart, setNewSlotStart] = useState('10:00');
    const [newSlotEnd, setNewSlotEnd] = useState('12:00');

    const addSlot = () => {
        if (!editingGroup) return;
        setGroups(prev => prev.map(g => g.name === editingGroup ? {
            ...g,
            slots: [...g.slots, { id: String(Date.now()), dayOfWeek: newSlotDay, startTime: newSlotStart, endTime: newSlotEnd }]
        } : g));
    };

    const removeSlot = (groupName: string, slotId: string) => {
        setGroups(prev => prev.map(g => g.name === groupName ? {
            ...g, slots: g.slots.filter(s => s.id !== slotId)
        } : g));
    };

    // ════════════════════════════════════════════════════════════════════════════
    // RENDER
    // ════════════════════════════════════════════════════════════════════════════
    if (loading) return <PageSkeleton variant="cards" />;

    return (
        <div className="space-y-5 max-w-7xl mx-auto">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FiBookOpen className="text-primary-600" /> Gestion des Séances
                    </h1>
                    <p className="text-dark-500 text-sm mt-0.5">Planifiez, animez et suivez vos séances</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowSlotsModal(true)}
                        className="btn btn-outline flex items-center gap-2 text-sm px-4 py-2 rounded-xl">
                        <FiSettings size={14} /> Créneaux
                    </button>
                    <button onClick={() => setShowCreateModal(true)}
                        className="btn btn-primary flex items-center gap-2 text-sm px-5 py-2 rounded-xl shadow-lg shadow-primary-500/20">
                        <FiPlus size={14} /> Nouvelle Séance
                    </button>
                </div>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                    { label: 'Total', value: stats.total, color: 'text-dark-700 dark:text-dark-200', icon: <FiCalendar size={14} /> },
                    { label: 'En cours', value: stats.inProgress, color: 'text-blue-600', icon: <FiPlay size={14} /> },
                    { label: 'Planifiées', value: stats.planned, color: 'text-slate-500', icon: <FiClock size={14} /> },
                    { label: 'Terminées', value: stats.completed, color: 'text-green-600', icon: <FiCheckCircle size={14} /> },
                    { label: 'Score moyen', value: stats.avgScore !== null ? `${stats.avgScore}%` : '—', color: stats.avgScore && stats.avgScore >= 80 ? 'text-green-600' : 'text-orange-500', icon: <FiTrendingUp size={14} /> },
                ].map(s => (
                    <div key={s.label} className="bg-white dark:bg-dark-900 rounded-xl border border-dark-100 dark:border-dark-800 py-3 px-3 flex items-center gap-2.5">
                        <span className={s.color}>{s.icon}</span>
                        <div>
                            <p className={`text-lg font-bold leading-none ${s.color}`}>{s.value}</p>
                            <p className="text-[10px] text-dark-400 mt-0.5">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Navigation bar ── */}
            <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 p-2 sm:p-3 flex flex-col lg:flex-row items-center justify-between gap-3">
                {/* View tabs */}
                <div className="flex bg-dark-50 dark:bg-dark-800 rounded-xl p-0.5 gap-0.5 w-full sm:w-auto overflow-x-auto shrink-0 justify-center">
                    {([
                        { key: 'day' as ViewMode, label: 'Jour' },
                        { key: 'week' as ViewMode, label: 'Semaine' },
                        { key: 'month' as ViewMode, label: 'Mois' },
                    ]).map(v => (
                        <button key={v.key} onClick={() => setViewMode(v.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === v.key ? 'bg-white dark:bg-dark-700 shadow-sm text-primary-600' : 'text-dark-400 hover:text-dark-600'}`}>
                            {v.label}
                        </button>
                    ))}
                </div>

                {/* Period nav */}
                <div className="flex items-center justify-center gap-1 sm:gap-2 w-full sm:w-auto">
                    <button onClick={() => navigate(-1)} className="p-1.5 sm:p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition shrink-0"><FiChevronLeft size={16} /></button>
                    <span className="text-sm font-semibold text-dark-700 dark:text-dark-300 min-w-[140px] sm:min-w-[180px] text-center truncate">{periodLabel}</span>
                    <button onClick={() => navigate(1)} className="p-1.5 sm:p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition shrink-0"><FiChevronRight size={16} /></button>
                    <button onClick={goToToday} className="text-[10px] sm:text-xs font-bold text-primary-600 hover:text-primary-700 px-2 py-1 sm:py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition shrink-0">
                        Aujourd'hui
                    </button>
                </div>

                {/* Search + filter */}
                <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 mt-2 lg:mt-0">
                    <div className="relative flex-1 lg:flex-none">
                        <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dark-400" size={12} />
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Rechercher…" className="input pl-8 w-full lg:w-40 text-xs py-1.5" />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
                        className="input text-xs py-1.5 w-full lg:w-28 flex-1 lg:flex-none">
                        <option value="all">Toutes</option>
                        <option value="InProgress">En cours</option>
                        <option value="Planned">Planifiées</option>
                        <option value="Completed">Terminées</option>
                    </select>
                </div>
            </div>

            {/* ═══════════ WEEK VIEW ═══════════ */}
            {viewMode === 'week' && (
                <div className="overflow-x-auto pb-4">
                    <div className="grid grid-cols-7 gap-2 min-w-[800px]">
                        {weekDays.map(day => (
                            <div key={day.dateStr} className={`rounded-xl border transition-all ${day.isToday ? 'border-primary-300 dark:border-primary-700 ring-1 ring-primary-200 dark:ring-primary-800' : 'border-dark-100 dark:border-dark-800'} bg-white dark:bg-dark-900 min-h-[140px]`}>
                                {/* Day header */}
                                <div className={`text-center py-2 border-b ${day.isToday ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-800' : 'bg-dark-50 dark:bg-dark-800/50 border-dark-100 dark:border-dark-800'} rounded-t-xl`}>
                                    <p className={`text-xs font-bold ${day.isToday ? 'text-primary-600' : 'text-dark-400'}`}>{day.label}</p>
                                    <p className={`text-lg font-bold leading-none mt-0.5 ${day.isToday ? 'text-primary-700' : 'text-dark-700 dark:text-dark-300'}`}>{day.dayNum}</p>
                                </div>
                                <div className="p-1.5 space-y-1.5">
                                    {day.sessions.length === 0 ? (
                                        <p className="text-center text-[10px] text-dark-300 py-4">—</p>
                                    ) : day.sessions.map(s => (
                                        <SessionCard
                                            key={s.id}
                                            session={s}
                                            onAssignClick={(sess) => {
                                                setSessionToAssign(sess);
                                                setShowAssignModal(true);
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══════════ DAY VIEW ═══════════ */}
            {viewMode === 'day' && (
                <div className="space-y-3">
                    {periodSessions.length === 0 ? (
                        <div className="card text-center py-16">
                            <FiCalendar className="mx-auto text-dark-300 mb-3" size={40} />
                            <p className="text-dark-500 font-medium">Aucune séance pour ce jour</p>
                        </div>
                    ) : periodSessions
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map(session => {
                            const cfg = STATUS_CFG[session.status];
                            return (
                                <div key={session.id} className={`card p-0 overflow-hidden hover:shadow-lg transition-all`}>
                                    <div className="flex">
                                        <div className={`w-1.5 ${cfg.dot} flex-shrink-0`} />
                                        <div className="flex-1 p-4 sm:p-5">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-bold">{session.groupName}</h3>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border}`}>{cfg.label}</span>
                                                </div>
                                                <span className="text-sm text-dark-400 flex items-center gap-1 shrink-0"><FiClock size={12} />{session.startTime}–{session.endTime}</span>
                                            </div>
                                            <p className="text-sm text-dark-500 mb-3">{session.objective}</p>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 pt-3 border-t border-dark-50 dark:border-dark-800">
                                                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-dark-400">
                                                    <span className="flex items-center gap-1"><FiUsers size={11} /> {session.presentCount}/{session.studentCount}</span>
                                                    {session.recitationCount > 0 && <span>{session.recitationCount} récit.</span>}
                                                    {session.averageScore !== undefined && (
                                                        <span className={`font-bold ${session.averageScore >= 80 ? 'text-green-600' : 'text-orange-500'}`}>{session.averageScore}%</span>
                                                    )}
                                                </div>
                                                <div className="flex shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                                                    {session.status === 'InProgress' && !!session.groupName ? (
                                                        <Link href={`/dashboard/sessions/${session.id}`} className="btn btn-primary text-xs px-4 py-1.5 flex flex-1 sm:flex-none justify-center items-center gap-1 whitespace-nowrap"><FiPlay size={11} className="shrink-0" /> Continuer</Link>
                                                    ) : session.status === 'Planned' && !!session.groupName ? (
                                                        <Link href={`/dashboard/sessions/${session.id}`} className="btn btn-outline text-xs px-4 py-1.5 flex flex-1 sm:flex-none justify-center items-center gap-1 whitespace-nowrap"><FiArrowRight size={11} className="shrink-0" /> Commencer</Link>
                                                    ) : !session.groupName ? (
                                                        <button onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setSessionToAssign(session);
                                                            setShowAssignModal(true);
                                                        }} className="btn btn-primary text-xs px-4 py-1.5 flex flex-1 sm:flex-none justify-center items-center gap-1">Assigner</button>
                                                    ) : (
                                                        <Link href={`/dashboard/sessions/${session.id}/report`} className="text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg flex flex-1 sm:flex-none justify-center items-center gap-1 hover:bg-primary-100 transition"><FiBarChart2 size={11} /> Rapport</Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            )}

            {/* ═══════════ MONTH VIEW ═══════════ */}
            {viewMode === 'month' && (
                <div className="bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <div className="min-w-[800px]">
                            {/* Header row */}
                            <div className="grid grid-cols-7 bg-dark-50 dark:bg-dark-800/50 border-b border-dark-100 dark:border-dark-800">
                                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                                    <div key={d} className="text-center py-2 text-xs font-bold text-dark-400">{d}</div>
                                ))}
                            </div>
                            {monthWeeks.map((week, wi) => (
                                <div key={wi} className="grid grid-cols-7 border-b border-dark-50 dark:border-dark-800 last:border-b-0">
                                    {week.map(day => (
                                        <div key={day.dateStr}
                                            onClick={() => { setCurrentDate(day.date); setViewMode('day'); }}
                                            className={`min-h-[80px] p-1.5 border-r border-dark-50 dark:border-dark-800 last:border-r-0 cursor-pointer transition-colors hover:bg-primary-50/50 dark:hover:bg-primary-900/10 ${!day.isCurrentMonth ? 'opacity-30' : ''} ${day.isToday ? 'bg-primary-50/80 dark:bg-primary-900/15' : ''}`}>
                                            <p className={`text-xs font-bold mb-1 ${day.isToday ? 'text-primary-600' : 'text-dark-500'}`}>{day.dayNum}</p>
                                            <div className="space-y-0.5">
                                                {day.sessions.slice(0, 3).map(s => (
                                                    <div
                                                        key={s.id}
                                                        className={`text-[9px] px-1 py-0.5 rounded ${STATUS_CFG[s.status].bg} ${STATUS_CFG[s.status].text} truncate font-medium ${!s.groupName ? 'cursor-pointer hover:ring-1 hover:ring-orange-400' : ''}`}
                                                        onClick={(e) => {
                                                            if (!s.groupName) {
                                                                e.stopPropagation();
                                                                setSessionToAssign(s);
                                                                setShowAssignModal(true);
                                                            }
                                                        }}
                                                    >
                                                        {s.groupName ? s.groupName.replace('Groupe ', '') : 'Non assigné'}
                                                    </div>
                                                ))}
                                                {day.sessions.length > 3 && (
                                                    <p className="text-[9px] text-dark-400 text-center">+{day.sessions.length - 3}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Assign Group Modal ═══ */}
            {showAssignModal && sessionToAssign && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in" onClick={() => setShowAssignModal(false)}>
                    <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 border border-dark-100 dark:border-dark-800 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b border-dark-100 dark:border-dark-800 flex items-center justify-between">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-white"><FiUsers size={14} /></div>
                                Assigner un groupe
                            </h2>
                            <button onClick={() => setShowAssignModal(false)} className="p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800"><FiX /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="label text-sm">Choisissez le groupe</label>
                                <select value={selectedGroupToAssign} onChange={e => setSelectedGroupToAssign(e.target.value)} className="input w-full text-sm">
                                    <option value="">-- Sélectionner --</option>
                                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
                            <div className="text-xs text-dark-500 bg-dark-50 dark:bg-dark-800 p-2 rounded-md">
                                <p><strong>Objectif:</strong> {sessionToAssign.objective}</p>
                                <p><strong>Date:</strong> {sessionToAssign.date} à {sessionToAssign.startTime}</p>
                            </div>
                        </div>
                        <div className="p-5 pt-0 flex gap-3">
                            <button onClick={() => setShowAssignModal(false)} className="flex-1 btn btn-ghost text-sm">Annuler</button>
                            <button onClick={handleAssignGroup} disabled={!selectedGroupToAssign}
                                className="flex-1 btn btn-primary text-sm disabled:opacity-40">Confirmer</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Create Session Modal ═══ */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-dark-100 dark:border-dark-800 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b border-dark-100 dark:border-dark-800 flex items-center justify-between">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-white"><FiPlus size={14} /></div>
                                Nouvelle Séance
                            </h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800"><FiX /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="label text-sm">Groupe</label>
                                <select value={newGroup} onChange={e => setNewGroup(e.target.value)} className="input w-full text-sm">
                                    <option value="">Sélectionnez un groupe</option>
                                    {groups.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label text-sm">Date</label>
                                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="input w-full text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label text-sm">Début</label>
                                    <input type="time" value={newStartTime} onChange={e => setNewStartTime(e.target.value)} className="input w-full text-sm" />
                                </div>
                                <div>
                                    <label className="label text-sm">Fin</label>
                                    <input type="time" value={newEndTime} onChange={e => setNewEndTime(e.target.value)} className="input w-full text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="label text-sm">Objectif</label>
                                <textarea value={newObjective} onChange={e => setNewObjective(e.target.value)} rows={2}
                                    className="input w-full text-sm resize-none" placeholder="Ex : Révision des versets 1-20…" />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800">
                                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                    <FiUsers size={16} />
                                    <span className="text-sm font-semibold">Séance en ligne (Virtual Classroom)</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={newIsOnline} onChange={e => setNewIsOnline(e.target.checked)} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-dark-200 peer-focus:outline-none rounded-full peer dark:bg-dark-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                </label>
                            </div>
                        </div>
                        <div className="p-5 pt-0 flex gap-3">
                            <button onClick={() => setShowCreateModal(false)} className="flex-1 btn btn-ghost text-sm">Annuler</button>
                            <button onClick={handleCreateSession} disabled={!newGroup || !newObjective}
                                className="flex-1 btn btn-primary text-sm disabled:opacity-40">Créer</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Slot Management Modal ═══ */}
            {showSlotsModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in" onClick={() => setShowSlotsModal(false)}>
                    <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-dark-100 dark:border-dark-800 max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b border-dark-100 dark:border-dark-800 flex items-center justify-between flex-shrink-0">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <FiSettings className="text-primary-600" /> Créneaux Récurrents
                            </h2>
                            <button onClick={() => setShowSlotsModal(false)} className="p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800"><FiX /></button>
                        </div>
                        <div className="overflow-y-auto flex-1 p-5 space-y-6">
                            {groups.map(group => (
                                <div key={group.name}>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-sm">{group.name}</h3>
                                        <span className="text-xs text-dark-400">{group.slots.length} créneau(x)</span>
                                    </div>

                                    {/* Existing slots */}
                                    <div className="space-y-1.5 mb-3">
                                        {group.slots.length === 0 ? (
                                            <p className="text-xs text-dark-400 italic py-2">Aucun créneau défini</p>
                                        ) : group.slots.map(slot => (
                                            <div key={slot.id} className="flex items-center justify-between bg-dark-50 dark:bg-dark-800 rounded-xl px-3 py-2">
                                                <div className="flex items-center gap-3 text-sm">
                                                    <span className="font-bold text-primary-600 w-12">{DAY_LABELS[slot.dayOfWeek]}</span>
                                                    <span className="text-dark-600 dark:text-dark-400">{slot.startTime} – {slot.endTime}</span>
                                                </div>
                                                <button onClick={() => removeSlot(group.name, slot.id)}
                                                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors">
                                                    <FiTrash2 size={13} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add slot */}
                                    {editingGroup === group.name ? (
                                        <div className="flex items-center gap-2 bg-primary-50 dark:bg-primary-900/10 p-2 rounded-xl border border-primary-100 dark:border-primary-800">
                                            <select value={newSlotDay} onChange={e => setNewSlotDay(Number(e.target.value) as DayOfWeek)}
                                                className="input text-xs py-1 px-2 w-20">
                                                {DAY_LABELS.map((l, i) => <option key={i} value={i}>{l}</option>)}
                                            </select>
                                            <input type="time" value={newSlotStart} onChange={e => setNewSlotStart(e.target.value)} className="input text-xs py-1 px-2 w-24" />
                                            <span className="text-dark-400 text-xs">–</span>
                                            <input type="time" value={newSlotEnd} onChange={e => setNewSlotEnd(e.target.value)} className="input text-xs py-1 px-2 w-24" />
                                            <button onClick={() => { addSlot(); setEditingGroup(null); }}
                                                className="btn btn-primary text-xs py-1 px-3">OK</button>
                                            <button onClick={() => setEditingGroup(null)}
                                                className="text-xs text-dark-400 hover:text-dark-600"><FiX size={14} /></button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setEditingGroup(group.name)}
                                            className="text-xs text-primary-600 font-bold flex items-center gap-1 hover:text-primary-700 transition-colors">
                                            <FiPlus size={12} /> Ajouter un créneau
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-dark-100 dark:border-dark-800 flex-shrink-0">
                            <p className="text-xs text-dark-400 text-center">Les séances sont générées automatiquement à partir de ces créneaux</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
