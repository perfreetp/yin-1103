import { useState, useMemo, useRef } from 'react';
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
  BookOpen,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Target,
  Download
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

  // 学习分析数据 - 老师视角
  const analysisData = useMemo(() => {
    if (!studentInfo) return null;
    
    // 病例覆盖：每个病例的完成度
    const caseCoverage = trailData.map(caseItem => {
      const totalTasks = caseItem.phases.reduce((sum, p) => sum + p.tasks.length, 0);
      const completedTasks = caseItem.caseSubmissions.filter(s => s.status === 'reviewed').length;
      const submittedTasks = caseItem.caseSubmissions.filter(s => s.status === 'submitted').length;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      return {
        caseId: caseItem.id,
        caseName: caseItem.diagnosis,
        anonymousCode: caseItem.anonymousCode,
        totalTasks,
        completedTasks,
        submittedTasks,
        completionRate,
      };
    });
    
    // 阶段完成：按阶段汇总
    const phaseCompletion = (() => {
      const phaseMap = new Map<string, { name: string; total: number; completed: number; pending: number; caseIds: string[] }>();
      trailData.forEach(caseItem => {
        caseItem.phases.forEach(phase => {
          const key = phase.name;
          if (!phaseMap.has(key)) {
            phaseMap.set(key, { name: phase.name, total: 0, completed: 0, pending: 0, caseIds: [] });
          }
          const data = phaseMap.get(key)!;
          data.total += phase.tasks.length;
          data.completed += phase.submissions.filter(s => s.status === 'reviewed').length;
          data.pending += phase.submissions.filter(s => s.status === 'submitted').length;
          if (!data.caseIds.includes(caseItem.id)) {
            data.caseIds.push(caseItem.id);
          }
        });
      });
      return Array.from(phaseMap.values()).map(p => ({
        ...p,
        completionRate: p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0,
      }));
    })();
    
    // 待批阅积压：按病例和阶段
    const pendingReview = (() => {
      const items: Array<{
        caseId: string;
        caseName: string;
        phaseName: string;
        taskId: string;
        taskName: string;
        submissionId: string;
        submittedAt: string;
      }> = [];
      trailData.forEach(caseItem => {
        caseItem.phases.forEach(phase => {
          phase.taskSubmissions.forEach(({ task, submission }) => {
            if (submission && submission.status === 'submitted') {
              items.push({
                caseId: caseItem.id,
                caseName: caseItem.diagnosis,
                phaseName: phase.name,
                taskId: task.id,
                taskName: task.title,
                submissionId: submission.id,
                submittedAt: submission.submittedAt,
              });
            }
          });
        });
      });
      return items.sort((a, b) => 
        new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
      );
    })();
    
    // 平均分趋势：按阶段和时间
    const scoreTrend = (() => {
      const phaseScores: Array<{ phaseName: string; avgScore: number; count: number }> = [];
      const phaseMap = new Map<string, { total: number; count: number }>();
      
      studentInfo.submissions
        .filter(s => s.score)
        .forEach(s => {
          // 找到这个任务属于哪个阶段
          let phaseName = '未知阶段';
          for (const caseItem of trailData) {
            for (const phase of caseItem.phases) {
              if (phase.tasks.some(t => t.id === s.taskId)) {
                phaseName = phase.name;
                break;
              }
            }
          }
          
          if (!phaseMap.has(phaseName)) {
            phaseMap.set(phaseName, { total: 0, count: 0 });
          }
          const data = phaseMap.get(phaseName)!;
          data.total += s.score || 0;
          data.count += 1;
        });
      
      phaseMap.forEach((value, key) => {
        phaseScores.push({
          phaseName: key,
          avgScore: Math.round(value.total / value.count),
          count: value.count,
        });
      });
      
      return phaseScores;
    })();
    
    return {
      caseCoverage,
      phaseCompletion,
      pendingReview,
      scoreTrend,
    };
  }, [studentInfo, trailData]);

  // 跳转到指定病例和阶段的 ref
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  const scrollToSection = (caseId: string, phaseId?: string) => {
    const key = phaseId ? `${caseId}-${phaseId}` : caseId;
    const el = sectionRefs.current.get(key);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('ring-2', 'ring-primary-400', 'ring-offset-2');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-primary-400', 'ring-offset-2');
      }, 2000);
    }
  };

  // 导出带教记录
  const exportTrailReport = () => {
    if (!studentInfo) return;
    
    let report = '';
    report += '='.repeat(60) + '\n';
    report += '           口腔正畸教学 - 学生学习轨迹报告\n';
    report += '='.repeat(60) + '\n\n';
    
    // 学生基本信息
    report += '【学生基本信息】\n';
    report += `学生姓名：${studentInfo.name}\n`;
    report += `学生编号：${studentInfo.id}\n\n`;
    
    // 总体统计
    report += '【学习概况】\n';
    report += `参与病例数：${studentInfo.cases.length} 个\n`;
    report += `总提交次数：${studentInfo.totalSubmissions} 次\n`;
    report += `已批阅次数：${studentInfo.reviewedSubmissions} 次\n`;
    report += `待批阅次数：${studentInfo.pendingSubmissions} 次\n`;
    report += `平均成绩：${studentInfo.avgScore || '--'} 分\n\n`;
    
    // 各病例详情
    report += '【各病例学习详情】\n';
    report += '-'.repeat(50) + '\n\n';
    
    trailData.forEach((caseItem, caseIdx) => {
      report += `病例 ${caseIdx + 1}：${caseItem.diagnosis}\n`;
      report += `病例编号：${caseItem.anonymousCode}\n`;
      report += `提交次数：${caseItem.caseSubmissions.length} 次\n\n`;
      
      caseItem.phases.forEach((phase) => {
        report += `  ▶ ${phase.name}\n`;
        
        phase.taskSubmissions.forEach(({ task, submission }) => {
          if (!submission) return;
          
          const statusText = submission.status === 'reviewed' ? '已批阅' :
                            submission.status === 'needs_revision' ? '需修改' : '待批阅';
          const scoreText = submission.score ? `${submission.score}分` : '暂无评分';
          
          report += `    · ${task.title} [${statusText}] [${scoreText}]\n`;
          report += `      提交时间：${submission.submittedAt}\n`;
          
          if (submission.content) {
            const contentPreview = submission.content.length > 100 
              ? submission.content.substring(0, 100) + '...' 
              : submission.content;
            report += `      提交内容：${contentPreview}\n`;
          }
          
          if (submission.annotations.length > 0) {
            report += `      批注数：${submission.annotations.length} 条\n`;
            submission.annotations.forEach((ann, annIdx) => {
              report += `        ${annIdx + 1}. [${ann.deviationType || '一般'}] ${ann.content.substring(0, 50)}\n`;
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
    a.download = `${studentInfo.name}_学习轨迹报告_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
          <div className="text-right flex items-center gap-4">
            <button
              onClick={exportTrailReport}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              导出报告
            </button>
            <div>
              <div className="text-4xl font-bold text-primary-600 font-mono">
                {studentInfo.avgScore || '--'}
              </div>
              <p className="text-sm text-slate-500 mt-1">平均成绩</p>
            </div>
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

      {/* 学习分析面板 - 老师视角 */}
      {analysisData && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-slate-800">学习分析</h2>
            </div>
            <span className="text-xs text-slate-400">点击卡片可快速定位</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 病例覆盖 */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary-500" />
                病例覆盖度
              </h3>
              <div className="space-y-3">
                {analysisData.caseCoverage.slice(0, 4).map(item => (
                  <div
                    key={item.caseId}
                    onClick={() => scrollToSection(item.caseId)}
                    className="p-3 rounded-lg bg-slate-50 hover:bg-primary-50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-slate-700 group-hover:text-primary-700 truncate">
                        {item.anonymousCode}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {item.completedTasks}/{item.totalTasks} 任务
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                        style={{ width: `${item.completionRate}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-slate-400">完成率</span>
                      <span className="text-xs font-medium text-primary-600 font-mono">{item.completionRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 阶段完成 */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                阶段完成情况
              </h3>
              <div className="space-y-3">
                {analysisData.phaseCompletion.slice(0, 4).map(item => (
                  <div
                    key={item.name}
                    onClick={() => {
                      // 找到第一个有这个阶段的病例并跳转
                      const targetCase = trailData.find(c => c.phases.some(p => p.name === item.name));
                      const targetPhase = targetCase?.phases.find(p => p.name === item.name);
                      if (targetCase && targetPhase) {
                        scrollToSection(targetCase.id, targetPhase.id);
                      }
                    }}
                    className="p-3 rounded-lg bg-slate-50 hover:bg-green-50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-slate-700 group-hover:text-green-700">
                        {item.name}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {item.completed} 已完成 / {item.pending} 待批阅
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                        style={{ width: `${item.completionRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 待批阅积压 */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                待批阅积压
                {analysisData.pendingReview.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                    {analysisData.pendingReview.length} 项
                  </span>
                )}
              </h3>
              {analysisData.pendingReview.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <p>暂无待批阅任务</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {analysisData.pendingReview.slice(0, 5).map(item => (
                    <div
                      key={item.submissionId}
                      onClick={() => scrollToSection(item.caseId)}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-yellow-50 hover:bg-yellow-100 cursor-pointer transition-colors"
                    >
                      <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{item.taskName}</p>
                        <p className="text-xs text-slate-500">{item.caseName} · {item.phaseName}</p>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {new Date(item.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 平均分趋势 */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent-500" />
                平均分趋势
              </h3>
              {analysisData.scoreTrend.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-400">
                  <Award className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>暂无成绩数据</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analysisData.scoreTrend.map(item => (
                    <div
                      key={item.phaseName}
                      onClick={() => {
                        const targetCase = trailData.find(c => c.phases.some(p => p.name === item.phaseName));
                        const targetPhase = targetCase?.phases.find(p => p.name === item.phaseName);
                        if (targetCase && targetPhase) {
                          scrollToSection(targetCase.id, targetPhase.id);
                        }
                      }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-accent-50 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {item.avgScore}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">{item.phaseName}</p>
                        <p className="text-xs text-slate-500">{item.count} 次评分</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 学习轨迹时间线 */}
      <div className="space-y-6">
        {trailData.map((caseItem) => (
          <div
            key={caseItem.id}
            ref={(el) => {
              if (el) sectionRefs.current.set(caseItem.id, el);
            }}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-300"
          >
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
                  <div
                    key={phase.id}
                    ref={(el) => {
                      if (el) sectionRefs.current.set(`${caseItem.id}-${phase.id}`, el);
                    }}
                    className="transition-all duration-300 rounded-lg"
                  >
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
