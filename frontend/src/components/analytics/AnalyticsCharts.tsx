'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface QualityPoint {
    date: string;
    score: number;
}

interface AnalyticsChartsProps {
    qualityTrend: QualityPoint[];
    totalMissions: number;
    completedMissions: number;
}

export function QualityTrendChart({ qualityTrend }: { qualityTrend: QualityPoint[] }) {
    const data = qualityTrend.map(p => ({
        ...p,
        formattedDate: format(new Date(p.date), 'dd MMM', { locale: fr })
    }));

    if (data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-dark-400 font-medium italic">
                Pas assez de données pour afficher le graphique
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                    dataKey="formattedDate"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }}
                    dy={10}
                />
                <YAxis
                    domain={[0, 10]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }}
                />
                <Tooltip
                    contentStyle={{
                        borderRadius: '16px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        backgroundColor: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }}
                />
                <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                    animationDuration={1500}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

export function MissionProgressChart({ total, completed }: { total: number, completed: number }) {
    const data = [
        { name: 'Complétées', value: completed, color: '#10b981' },
        { name: 'En attente', value: Math.max(0, total - completed), color: '#f59e0b' }
    ];

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }}
                />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
