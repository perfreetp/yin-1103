import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { 
  ChevronDown, 
  ChevronRight,
  Clock,
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  Users,
  Plus
} from 'lucide-react';
import { cases } from '../data/cases';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export function TeachingPlan() {
  const [expandedCase, setExpandedCase] = useState<string | null>(cases[0]?.id || null);
  const navigate = useNavigate();

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <PlayCircle className="w-4 h-4 text-primary-500" />;
      default:
        return <Circle className="w-4 h-4 text-slate-300" />;
    }
  };

  const getTaskStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return { text: '已完成', color: 'text-green-600 bg-green-50' };
      case 'in_progress':
        return { text: '进行中', color: 'text-primary-600 bg-primary-50' };
      default:
        return { text: '待开始', color: 'text-slate-500 bg-slate-100' };
    }
  };

  const activeCases = cases.filter(c => c.status === 'in_progress' || c.status === 'draft');

  return (
    <Layout>
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">教学方案</h1>
          <p className="text-slate-500 mt-1">
            管理病例的治疗阶段任务，跟踪学员学习进度
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <Plus className="w-5 h-5" />
          <span>新建教学方案</span>
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: '在教病例', value: activeCases.length, color: 'bg-primary-50 text-primary-600' },
          { label: '进行中任务', value: 12, color: 'bg-accent-50 text-accent-600' },
          { label: '待批阅', value: 5, color: 'bg-red-50 text-red-600' },
          { label: '已完成任务', value: 28, color: 'bg-green-50 text-green-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-800 font-mono">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 教学方案列表 */}
      <div className="space-y-4">
        {activeCases.map((caseItem) => {
          const isExpanded = expandedCase === caseItem.id;
          const totalTasks = caseItem.phases.reduce((acc, phase) => acc + phase.tasks.length, 0);
          const completedTasks = caseItem.phases.reduce(
            (acc, phase) => acc + phase.tasks.filter(t => t.status === 'completed').length,
            0
          );
          const progress = Math.round((completedTasks / totalTasks) * 100);

          return (
            <div
              key={caseItem.id}
              className="bg-white rounded-lg border border-slate-200 overflow-hidden"
            >
              {/* 病例头部 */}
              <div
                className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedCase(isExpanded ? null : caseItem.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-slate-400">
                          {caseItem.anonymousCode}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-700">
                          {caseItem.status === 'in_progress' ? '进行中' : '草稿'}
                        </span>
                      </div>
                      <h3 className="font-medium text-slate-800">{caseItem.diagnosis}</h3>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm text-slate-500">任务进度</p>
                      <p className="font-mono font-bold text-primary-600">
                        {completedTasks}/{totalTasks}
                      </p>
                    </div>
                    <div className="w-32">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{caseItem.studentCount}人</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 展开的阶段任务 */}
              {isExpanded && (
                <div className="border-t border-slate-100 p-5 bg-slate-50 animate-fade-in">
                  <div className="space-y-6">
                    {caseItem.phases.map((phase) => (
                      <div key={phase.id}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">
                            {phase.order}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-800">{phase.name}</h4>
                            <p className="text-sm text-slate-500">{phase.description}</p>
                          </div>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {phase.duration}
                          </span>
                        </div>

                        {/* 任务列表 */}
                        <div className="ml-10 space-y-2">
                          {phase.tasks.map((task) => {
                            const statusInfo = getTaskStatusText(task.status);
                            return (
                              <div
                                key={task.id}
                                onClick={() => navigate(`/teaching-plan/${task.id}`)}
                                className="bg-white rounded-lg p-4 border border-slate-200 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {getTaskStatusIcon(task.status)}
                                    <div>
                                      <h5 className="text-sm font-medium text-slate-700 group-hover:text-primary-600 transition-colors">
                                        {task.title}
                                      </h5>
                                      <p className="text-xs text-slate-400 mt-0.5">
                                        {task.description}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className={cn('px-2 py-1 rounded text-xs font-medium', statusInfo.color)}>
                                      {statusInfo.text}
                                    </span>
                                    <div className="text-right hidden sm:block">
                                      <p className="text-xs text-slate-400">截止日期</p>
                                      <p className="text-xs text-slate-600">{task.deadline}</p>
                                    </div>
                                    <FileText className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors" />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
                    <button className="px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      查看病例详情
                    </button>
                    <button className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      查看学员提交
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
