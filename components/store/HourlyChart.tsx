"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

const hourlyData = [
  { hour: '9시', count: 3 },
  { hour: '10시', count: 7 },
  { hour: '11시', count: 12 },
  { hour: '12시', count: 8 },
  { hour: '13시', count: 5 },
  { hour: '14시', count: 9 },
  { hour: '15시', count: 6 },
  { hour: '16시', count: 11 },
  { hour: '17시', count: 4 },
];

export function HourlyChart() {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={hourlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
        <XAxis dataKey="hour" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#6B7280' }} />
        <YAxis fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#6B7280' }} />
        <Tooltip
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          formatter={(value) => [`${value}건`, '예약']}
        />
        <Bar dataKey="count" fill="#609966" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
