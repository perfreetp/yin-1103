import { useMemo } from 'react';
import { Layout } from '../components/layout/Layout';
import { StatCard } from '../components/business/StatCard';
import { CaseCard } from '../components/business/CaseCard';
import { 
  FolderKanban, 
  ClipboardCheck, 
  Clock, 
  Award,
  ChevronRight,
  AlertCircle,
  BookOpen,
  MessageSquareText,
  CheckCircle2
} from 'lucide-react';
import { useCaseStore } from '../store/useCaseStore';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export function Dashboard() {
  const { originalCases, submissions } = useCaseStore();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();

  // 统计数据 - 完全基于真实数据计算
  const stats = useMemo(() => {
    const inProgressCases = originalCases.filter(c => c.status === 'in_progress').length;
    const totalSubmissions = submissions.length;
    const reviewedSubmissions = submissions.filter(s => s.status === 'reviewed').length;
    const pendingReview = submissions.filter(s => s.status === 'submitted').length;
    const totalAnnotations = submissions.reduce((sum, s) => sum + s.annotations.length, 0);
    
    // 学生视角的统计
    let myCompletedTasks = 0;
    let myPendingTasks = 0;
    let myAvgScore = 0;
    
    if (currentUser?.role === 'student') {
      const mySubs = submissions.filter(s => s.studentId === currentUser.id);
      myCompletedTasks = mySubs.filter(s => s.status === 'reviewed').length;
      myPendingTasks = mySubs.filter(s => s.status === 'submitted').length;
      const scoredSubs = mySubs.filter(s => s.score);
      if (scoredSubs.length > 0) {
        myAvgScore = Math.round(scoredSubs.reduce((sum, s) => sum + (s.score || 0), 0) / scoredSubs.length);
      }
    }
    
    return {
      inProgressCases,
      totalSubmissions,
      reviewedSubmissions,
      pendingReview,
      totalAnnotations,
      myCompletedTasks,
      myPendingTasks,
      myAvgScore,
    };
  }, [originalCases, submissions, currentUser]);

  // 最近病例
  const recentCases = useMemo(() => {
    return [...originalCases]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [originalCases]);

  // 待处理任务 - 根据角色不同
  const todoItems = useMemo(() => {
    if (currentUser?.role === 'teacher') {
      // 老师视角：待批阅的提交
      const pending = submissions
        .filter(s => s.status === 'submitted')
        .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
        .slice(0, 4);
      
      return pending.map(sub => {
        const caseItem = originalCases.find(c => c.id === sub.caseId);
        let taskTitle = '';
        if (caseItem) {
          for (const phase of caseItem.phases) {
            const task = phase.tasks.find(t => t.id === sub.taskId);
            if (task) { taskTitle = task.title; break; }
          }
        }
        return {
          id: sub.id,
          title: `批阅 ${sub.studentName} - ${taskTitle || '任务'}`,
          type: '批注',
          deadline: '今天',
          taskId: sub.taskId,
        };
      });
    } else {
      // 学生视角：已提交待批阅 + 进行中的任务
      const mySubs = currentUser 
        ? submissions.filter(s => s.studentId === currentUser.id)
        : [];
      
      // 待批阅的
      const pendingReview = mySubs
        .filter(s => s.status === 'submitted')
        .map(sub => {
          const caseItem = originalCases.find(c => c.id === sub.caseId);
          let taskTitle = '';
          if (caseItem) {
            for (const phase of caseItem.phases) {
              const task = phase.tasks.find(t => t.id === sub.taskId);
              if (task) { taskTitle = task.title; break; }
            }
          }
          return {
            id: sub.id,
            title: `${taskTitle || '任务'} - 待老师批阅`,
            type: '待批阅',
            deadline: '等待中',
            taskId: sub.taskId,
          };
        });
      
      // 未提交的任务（取前几个病例的第一个未完成任务）
      const unsubmittedTasks: Array<{ id: string; title: string; type: string; deadline: string; taskId: string }> = [];
      originalCases.slice(0, 2).forEach(caseItem => {
        for (const phase of caseItem.phases) {
          for (const task of phase.tasks) {
            const hasSubmitted = mySubs.some(s => s.taskId === task.id);
            if (!hasSubmitted && task.status !== 'pending') {
              unsubmittedTasks.push({
                id: task.id,
                title: `${task.title}`,
                type: '待完成',
                deadline: task.deadline,
                taskId: task.id,
              });
            }
          }
        }
      });
      
      return [...pendingReview, ...unsubmittedTasks.slice(0, 2)].slice(0, 4);
    }
  }, [submissions, originalCases, currentUser]);

  // 处理待办点击
  const handleTodoClick = (item: { taskId?: string; type: string; id: string }) => {
    if (item.type === '批注' && item.taskId) {
      navigate(`/annotations?submissionId=${item.id}&from=task-${item.taskId}`);
    } else if (item.taskId) {
      navigate(`/teaching-plan/${item.taskId}`);
    }
  };

  return (
    <Layout>
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 font-serif">
          早上好，{currentUser?.name}
        </h1>
        <p className="text-slate-500 mt-1">
          {currentUser?.role === 'teacher' 
            ? `今天有 ${stats.pendingReview} 份作业待批阅，加油！`
            : `你有 ${stats.myPendingTasks} 个任务待批阅，${stats.myCompletedTasks} 个已完成`
          }
        </p>
      </div>

      {/* 数据统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="在跟病例"
          value={stats.inProgressCases}
          icon={FolderKanban}
          color="primary"
          trend={{ value: 12, isUp: true }}
        />
        <StatCard
          title="已完成任务"
          value={currentUser?.role === 'teacher' ? stats.reviewedSubmissions : stats.myCompletedTasks}
          icon={ClipboardCheck}
          color="green"
          trend={{ value: 8, isUp: true }}
        />
        <StatCard
          title="待处理"
          value={currentUser?.role === 'teacher' ? stats.pendingReview : stats.myPendingTasks}
          icon={Clock}
          color="accent"
          trend={{ value: 5, isUp: false }}
        />
        <StatCard
          title={currentUser?.role === 'teacher' ? '批注总数' : '平均分'}
          value={currentUser?.role === 'teacher' ? stats.totalAnnotations : (stats.myAvgScore || '--')}
          icon={Award}
          color="primary"
          trend={{ value: 3, isUp: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧主内容 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 最近病例 */}
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">最近病例</h2>
              <Link
                to="/cases"
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                查看全部
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentCases.map((caseItem) => (
                <CaseCard key={caseItem.id} caseData={caseItem} />
              ))}
            </div>
          </div>

          {/* 待办任务 */}
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">待办任务</h2>
              <span className="text-xs px-2 py-1 bg-accent-100 text-accent-700 rounded">
                {todoItems.length} 项待办
              </span>
            </div>
            <div className="space-y-2">
              {todoItems.length > 0 ? (
                todoItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleTodoClick(item as any)}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      item.type === '批注' ? 'bg-yellow-100 text-yellow-600' :
                      item.type === '待批阅' ? 'bg-blue-100 text-blue-600' :
                      'bg-primary-100 text-primary-600'
                    )}>
                      {item.type === '批注' ? (
                        <MessageSquareText className="w-4 h-4" />
                      ) : item.type === '待批阅' ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 group-hover:text-primary-600 transition-colors">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400">{item.type}</span>
                        <span className="text-xs text-slate-300">·</span>
                        <span className="text-xs text-accent-600">{item.deadline}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">太棒了，暂无待办任务！</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧边栏 */}
        <div className="space-y-6">
          {/* 学习进度（学生视角）*/}
          {currentUser?.role === 'student' && (
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">我的学习进度</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-slate-600">任务完成率</span>
                    <span className="font-medium text-primary-600">
                      {stats.myCompletedTasks > 0 ? Math.round(stats.myCompletedTasks / (stats.myCompletedTasks + stats.myPendingTasks) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-600 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${stats.myCompletedTasks > 0 
                          ? Math.round(stats.myCompletedTasks / (stats.myCompletedTasks + stats.myPendingTasks) * 100) 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-slate-600">已完成任务</span>
                    <span className="font-medium text-green-600">{stats.myCompletedTasks} 个</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(stats.myCompletedTasks * 20, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">当前平均分</span>
                  <span className="text-lg font-bold text-accent-600 font-mono">
                    {stats.myAvgScore || '--'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 快捷入口 */}
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">快捷入口</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: BookOpen, label: '病例库', path: '/cases', color: 'bg-blue-50 text-blue-600' },
                { icon: ClipboardCheck, label: '教学方案', path: '/teaching-plan', color: 'bg-green-50 text-green-600' },
                { icon: Clock, label: '随访日志', path: '/follow-up', color: 'bg-purple-50 text-purple-600' },
                { icon: Award, label: '考核面板', path: '/assessment', color: 'bg-amber-50 text-amber-600' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm text-slate-600">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 排行榜预览（只在老师视角或有数据时显示）*/}
          {currentUser?.role === 'teacher' && (
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">批阅统计</h2>
                <Link
                  to="/annotations"
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  查看全部
                </Link>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">总提交数</span>
                  <span className="text-lg font-bold text-slate-800 font-mono">{stats.totalSubmissions}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-700">批注总数</span>
                  <span className="text-lg font-bold text-blue-700 font-mono">{stats.totalAnnotations}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-700">已批阅</span>
                  <span className="text-lg font-bold text-green-700 font-mono">{stats.reviewedSubmissions}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm text-yellow-700">待批阅</span>
                  <span className="text-lg font-bold text-yellow-700 font-mono">{stats.pendingReview}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
