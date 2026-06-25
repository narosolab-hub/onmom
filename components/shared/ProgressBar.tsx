"use client";

interface ProgressBarProps {
  percent: number;
  showLabel?: boolean;
}

export function ProgressBar({ percent, showLabel = true }: ProgressBarProps) {
  const safePercent = Math.min(100, Math.max(0, percent));

  return (
    <div className="w-full">
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#609966] rounded-full transition-all duration-300"
          style={{ width: `${safePercent}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-end mt-1">
          <span className="text-xs text-[#6B7280]">{safePercent}%</span>
        </div>
      )}
    </div>
  );
}
