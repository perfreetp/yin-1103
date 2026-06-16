import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color?: 'primary' | 'accent' | 'green' | 'red';
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, color = 'primary', className }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    accent: 'bg-accent-50 text-accent-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition-all duration-300',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-800 font-mono">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.isUp ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-slate-400">较上周</span>
            </div>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
