import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { 
  ArrowLeft,
  User,
  FolderKanban,
  CheckCircle2,
  Clock,
  ChevronRight,
  MessageSquareText,
  FileText,
  Award,
  BookOpen
} from 'lucide-react';
import { useCaseStore } from '../store/useCaseStore';
import { useAuthStore } from '../store/useAuthStore';
import { cn } from '../lib/utils';

export function StudentTrail() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { originalCases, submissions } = useCaseStore();
  const { currentUser } = useAuthStore();

  // 确定要查看的学生ID（URL参数优先，否则看当前用户）
  const targetStudentId = studentId || currentUser?.id || '';
  
  // 获取学生信息
  const studentInfo = useMemo(() => {
    if (!targetStudentId) return null;
    
    const studentSubs = submissions.filter(s => s.studentId === targetStudentId);
    const studentName = studentSubs.length > 0 ? studentSubs[0].studentName : (currentUser?.name || '学生');
    
    // 参与的病例
    const caseIds = [...new Set(studentSubs.map(s => s.caseId))];
    const cases = caseIds
      .map(id => originalCases.find(c => c.id === id))
      .filter(Boolean) as typeof originalCases;
    
    // 统计
    const totalSubmissions = studentSubs.length;
    const reviewedSubmissions = studentSubs.filter(s => s.status === 'reviewed').length;
    const pendingSubmissions = studentSubs.filter(s => s.status === 'submitted').length;
    const avgScore = (() => {
      const scored = studentSubs.filter(s => s.score);
      if (scored.length === 0) return 0;
      return Math.round(scored.reduce((sum, s) => sum + (s.score || 0), 0) / scored.length);
    })();
    
    return {
      id: targetStudentId,
      name: studentName,
      cases,
      totalSubmissions,
      reviewedSubmissions,
      pendingSubmissions,
      avgScore,
      submissions: studentSubs,
    };
  }, [targetStudentId, submissions, originalCases, currentUser]);

  // 按病例和阶段组织提交记录
  const trailData = useMemo(() => {
    if (!studentInfo) return [];
    
    return studentInfo.cases.map((caseItem) => {
      const caseSubmissions = studentInfo.submissions.filter(s => s.caseId === caseItem.id);
      
      // 按阶段组织
      const phases = caseItem.phases.map((phase) => {
        const phaseSubmissions = caseSubmissions.filter(s => {
          const taskIds = phase.tasks.map(t => t.id);
          return taskIds.includes(s.taskId);
        });
        
        // 每个任务的提交
        const taskSubmissions = phase.tasks.map((task) => {
          const submission = phaseSubmissions.find(s => s.taskId === task.id);
          return {
            task,
            submission,
          };
        }).filter(item => item.submission);
        
        return {
          ...phase,
          submissions: phaseSubmissions,
          taskSubmissions,
        };
      }).filter(p => p.submissions.length > 0);
      
      return {
        ...caseItem,
        phases,
        caseSubmissions,
      };
    });
  }, [studentInfo]);

  if (!studentInfo) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-slate-600">未找到学生信息</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* 返回按钮 */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-600 hover:text-primary-600 mb-4 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>返回</span>
      </button>

      {/* 学生信息头部 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-5">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${studentInfo.id}`}
            alt={studentInfo.name}
            className="w-20 h-20 rounded-full bg-slate-100 border-4 border-primary-100"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800 font-serif">
              {studentInfo.name}
            </h1>
            <p className="text-slate-500 mt-1">学习轨迹</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                <FolderKanban className="w-4 h-4 text-primary-500" />
                {studentInfo.cases.length} 个病例
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                <FileText className="w-4 h-4 text-blue-500" />
                {studentInfo.totalSubmissions} 次提交
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {studentInfo.reviewedSubmissions} 次已批阅
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-primary-600 font-mono">
              {studentInfo.avgScore || '--'}
            </div>
            <p className="text-sm text-slate-500 mt-1">平均成绩</p>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">参与病例</p>
              <p className="text-2xl font-bold text-slate-800 font-mono">{studentInfo.cases.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <FolderKanban className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">已完成任务</p>
              <p className="text-2xl font-bold text-green-600 font-mono">{studentInfo.reviewedSubmissions}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">待批阅</p>
              <p className="text-2xl font-bold text-yellow-600 font-mono">{studentInfo.pendingSubmissions}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">总提交数</p>
              <p className="text-2xl font-bold text-slate-800 font-mono">{studentInfo.totalSubmissions}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* 学习轨迹时间线 */}
      <div className="space-y-6">
        {trailData.map((caseItem) => (
          <div key={caseItem.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* 病例头部 */}
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-mono">{caseItem.anonymousCode}</p>
                    <h3 className="text-lg font-semibold text-slate-800">{caseItem.diagnosis}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">
                    {caseItem.caseSubmissions.length} 次提交
                  </span>
                  <Link
                    to={`/cases/${caseItem.id}`}
                    className="text-sm text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
                  >
                    查看病例
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* 阶段列表 */}
            <div className="p-5">
              <div className="space-y-6">
                {caseItem.phases.map((phase, phaseIdx) => (
                  <div key={phase.id}>
                    {/* 阶段标题 */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                        {phaseIdx + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800">{phase.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{phase.duration}</p>
                      </div>
                      <div className="text-xs text-slate-400">
                        {phase.submissions.length} 项任务
                      </div>
                    </div>

                    {/* 任务提交列表 */}
                    <div className="ml-4 pl-6 border-l-2 border-slate-200 space-y-4">
                      {phase.taskSubmissions.map(({ task, submission }) => (
                        <div
                          key={submission!.id}
                          className="relative bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors group"
                        >
                          {/* 时间线节点 */}
                          <div className="absolute -left-[29px] top-5 w-4 h-4 rounded-full bg-white border-2 border-primary-500" />
                          
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="font-medium text-slate-800 group-hover:text-primary-700 transition-colors">
                                  {task.title}
                                </h5>
                                <span className={cn(
                                  'px-2 py-0.5 rounded text-xs font-medium',
                                  submission!.status === 'reviewed' ? 'bg-green-100 text-green-700' :
                                  submission!.status === 'needs_revision' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                )}>
                                  {submission!.status === 'reviewed' ? '已批阅' :
                                   submission!.status === 'needs_revision' ? '需修改' : '待批阅'}
                                </span>
                              </div>
                              
                              {/* 提交内容预览 */}
                              <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                                {submission!.content}
                              </p>
                              
                              {/* 批注预览 */}
                              {submission!.annotations.length > 0 && (
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <MessageSquareText className="w-3.5 h-3.5 text-primary-500" />
                                  <span>{submission!.annotations.length} 条批注</span>
                                  {submission!.score && (
                                    <>
                                      <span className="text-slate-300">·</span>
                                      <span className="text-primary-600 font-medium">
                                        {submission!.score} 分
                                      </span>
                                    </>
                                  )}
                                </div>
                              )}
                              
                              <p className="text-xs text-slate-400 mt-2">
                                提交于 {submission!.submittedAt}
                              </p>
                            </div>
                            
                            {/* 操作按钮 */}
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              <button
                                onClick={() => navigate(`/teaching-plan/${task.id}`)}
                                className="px-3 py-1.5 text-xs bg-white border border-slate-200 text-slate-600 rounded hover:border-primary-300 hover:text-primary-600 transition-colors inline-flex items-center gap-1"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                查看任务
                              </button>
                              <button
                                onClick={() => navigate(`/annotations?submissionId=${submission!.id}&from=task-${task.id}`)}
                                className="px-3 py-1.5 text-xs bg-primary-50 text-primary-600 rounded hover:bg-primary-100 transition-colors inline-flex items-center gap-1"
                              >
                                <MessageSquareText className="w-3.5 h-3.5" />
                                查看批注
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* 没有数据的情况 */}
        {trailData.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
            <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">暂无学习记录</h3>
            <p className="text-slate-500">该学生尚未参与任何病例学习</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
