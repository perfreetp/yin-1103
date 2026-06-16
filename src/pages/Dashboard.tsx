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
  BookOpen
} from 'lucide-react';
import { useCaseStore } from '../store/useCaseStore';
import { useAuthStore } from '../store/useAuthStore';
import { taskSubmissions } from '../data/cases';
import { studentAssessments } from '../data/assessment';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { cases } = useCaseStore();
  const { currentUser } = useAuthStore();
  
  const recentCases = cases.slice(0, 3);
  const pendingTasks = taskSubmissions.filter(s => s.status === 'submitted').slice(0, 3);
  const myAssessment = currentUser?.role === 'student' 
    ? studentAssessments.find(a => a.studentId === currentUser.id)
    : null;

  const todoItems = [
    { id: 1, title: '审阅 CASE-A-2024-001 初诊评估', type: '批注', deadline: '今天' },
    { id: 2, title: '完成 第3次复诊决策 任务', type: '任务', deadline: '明天' },
    { id: 3, title: '参与 病例讨论会议', type: '会议', deadline: '本周五' },
    { id: 4, title: '提交 异常处置练习', type: '考核', deadline: '下周一' },
  ];

  return (
    <Layout>
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 font-serif">
          早上好，{currentUser?.name}
        </h1>
        <p className="text-slate-500 mt-1">
          今天有 {pendingTasks.length} 项待处理任务，加油！
        </p>
      </div>

      {/* 数据统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="在跟病例"
          value={cases.filter(c => c.status === 'in_progress').length}
          icon={FolderKanban}
          color="primary"
          trend={{ value: 12, isUp: true }}
        />
        <StatCard
          title="已完成任务"
          value={currentUser?.role === 'teacher' ? 24 : 18}
          icon={ClipboardCheck}
          color="green"
          trend={{ value: 8, isUp: true }}
        />
        <StatCard
          title="待处理"
          value={pendingTasks.length}
          icon={Clock}
          color="accent"
          trend={{ value: 5, isUp: false }}
        />
        <StatCard
          title="平均分"
          value={myAssessment?.averageScore || '--'}
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
              {todoItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 group-hover:text-primary-600 transition-colors">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400">{item.type}</span>
                      <span className="text-xs text-slate-300">·</span>
                      <span className="text-xs text-accent-600">截止：{item.deadline}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧边栏 */}
        <div className="space-y-6">
          {/* 学习进度 */}
          {myAssessment && (
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">我的学习进度</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-slate-600">病例跟踪完成率</span>
                    <span className="font-medium text-primary-600">{myAssessment.completionRate}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-600 rounded-full transition-all duration-500"
                      style={{ width: `${myAssessment.completionRate}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-slate-600">异常处置正确率</span>
                    <span className="font-medium text-green-600">{myAssessment.exerciseAccuracy}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${myAssessment.exerciseAccuracy}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">当前排名</span>
                  <span className="text-lg font-bold text-accent-600 font-mono">
                    第 {myAssessment.rank} 名
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

          {/* 排行榜预览 */}
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">学习排行</h2>
              <Link
                to="/assessment"
                className="text-xs text-primary-600 hover:text-primary-700"
              >
                查看完整榜单
              </Link>
            </div>
            <div className="space-y-3">
              {studentAssessments.slice(0, 3).map((student, index) => (
                <div key={student.studentId} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0
                        ? 'bg-yellow-400 text-white'
                        : index === 1
                        ? 'bg-slate-300 text-white'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <img
                    src={student.avatar}
                    alt={student.studentName}
                    className="w-8 h-8 rounded-full bg-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {student.studentName}
                    </p>
                    <p className="text-xs text-slate-400">
                      完成率 {student.completionRate}%
                    </p>
                  </div>
                  <span className="text-sm font-bold text-primary-600 font-mono">
                    {student.averageScore}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
