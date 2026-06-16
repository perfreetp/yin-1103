import { useState, useMemo } from 'react';
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
  Plus,
  LayoutGrid,
  List,
  AlertCircle,
  CheckCheck,
  Send,
  Eye,
  MessageSquareText
} from 'lucide-react';
import { useCaseStore } from '../store/useCaseStore';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const taskTypeLabels: Record<string, string> = {
  initial_assessment: '初诊评估',
  stage_judgment: '阶段判断',
  treatment_suggestion: '治疗建议',
  followup_decision: '复诊决策',
};

export function TeachingPlan() {
  const { originalCases, submissions } = useCaseStore();
  const { currentUser } = useAuthStore();
  const [expandedCase, setExpandedCase] = useState<string | null>(originalCases[0]?.id || null);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const navigate = useNavigate();

  const activeCases = useMemo(() => 
    originalCases.filter(c => c.status === 'in_progress' || c.status === 'draft'),
    [originalCases]
  );

  // 计算全局统计
  const stats = useMemo(() => {
    const allTasks = activeCases.flatMap(c => c.phases.flatMap(p => p.tasks));
    return {
      activeCases: activeCases.length,
      inProgressTasks: allTasks.filter(t => t.status === 'in_progress').length,
      pendingReview: submissions.filter(s => s.status === 'submitted').length,
      completedTasks: submissions.filter(s => s.status === 'reviewed').length,
    };
  }, [activeCases, submissions]);

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

  // 进度看板数据：按病例分组，统计每个任务各状态的提交数
  const boardData = useMemo(() => {
    return activeCases.map((caseItem) => {
      const caseSubmissions = submissions.filter(s => s.caseId === caseItem.id);
      
      const phases = caseItem.phases.map((phase) => {
        const tasks = phase.tasks.map((task) => {
          const taskSubmissions = caseSubmissions.filter(s => s.taskId === task.id);
          return {
            ...task,
            stats: {
              total: taskSubmissions.length,
              submitted: taskSubmissions.filter(s => s.status === 'submitted').length,
              reviewed: taskSubmissions.filter(s => s.status === 'reviewed').length,
              needsRevision: taskSubmissions.filter(s => s.status === 'needs_revision').length,
            },
            submissions: taskSubmissions,
          };
        });
        
        return {
          ...phase,
          tasks,
          totalStats: {
            submitted: tasks.reduce((acc, t) => acc + t.stats.submitted, 0),
            reviewed: tasks.reduce((acc, t) => acc + t.stats.reviewed, 0),
          },
        };
      });

      // 统计学生参与情况
      const uniqueStudents = [...new Set(caseSubmissions.map(s => s.studentId))];
      
      return {
        ...caseItem,
        phases,
        studentCount: uniqueStudents.length,
      };
    });
  }, [activeCases, submissions]);

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
        <div className="flex items-center gap-3">
          {/* 视图切换 */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-4 py-2 text-sm transition-colors flex items-center gap-1.5',
                viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-slate-500 hover:bg-slate-50'
              )}
            >
              <List className="w-4 h-4" />
              方案列表
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={cn(
                'px-4 py-2 text-sm transition-colors flex items-center gap-1.5',
                viewMode === 'board' ? 'bg-primary-50 text-primary-600' : 'text-slate-500 hover:bg-slate-50'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              进度看板
            </button>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="w-5 h-5" />
            <span>新建教学方案</span>
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: '在教病例', value: stats.activeCases, icon: Users, color: 'bg-primary-50 text-primary-600' },
          { label: '进行中任务', value: stats.inProgressTasks, icon: PlayCircle, color: 'bg-accent-50 text-accent-600' },
          { label: '待批阅', value: stats.pendingReview, icon: AlertCircle, color: 'bg-red-50 text-red-600' },
          { label: '已批阅', value: stats.completedTasks, icon: CheckCheck, color: 'bg-green-50 text-green-600' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800 font-mono">{stat.value}</p>
                </div>
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', stat.color)}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {viewMode === 'list' ? (
        /* 方案列表视图 */
        <div className="space-y-4">
          {activeCases.map((caseItem) => {
            const isExpanded = expandedCase === caseItem.id;
            const totalTasks = caseItem.phases.reduce((acc, phase) => acc + phase.tasks.length, 0);
            const completedTasks = caseItem.phases.reduce(
              (acc, phase) => acc + phase.tasks.filter(t => t.status === 'completed').length,
              0
            );
            const progress = Math.round((completedTasks / totalTasks) * 100);
            const caseSubmissions = submissions.filter(s => s.caseId === caseItem.id);
            const studentCount = new Set(caseSubmissions.map(s => s.studentId)).size;

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
                        <span className="text-sm">{studentCount}人</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 展开的阶段任务 */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 bg-slate-50 animate-fade-in">
                    <div className="space-y-6">
                      {caseItem.phases.map((phase) => {
                        const phaseSubmissions = caseSubmissions.filter(s => 
                          phase.tasks.some(t => t.id === s.taskId)
                        );
                        
                        return (
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
                                const taskSubmissions = caseSubmissions.filter(s => s.taskId === task.id);
                                
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
                                          <div className="flex items-center gap-2 mb-0.5">
                                            <h5 className="text-sm font-medium text-slate-700 group-hover:text-primary-600 transition-colors">
                                              {task.title}
                                            </h5>
                                            <span className="text-xs text-slate-400">
                                              {taskTypeLabels[task.type]}
                                            </span>
                                          </div>
                                          <p className="text-xs text-slate-400 mt-0.5">
                                            {task.description}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        {taskSubmissions.length > 0 && (
                                          <div className="flex items-center gap-1 text-xs text-slate-500">
                                            <Send className="w-3 h-3" />
                                            {taskSubmissions.length} 份提交
                                          </div>
                                        )}
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
                        );
                      })}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/cases/${caseItem.id}`); }}
                        className="px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        查看病例详情
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setViewMode('board'); }}
                        className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        查看进度看板
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* 进度看板视图 */
        <div className="space-y-6">
          {boardData.map((caseItem) => {
            const totalSubmitted = caseItem.phases.reduce((acc, p) => acc + p.totalStats.submitted, 0);
            const totalReviewed = caseItem.phases.reduce((acc, p) => acc + p.totalStats.reviewed, 0);
            
            return (
              <div 
                key={caseItem.id} 
                className="bg-white rounded-lg border border-slate-200 overflow-hidden"
              >
                {/* 病例头部 */}
                <div className="p-5 bg-gradient-to-r from-primary-50/50 to-slate-50 border-b border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-slate-400">{caseItem.anonymousCode}</span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-700">
                          {caseItem.status === 'in_progress' ? '进行中' : '草稿'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-800 text-lg">{caseItem.diagnosis}</h3>
                      <p className="text-sm text-slate-500 mt-1">{caseItem.description}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-slate-500 mb-1">学生数</p>
                        <p className="text-xl font-bold text-slate-800 font-mono">{caseItem.studentCount}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500 mb-1">待批阅</p>
                        <p className="text-xl font-bold text-accent-600 font-mono">{totalSubmitted - totalReviewed}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500 mb-1">已批阅</p>
                        <p className="text-xl font-bold text-green-600 font-mono">{totalReviewed}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 各阶段任务看板 */}
                <div className="overflow-x-auto">
                  <div className="p-5 min-w-[800px]">
                    {caseItem.phases.map((phase) => (
                      <div key={phase.id} className="mb-6 last:mb-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
                            {phase.order}
                          </div>
                          <h4 className="font-medium text-slate-800">{phase.name}</h4>
                          <span className="text-xs text-slate-400">{phase.duration}</span>
                          <div className="ml-auto flex items-center gap-4 text-xs">
                            <span className="text-accent-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              待批阅 {phase.totalStats.submitted - phase.totalStats.reviewed}
                            </span>
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCheck className="w-3 h-3" />
                              已批阅 {phase.totalStats.reviewed}
                            </span>
                          </div>
                        </div>

                        {/* 任务卡片 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-9">
                          {phase.tasks.map((task) => (
                            <div 
                              key={task.id}
                              className="border border-slate-200 rounded-lg p-4 hover:border-primary-300 transition-colors bg-white"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <span className="text-xs text-primary-500 font-medium">
                                    {taskTypeLabels[task.type]}
                                  </span>
                                  <h5 className="text-sm font-medium text-slate-800 mt-0.5">
                                    {task.title}
                                  </h5>
                                </div>
                                {task.status === 'completed' && (
                                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                )}
                                {task.status === 'in_progress' && (
                                  <PlayCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                                )}
                              </div>

                              <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                                {task.description}
                              </p>

                              {/* 提交统计 */}
                              <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className="text-center p-2 bg-slate-50 rounded">
                                  <p className="text-xs text-slate-500">总提交</p>
                                  <p className="text-base font-bold text-slate-700 font-mono">{task.stats.total}</p>
                                </div>
                                <div className="text-center p-2 bg-accent-50 rounded">
                                  <p className="text-xs text-accent-600">待批阅</p>
                                  <p className="text-base font-bold text-accent-600 font-mono">{task.stats.submitted}</p>
                                </div>
                                <div className="text-center p-2 bg-green-50 rounded">
                                  <p className="text-xs text-green-600">已批阅</p>
                                  <p className="text-base font-bold text-green-600 font-mono">{task.stats.reviewed}</p>
                                </div>
                              </div>

                              {/* 学生提交列表 */}
                              {task.submissions.length > 0 && (
                                <div className="space-y-2 pt-3 border-t border-slate-100">
                                  <p className="text-xs text-slate-500">学生提交：</p>
                                  {task.submissions.slice(0, 3).map((sub) => (
                                    <div 
                                      key={sub.id}
                                      className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 transition-colors cursor-pointer"
                                      onClick={() => navigate(`/annotations?submissionId=${sub.id}`)}
                                    >
                                      <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.studentId}`}
                                        alt={sub.studentName}
                                        className="w-6 h-6 rounded-full bg-slate-200"
                                      />
                                      <span className="text-xs text-slate-600 flex-1 truncate">
                                        {sub.studentName}
                                      </span>
                                      <span className={cn(
                                        'px-1.5 py-0.5 rounded text-[10px] font-medium',
                                        sub.status === 'reviewed' ? 'bg-green-100 text-green-700' :
                                        sub.status === 'needs_revision' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                      )}>
                                        {sub.status === 'reviewed' ? '已阅' :
                                         sub.status === 'needs_revision' ? '待改' : '待阅'}
                                      </span>
                                      <button 
                                        className="p-1 rounded hover:bg-primary-100 text-primary-600 transition-colors"
                                        title="点评"
                                      >
                                        <MessageSquareText className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                  {task.submissions.length > 3 && (
                                    <button
                                      onClick={() => navigate(`/teaching-plan/${task.id}`)}
                                      className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                    >
                                      <Eye className="w-3 h-3" />
                                      查看全部 {task.submissions.length} 份提交
                                    </button>
                                  )}
                                </div>
                              )}

                              {task.submissions.length === 0 && (
                                <div className="text-center py-3 text-xs text-slate-400">
                                  暂无学生提交
                                </div>
                              )}

                              <button
                                onClick={() => navigate(`/teaching-plan/${task.id}`)}
                                className="w-full mt-3 py-2 text-xs text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors flex items-center justify-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                查看任务详情
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {boardData.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg border border-slate-200 border-dashed">
              <LayoutGrid className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-2">暂无在教病例</p>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm">
                <Plus className="w-4 h-4" />
                新建教学方案
              </button>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
