import React from 'react';

interface BarData {
  label: string;
  value: number;
  secondaryValue?: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  secondaryLabel?: string;
  primaryLabel?: string;
}

export const SimpleBarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  valuePrefix = '',
  valueSuffix = '',
  primaryLabel,
  secondaryLabel
}) => {
  const maxValue = Math.max(
    ...data.map(d => Math.max(d.value, d.secondaryValue || 0)),
    10
  );

  return (
    <div className="w-full">
      {(primaryLabel || secondaryLabel) && (
        <div className="flex items-center justify-end gap-4 mb-3 text-xs text-slate-500 dark:text-slate-400">
          {primaryLabel && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 inline-block" />
              <span>{primaryLabel}</span>
            </div>
          )}
          {secondaryLabel && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
              <span>{secondaryLabel}</span>
            </div>
          )}
        </div>
      )}
      <div className="flex items-end gap-2 sm:gap-3 w-full" style={{ height: `${height}px` }}>
        {data.map((item, idx) => {
          const primaryPercent = Math.min(100, Math.round((item.value / maxValue) * 100));
          const secondaryPercent = item.secondaryValue
            ? Math.min(100, Math.round((item.secondaryValue / maxValue) * 100))
            : 0;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
              {/* Tooltip */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] sm:text-xs py-1 px-2 rounded-md whitespace-nowrap z-20 pointer-events-none shadow-md">
                {item.label}: {valuePrefix}{item.value.toLocaleString()}{valueSuffix}
                {item.secondaryValue !== undefined && ` / ${valuePrefix}${item.secondaryValue.toLocaleString()}${valueSuffix}`}
              </div>

              <div className="w-full flex items-end justify-center gap-1 h-full pb-1">
                <div
                  className="w-full max-w-[20px] rounded-t-sm bg-blue-600 dark:bg-blue-500 transition-all duration-300 group-hover:opacity-85"
                  style={{ height: `${primaryPercent}%` }}
                />
                {item.secondaryValue !== undefined && (
                  <div
                    className="w-full max-w-[20px] rounded-t-sm bg-emerald-500 dark:bg-emerald-400 transition-all duration-300 group-hover:opacity-85"
                    style={{ height: `${secondaryPercent}%` }}
                  />
                )}
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-full mt-1">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  centerLabel?: string;
  centerSub?: string;
  size?: number;
}

export const SimpleDonutChart: React.FC<DonutChartProps> = ({
  data,
  centerLabel,
  centerSub,
  size = 160
}) => {
  const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
  let accumulatedAngle = 0;

  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90 transform">
          {data.map((item, idx) => {
            const strokeDasharray = `${(item.value / total) * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedAngle;
            accumulatedAngle += (item.value / total) * circumference;

            return (
              <circle
                key={idx}
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth="20"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          {centerLabel && (
            <span className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {centerLabel}
            </span>
          )}
          {centerSub && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {centerSub}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              {item.label}:
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {item.value} ({Math.round((item.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
