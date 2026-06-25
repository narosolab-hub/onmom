"use client";

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export function StatCard({ icon, label, value, subtext, trend, trendValue }: StatCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-[#6B7280]',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#6B7280]">{label}</p>
          <p className="text-2xl font-bold text-[#111827] mt-1">{value}</p>
          {subtext && (
            <p className="text-xs text-[#6B7280] mt-1">{subtext}</p>
          )}
        </div>
        <div className="w-12 h-12 bg-[#E8F5E9] rounded-xl flex items-center justify-center text-2xl">
          {icon}
        </div>
      </div>

      {trend && trendValue && (
        <div className={`mt-3 flex items-center gap-1 text-sm ${trendColors[trend]}`}>
          <span>{trendIcons[trend]}</span>
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
}
