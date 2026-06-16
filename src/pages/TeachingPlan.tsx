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
  MessageSquareText,
  Filter,
  AlertTriangle,
  UserX,
  Download,
  BarChart3
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
  
  // 看板筛选状态
  const [boardFilter, setBoardFilter] = useState({
    caseId: '',
    phaseId: '',
    studentId: '',
  });

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

  // 所有学生列表
  const allStudents = useMemo(() => {
    const studentMap = new Map<string, { id: string; name: string }>();
    submissions.forEach(s => {
      if (!studentMap.has(s.studentId)) {
        studentMap.set(s.studentId, { id: s.studentId, name: s.studentName });
      }
    });
    return Array.from(studentMap.values());
  }, [submissions]);

  // 筛选后的看板数据
  const filteredBoardData = useMemo(() => {
    let data = [...boardData];
    
    // 按病例筛选
    if (boardFilter.caseId) {
      data = data.filter(c => c.id === boardFilter.caseId);
    }
    
    // 按阶段筛选
    if (boardFilter.phaseId) {
      data = data.map(caseItem => ({
        ...caseItem,
        phases: caseItem.phases.filter(p => p.id === boardFilter.phaseId),
      })).filter(c => c.phases.length > 0);
    }
    
    // 按学生筛选
    if (boardFilter.studentId) {
      data = data.map(caseItem => {
        const phases = caseItem.phases.map(phase => {
          const tasks = phase.tasks.map(task => {
            const studentSubmissions = task.submissions.filter(
              s => s.studentId === boardFilter.studentId
            );
            return {
              ...task,
              stats: {
                total: studentSubmissions.length,
                submitted: studentSubmissions.filter(s => s.status === 'submitted').length,
                reviewed: studentSubmissions.filter(s => s.status === 'reviewed').length,
                needsRevision: studentSubmissions.filter(s => s.status === 'needs_revision').length,
              },
              submissions: studentSubmissions,
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
        const caseSubmissions = caseItem.phases.flatMap(p => p.tasks).flatMap(t => t.submissions)
          .filter(s => s.studentId === boardFilter.studentId);
        return {
          ...caseItem,
          phases,
          studentCount: 1,
        };
      }).filter(c => c.phases.some(p => p.tasks.some(t => t.submissions.length > 0)));
    }
    
    return data;
  }, [boardData, boardFilter]);

  // 任务卡点分析：待批阅最多的任务
  const stuckTasks = useMemo(() => {
    const tasks: Array<{
      caseId: string;
      caseName: string;
      phaseId: string;
      phaseName: string;
      taskId: string;
      taskName: string;
      submitted: number;
      totalStudents: number;
      submissionRate: number;
    }> = [];
    
    boardData.forEach(caseItem => {
      const totalStudents = caseItem.studentCount;
      caseItem.phases.forEach(phase => {
        phase.tasks.forEach(task => {
          if (task.stats.submitted > 0 || task.stats.total > 0) {
            tasks.push({
              caseId: caseItem.id,
              caseName: caseItem.diagnosis,
              phaseId: phase.id,
              phaseName: phase.name,
              taskId: task.id,
              taskName: task.title,
              submitted: task.stats.submitted,
              totalStudents,
              submissionRate: totalStudents > 0 ? Math.round((task.stats.total / totalStudents) * 100) : 0,
            });
          }
        });
      });
    });
    
    // 按待批阅数排序，取前5个
    return tasks
      .sort((a, b) => b.submitted - a.submitted)
      .slice(0, 5);
  }, [boardData]);

  // 未提交学生分析（只在有选中病例时计算）
  const missingSubmissions = useMemo(() => {
    if (!boardFilter.caseId) return [];
    
    const caseItem = boardData.find(c => c.id === boardFilter.caseId);
    if (!caseItem) return [];
    
    const caseStudentIds = new Set(
      submissions.filter(s => s.caseId === boardFilter.caseId).map(s => s.studentId)
    );
    
    const allStudentIds = new Set(allStudents.map(s => s.id));
    
    // 找出所有任务中哪些学生没交
    const result: Array<{
      phaseId: string;
      phaseName: string;
      taskId: string;
      taskName: string;
      missingStudents: Array<{ id: string; name: string }>;
    }> = [];
    
    caseItem.phases.forEach(phase => {
      phase.tasks.forEach(task => {
        const submittedStudentIds = new Set(task.submissions.map(s => s.studentId));
        const missing = allStudents.filter(s => !submittedStudentIds.has(s.id) && caseStudentIds.has(s.id));
        
        if (missing.length > 0) {
          result.push({
            phaseId: phase.id,
            phaseName: phase.name,
            taskId: task.id,
            taskName: task.title,
            missingStudents: missing,
          });
        }
      });
    });
    
    return result;
  }, [boardFilter.caseId, boardData, allStudents, submissions]);

  // 批量点评：获取所有待批阅的提交ID
  const pendingSubmissions = useMemo(() => {
    const result: Array<{
      id: string;
      studentName: string;
      taskName: string;
      caseName: string;
    }> = [];
    
    filteredBoardData.forEach(caseItem => {
      caseItem.phases.forEach(phase => {
        phase.tasks.forEach(task => {
          task.submissions
            .filter(s => s.status === 'submitted')
            .forEach(sub => {
              result.push({
                id: sub.id,
                studentName: sub.studentName,
                taskName: task.title,
                caseName: caseItem.diagnosis,
              });
            });
        });
      });
    });
    
    return result;
  }, [filteredBoardData]);

  // 导出病例进度报告
  const exportBoardReport = () => {
    const targetData = boardFilter.caseId ? filteredBoardData : boardData;
    const reportTitle = boardFilter.caseId 
      ? `病例 ${boardFilter.caseId} 进度报告` 
      : '教学进度汇总报告';
    
    let report = '';
    report += '='.repeat(60) + '\n';
    report += `           口腔正畸教学 - ${reportTitle}\n`;
    report += '='.repeat(60) + '\n\n';
    
    // 总体统计
    report += '【总体统计】\n';
    const totalCases = targetData.length;
    const totalTasks = targetData.reduce((acc, c) => 
      acc + c.phases.reduce((pAcc, p) => pAcc + p.tasks.length, 0), 0);
    const totalSubs = targetData.reduce((acc, c) =>
      acc + c.phases.reduce((pAcc, p) => pAcc + p.tasks.reduce((tAcc, t) => tAcc + t.stats.total, 0), 0), 0);
    const totalReviewed = targetData.reduce((acc, c) =>
      acc + c.phases.reduce((pAcc, p) => pAcc + p.totalStats.reviewed, 0), 0);
    const totalPending = targetData.reduce((acc, c) =>
      acc + c.phases.reduce((pAcc, p) => pAcc + p.totalStats.submitted, 0), 0);
    
    report += `病例数：${totalCases} 个\n`;
    report += `任务数：${totalTasks} 个\n`;
    report += `总提交：${totalSubs} 份\n`;
    report += `已批阅：${totalReviewed} 份\n`;
    report += `待批阅：${totalPending} 份\n\n`;
    
    // 各病例详情
    report += '【各病例详情】\n';
    report += '-'.repeat(50) + '\n\n';
    
    targetData.forEach((caseItem, caseIdx) => {
      report += `病例 ${caseIdx + 1}：${caseItem.diagnosis}\n`;
      report += `病例编号：${caseItem.anonymousCode}\n`;
      report += `参与学生：${caseItem.studentCount} 人\n\n`;
      
      caseItem.phases.forEach((phase) => {
        report += `  ▶ ${phase.name}（${phase.duration}）\n`;
        report += `    已批阅：${phase.totalStats.reviewed} 份 | 待批阅：${phase.totalStats.submitted} 份\n\n`;
        
        phase.tasks.forEach((task) => {
          report += `    · ${task.title}\n`;
          report += `      提交统计：总${task.stats.total} / 待批阅${task.stats.submitted} / 已批阅${task.stats.reviewed}\n`;
          
          if (task.submissions.length > 0) {
            report += '      学生提交：\n';
            task.submissions.forEach((sub) => {
              const statusText = sub.status === 'reviewed' ? '已批阅' :
                               sub.status === 'needs_revision' ? '需修改' : '待批阅';
              const scoreText = sub.score ? `${sub.score}分` : '无评分';
              report += `        - ${sub.studentName} [${statusText}] [${scoreText}]\n`;
            });
          }
          report += '\n';
        });
      });
      
      report += '-'.repeat(50) + '\n\n';
    });
    
    report += `报告生成时间：${new Date().toLocaleString()}\n`;
    report += '='.repeat(60) + '\n';
    
    // 下载文件
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `教学进度报告_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
          {/* 筛选栏 */}
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-slate-800">进度筛选</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={exportBoardReport}
                  className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  导出报告
                </button>
                <button
                  onClick={() => setBoardFilter({ caseId: '', phaseId: '', studentId: '' })}
                  className="text-sm text-slate-500 hover:text-primary-600 transition-colors"
                >
                  清空筛选
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">按病例</label>
                <select
                  value={boardFilter.caseId}
                  onChange={(e) => setBoardFilter({ ...boardFilter, caseId: e.target.value, phaseId: '' })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                >
                  <option value="">全部病例</option>
                  {boardData.map(c => (
                    <option key={c.id} value={c.id}>{c.anonymousCode} - {c.diagnosis.substring(0, 20)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">按阶段</label>
                <select
                  value={boardFilter.phaseId}
                  onChange={(e) => setBoardFilter({ ...boardFilter, phaseId: e.target.value })}
                  disabled={!boardFilter.caseId}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">全部阶段</option>
                  {boardFilter.caseId && (() => {
                    const caseItem = boardData.find(c => c.id === boardFilter.caseId);
                    return caseItem?.phases.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ));
                  })()}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">按学生</label>
                <select
                  value={boardFilter.studentId}
                  onChange={(e) => setBoardFilter({ ...boardFilter, studentId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                >
                  <option value="">全部学生</option>
                  {allStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 分析卡片 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 任务卡点分析 */}
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-slate-800">任务卡点分析</h3>
                <span className="text-xs text-slate-400 ml-auto">待批阅最多的任务</span>
              </div>
              {stuckTasks.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">暂无待批阅任务</p>
              ) : (
                <div className="space-y-3">
                  {stuckTasks.map((task, idx) => (
                    <div
                      key={`${task.caseId}-${task.taskId}`}
                      onClick={() => {
                        setBoardFilter({ ...boardFilter, caseId: task.caseId, phaseId: task.phaseId });
                      }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50/50 hover:bg-yellow-50 cursor-pointer transition-colors"
                    >
                      <span className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{task.taskName}</p>
                        <p className="text-xs text-slate-500">{task.caseName} · {task.phaseName}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-yellow-600 font-mono">{task.submitted}</p>
                        <p className="text-xs text-slate-400">份待批阅</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 未提交学生提醒 */}
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <UserX className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-slate-800">未提交学生</h3>
                <span className="text-xs text-slate-400 ml-auto">
                  {boardFilter.caseId ? `已选病例` : '请先选择病例'}
                </span>
              </div>
              {!boardFilter.caseId ? (
                <p className="text-sm text-slate-400 text-center py-8">选择病例后查看未提交学生</p>
              ) : missingSubmissions.length === 0 ? (
                <p className="text-sm text-green-600 text-center py-8">所有学生都已提交</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {missingSubmissions.slice(0, 5).map(item => (
                    <div key={`${item.phaseId}-${item.taskId}`} className="p-3 rounded-lg bg-red-50/50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-700">{item.taskName}</p>
                        <span className="text-xs text-red-600 font-medium">
                          {item.missingStudents.length} 人未交
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.missingStudents.slice(0, 5).map(student => (
                          <span
                            key={student.id}
                            className="px-2 py-0.5 bg-white rounded text-xs text-slate-600 border border-slate-200"
                          >
                            {student.name}
                          </span>
                        ))}
                        {item.missingStudents.length > 5 && (
                          <span className="px-2 py-0.5 text-xs text-slate-400">
                            +{item.missingStudents.length - 5} 人
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 批量点评操作栏 */}
          {pendingSubmissions.length > 0 && (
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg border border-primary-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquareText className="w-6 h-6 text-primary-600" />
                <div>
                  <p className="font-medium text-primary-800">
                    共 {pendingSubmissions.length} 份作业待批阅
                  </p>
                  <p className="text-xs text-primary-600/70">
                    点击下方按钮开始批量点评
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (pendingSubmissions.length > 0) {
                    navigate(`/annotations?submissionId=${pendingSubmissions[0].id}&from=board`);
                  }
                }}
                className="px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                开始批量点评
              </button>
            </div>
          )}

          {/* 病例看板列表 */}
          {filteredBoardData.map((caseItem) => {
            const totalSubmitted = caseItem.phases.reduce((acc, p) => acc + p.totalStats.submitted, 0);
            const totalReviewed = caseItem.phases.reduce((acc, p) => acc + p.totalStats.reviewed, 0);
            const totalSubmissions = caseItem.phases.reduce((acc, p) => {
              return acc + p.tasks.reduce((tAcc, t) => tAcc + t.stats.total, 0);
            }, 0);
            
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
                        <p className="text-xs text-slate-500 mb-1">总提交</p>
                        <p className="text-xl font-bold text-slate-700 font-mono">{totalSubmissions}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500 mb-1">待批阅</p>
                        <p className="text-xl font-bold text-accent-600 font-mono">{totalSubmitted}</p>
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
                              待批阅 {phase.totalStats.submitted}
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
                                      onClick={() => navigate(`/annotations?submissionId=${sub.id}&from=task-${task.id}`)}
                                    >
                                      <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.studentId}`}
                                        alt={sub.studentName}
                                        className="w-6 h-6 rounded-full bg-slate-200"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/students/${sub.studentId}`);
                                        }}
                                      />
                                      <span 
                                        className="text-xs text-slate-600 flex-1 truncate hover:text-primary-600 transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/students/${sub.studentId}`);
                                        }}
                                      >
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
