import { useNavigate } from 'react-router-dom';
import { Clock, Users, ChevronRight } from 'lucide-react';
import type { Case } from '../../types';
import { cn } from '../../lib/utils';

interface CaseCardProps {
  caseData: Case;
}

const difficultyConfig = {
  easy: { label: '简单', color: 'bg-green-100 text-green-700' },
  medium: { label: '中等', color: 'bg-yellow-100 text-yellow-700' },
  hard: { label: '困难', color: 'bg-red-100 text-red-700' },
};

const statusConfig = {
  draft: { label: '草稿', color: 'bg-slate-100 text-slate-600' },
  in_progress: { label: '进行中', color: 'bg-primary-100 text-primary-700' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
  archived: { label: '已归档', color: 'bg-slate-100 text-slate-500' },
};

export function CaseCard({ caseData }: CaseCardProps) {
  const navigate = useNavigate();
  const difficulty = difficultyConfig[caseData.difficultyLevel];
  const status = statusConfig[caseData.status];

  return (
    <div
      onClick={() => navigate(`/cases/${caseData.id}`)}
      className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-lg hover:border-primary-300 transition-all duration-300 cursor-pointer group"
    >
      {/* 头部 */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-slate-400">{caseData.anonymousCode}</span>
          </div>
          <h3 className="font-medium text-slate-800 group-hover:text-primary-700 transition-colors line-clamp-2">
            {caseData.diagnosis}
          </h3>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
      </div>

      {/* 标签 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={cn('px-2 py-0.5 rounded text-xs font-medium', difficulty.color)}>
          {difficulty.label}
        </span>
        <span className={cn('px-2 py-0.5 rounded text-xs font-medium', status.color)}>
          {status.label}
        </span>
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
          {caseData.treatmentType}
        </span>
      </div>

      {/* 描述 */}
      <p className="text-sm text-slate-500 line-clamp-2 mb-4">
        {caseData.description}
      </p>

      {/* 底部信息 */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          <span>{caseData.studentCount} 位学员</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{caseData.createdAt}</span>
        </div>
      </div>
    </div>
  );
}
