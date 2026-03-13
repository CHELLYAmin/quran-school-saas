'use client';
import PageSkeleton from '@/components/ui/PageSkeleton';

import { useEffect, useState } from 'react';
import { useAuthStore, useUIStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/translations';
import { FiClock, FiMapPin } from 'react-icons/fi';
import { scheduleApi, groupApi, sessionApi } from '@/lib/api/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';

const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

const fallbackSchedule = [
    { id: '1', groupName: 'Al-Fatiha', dayOfWeek: 1, startTime: '09:00', endTime: '11:00', roomName: 'Salle 1', color: 'bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-200' },
    { id: '2', groupName: 'Al-Baqara', dayOfWeek: 1, startTime: '14:00', endTime: '16:00', roomName: 'Salle 2', color: 'bg-accent-100 dark:bg-accent-900/40 text-accent-800 dark:text-accent-200' },
    { id: '3', groupName: 'Al-Fatiha', dayOfWeek: 3, startTime: '09:00', endTime: '11:00', roomName: 'Salle 1', color: 'bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-200' },
];

export default function SchedulePage() {
    const { user } = useAuthStore();
    const { locale } = useUIStore();
    const { t } = useTranslation(locale);

    const [scheduleList, setScheduleList] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (user) loadData();
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);
            
            // We use Promise.allSettled to avoid failing everything if one fails
            const [schedResult, groupResult] = await Promise.allSettled([
                scheduleApi.getAll(),
                groupApi.getAll()
            ]);

            let scheds: any[] = [];
            if (schedResult.status === 'fulfilled') {
                scheds = schedResult.value.data;
            } else {
                console.error('Failed to load schedules', schedResult.reason);
                const status = (schedResult.reason as any).status || 'Inconnu';
                toast.error(`Erreur de chargement du planning (Code ${status})`);
            }

            if (groupResult.status === 'fulfilled') {
                setGroups(groupResult.value.data);
            } else {
                console.warn('Failed to load groups list (RBAC?)', groupResult.reason);
                // Not a critical error for students
            }

            // Add visual colors mapped to group IDs
            const colors = ['primary', 'accent', 'indigo', 'rose', 'emerald', 'amber'];
            const colorMap = new Map();
            let idx = 0;

            const groupedScheds = scheds.map((s: any) => {
                if (!colorMap.has(s.groupId)) {
                    colorMap.set(s.groupId, colors[idx % colors.length]);
                    idx++;
                }
                const clr = colorMap.get(s.groupId);
                return {
                    ...s,
                    color: `bg-${clr}-100 dark:bg-${clr}-900/40 text-${clr}-800 dark:text-${clr}-200`
                };
            });

            if (groupedScheds.length > 0) {
                setScheduleList(groupedScheds);
            } else if (schedResult.status === 'rejected') {
                setScheduleList(fallbackSchedule);
            }
        } catch (error) {
            console.error(error);
            toast.error('Erreur de connexion.');
            setScheduleList(fallbackSchedule);
        } finally {
            setLoading(false);
        }
    };

    const getDayName = (dayOfWeek: number) => {
        const d = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // map 1=Monday
        return days[d] || days[0];
    };

    const getScheduleForSlot = (dayName: string, hourStr: string) => {
        return scheduleList.find(s => {
            const dn = getDayName(s.dayOfWeek);
            const sh = s.startTime.substring(0, 5); // handle "09:00:00" mapping to "09:00"
            return dn === dayName && sh === hourStr;
        });
    };

    const getSpan = (start: string, end: string) => {
        const startH = parseInt(start.split(':')[0]);
        const endH = parseInt(end.split(':')[0]);
        return endH - startH;
    };

    if (loading) return <PageSkeleton variant="calendar" />;

    const isTeacher = user?.roles?.some(r => r === UserRole.Teacher || r === UserRole.Admin || r === UserRole.Examiner);

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 rounded-[2.5rem] p-8 sm:p-10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 dark:bg-primary-900/10 rounded-full blur-3xl -z-0" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-dark-900 dark:text-white tracking-tight">{t.common.schedule}</h1>
                    <p className="text-dark-500 mt-2 font-medium">Planning hebdomadaire interactif</p>
                </div>
            </div>

            {/* Calendar Grid Container */}
            <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] p-6 shadow-xl border border-dark-100 dark:border-dark-800 overflow-hidden">
                <div className="overflow-x-auto pb-4">
                    <div className="min-w-[1000px]">
                        {/* Header Days */}
                        <div className="grid grid-cols-8 border-b-2 border-dark-100 dark:border-dark-800 mb-4 sticky top-0 bg-white/90 dark:bg-dark-900/90 backdrop-blur-md z-20">
                            <div className="p-4" />
                            {days.map(day => (
                                <div key={day} className="p-4 py-6 text-center text-xs font-extrabold text-dark-500 dark:text-dark-400 uppercase tracking-widest">{day}</div>
                            ))}
                        </div>

                        {/* Time slots rows */}
                        <div className="relative">
                            {hours.map((hour, i) => (
                                <div key={hour} className="grid grid-cols-8 relative group">
                                    <div className="p-3 text-xs font-semibold text-dark-400 dark:text-dark-500 border-r border-dark-100 dark:border-dark-800 h-[80px] flex items-start justify-center pt-2">
                                        {hour}
                                    </div>

                                    {/* Vertical Day Columns for the grid background */}
                                    {days.map(day => {
                                        const event = getScheduleForSlot(day, hour);
                                        const isOccupied = scheduleList.some(s => {
                                            const dn = getDayName(s.dayOfWeek);
                                            if (dn !== day) return false;
                                            const sH = parseInt(s.startTime.split(':')[0]);
                                            const eH = parseInt(s.endTime.split(':')[0]);
                                            const cH = parseInt(hour.split(':')[0]);
                                            return cH > sH && cH < eH;
                                        });

                                        return (
                                            <div
                                                key={`${day}-${hour}`}
                                                className={`
                                                    border-r border-b border-dark-50 dark:border-dark-800/50 
                                                    transition-colors group-hover:bg-primary-50/30 dark:group-hover:bg-primary-900/10
                                                    ${i === hours.length - 1 ? 'border-b-0' : ''}
                                                    ${isOccupied ? 'opacity-50' : ''}
                                                `}
                                            >
                                                {/* Event Card */}
                                                {event && (
                                                    <div
                                                        onClick={async () => {
                                                            if (!isTeacher) return; // Only teachers can open sessions from schedule
                                                            try {
                                                                const toastId = toast.loading('Ouverture de la séance...');

                                                                const today = new Date();
                                                                const currentDayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
                                                                const diff = event.dayOfWeek - currentDayOfWeek;
                                                                const targetDate = new Date(today);
                                                                targetDate.setDate(today.getDate() + diff);

                                                                const targetDateStr = targetDate.toISOString().split('T')[0];
                                                                const startPrefix = event.startTime.substring(0, 5);

                                                                const idToSearch = event.groupId || event.group?.id;
                                                                const res = await sessionApi.getAll();
                                                                const sessions = res.data;
                                                                const existing = sessions.find((s: any) =>
                                                                    s.groupId === idToSearch &&
                                                                    new Date(s.date).toISOString().split('T')[0] === targetDateStr &&
                                                                    s.startTime.substring(0, 5) === startPrefix
                                                                );

                                                                toast.dismiss(toastId);

                                                                if (existing) {
                                                                    router.push(`/dashboard/sessions/${existing.id}`);
                                                                } else {
                                                                    const createToastId = toast.loading('Création automatique...');
                                                                    const createRes = await sessionApi.create({
                                                                        groupId: idToSearch,
                                                                        date: targetDate.toISOString(),
                                                                        startTime: startPrefix,
                                                                        endTime: event.endTime.substring(0, 5),
                                                                        sessionObjective: `Séance du ${targetDate.toLocaleDateString('fr-FR')}`
                                                                    });
                                                                    toast.dismiss(createToastId);
                                                                    router.push(`/dashboard/sessions/${createRes.data.id}`);
                                                                }
                                                            } catch (error) {
                                                                toast.dismiss();
                                                                toast.error('Erreur lors de l\'ouverture de la séance');
                                                                router.push(`/dashboard/sessions`);
                                                            }
                                                        }}
                                                        className={`m-1 p-4 rounded-[1.5rem] ${isTeacher ? 'cursor-pointer' : 'cursor-default'} shadow-md border hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all flex flex-col justify-between overflow-hidden group/event ${event.color || 'bg-primary-50 border-primary-100 text-primary-800 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-300'}`}
                                                        style={{
                                                            height: `${getSpan(event.startTime, event.endTime) * 80 - 8}px`,
                                                            zIndex: 10,
                                                            position: 'relative'
                                                        }}
                                                    >
                                                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-50 pointer-events-none" />
                                                        <div className="relative z-10 flex flex-col h-full justify-between">
                                                            <p className="font-extrabold text-sm truncate leading-tight mb-2 opacity-90 group-hover/event:opacity-100 transition-opacity">
                                                                {event.group?.name || event.groupName || `Groupe ${event.groupId?.substring(0, 5)}`}
                                                            </p>
                                                            <div className="space-y-1.5 opacity-80 font-bold text-[10px] uppercase tracking-wider group-hover/event:opacity-100 transition-opacity">
                                                                <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/10 px-2.5 py-1.5 rounded-lg w-fit backdrop-blur-sm">
                                                                    <FiClock size={12} /> {event.startTime.substring(0, 5)}-{event.endTime.substring(0, 5)}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/10 px-2.5 py-1.5 rounded-lg w-fit backdrop-blur-sm">
                                                                    <FiMapPin size={12} /> <span className="truncate max-w-[80px]">{event.roomName}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
