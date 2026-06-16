import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { 
  ArrowLeft, 
  ChevronRight, 
  Clock, 
  FileText, 
  BookOpen, 
  Upload,
  Send,
  User,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCaseStore } from '../store/useCaseStore';
import { useAuthStore } from '../store/useAuthStore';
import { cn } from '../lib/utils';

const taskTypeLabels: Record<string, string> = {
  initial_assessment: '初诊评估',
  stage_judgment: '阶段判断',
  treatment_suggestion: '治疗建议',
  followup_decision: '复诊决策',
};

export function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { originalCases, submissions, submitTask } = useCaseStore();
  const { currentUser } = useAuthStore();
  const [content, setContent] = useState('');
  const [judgmentBasis, setJudgmentBasis] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // 从所有病例中查找匹配的任务
  const taskInfo = useMemo(() => {
    for (const caseItem of originalCases) {
      for (const phase of caseItem.phases) {
        for (const task of phase.tasks) {
          if (task.id === taskId) {
            return {
              task,
              phase,
              caseItem,
            };
          }
        }
      }
    }
    return null;
  }, [originalCases, taskId]);

  // 查找当前用户的提交
  const mySubmission = useMemo(() => {
    if (!currentUser || !taskId) return null;
    return submissions.find(s => s.taskId === taskId && s.studentId === currentUser.id);
  }, [submissions, taskId, currentUser]);

  // 查找所有此任务的提交
  const allSubmissions = useMemo(() => {
    if (!taskId) return [];
    return submissions.filter(s => s.taskId === taskId);
  }, [submissions, taskId]);

  const handleSubmit = () => {
    if (!content || !judgmentBasis) {
      alert('请填写诊断判断和判断依据');
      return;
    }
    if (!currentUser || !taskInfo) return;
    submitTask(
      taskId!,
      { content, judgmentBasis },
      currentUser.id,
      currentUser.name,
      taskInfo.caseItem.id
    );
    setSubmitted(true);
    setContent('');
    setJudgmentBasis('');
  };

  if (!taskInfo) {
    return (
      <Layout>
        <div className="text-center py-16">
          <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 mb-4">未找到该任务</p>
          <button
            onClick={() => navigate('/teaching-plan')}
            className="text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            返回教学方案
          </button>
        </div>
      </Layout>
    );
  }

  const { task, phase, caseItem } = taskInfo;

  return (
    <Layout>
      {/* 返回按钮 */}
      <button
        onClick={() => navigate('/teaching-plan')}
        className="flex items-center gap-2 text-slate-600 hover:text-primary-600 mb-4 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>返回教学方案</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：任务详情和提交 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 任务头部 */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded">
                    {taskTypeLabels[task.type] || '任务'}
                  </span>
                  <span className="text-xs text-slate-400">
                    第 {phase.order} 阶段 · {phase.name}
                  </span>
                  {task.status === 'completed' && (
                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      已完成
                    </span>
                  )}
                  {task.status === 'in_progress' && (
                    <span className="px-2 py-0.5 text-xs bg-accent-100 text-accent-700 rounded inline-flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      进行中
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-slate-800 font-serif">{task.title}</h1>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">截止日期</p>
                  <p className="text-sm font-medium text-slate-700">{task.deadline}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">阶段周期</p>
                  <p className="text-sm font-medium text-slate-700">{phase.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">已提交</p>
                  <p className="text-sm font-medium text-slate-700">{allSubmissions.length} 人</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary-600" />
                  任务描述
                </h3>
                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg leading-relaxed">
                  {task.description}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary-600" />
                  任务要求
                </h3>
                <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg leading-relaxed whitespace-pre-line">
                  {task.requirements}
                </div>
              </div>
            </div>
          </div>

          {/* 学生提交区 */}
          {(currentUser?.role === 'student' || currentUser?.role === 'intern') && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">我的提交</h2>
              
              {mySubmission ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium',
                      mySubmission.status === 'reviewed' ? 'bg-green-100 text-green-700' :
                      mySubmission.status === 'needs_revision' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    )}>
                      {mySubmission.status === 'reviewed' ? '已批阅' :
                       mySubmission.status === 'needs_revision' ? '需修改' :
                       '待批阅'}
                    </span>
                    {mySubmission.score && (
                      <span className="text-sm text-slate-500">
                        得分：<span className="font-bold text-primary-600 text-lg">{mySubmission.score}</span> / 100
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">诊断判断</h4>
                    <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-700 leading-relaxed">
                      {mySubmission.content}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">判断依据</h4>
                    <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-700 leading-relaxed">
                      {mySubmission.judgmentBasis}
                    </div>
                  </div>
                  {mySubmission.annotations.length > 0 && (
                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">老师批注</h4>
                      <div className="space-y-3">
                        {mySubmission.annotations.map((anno) => (
                          <div key={anno.id} className="bg-primary-50 rounded-lg p-4 border-l-4 border-primary-500">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-primary-600">
                                {anno.teacherName} · {anno.createdAt}
                              </span>
                              <span className="text-xs text-slate-500">
                                严重程度：{'●'.repeat(anno.severity)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700">{anno.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : submitted ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-slate-700 mb-1">提交成功！</p>
                  <p className="text-slate-500">请等待老师批阅</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      诊断判断 / 处理建议
                    </label>
                    <textarea
                      rows={6}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="请根据任务要求，填写您的诊断判断或治疗建议..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      判断依据
                    </label>
                    <textarea
                      rows={4}
                      value={judgmentBasis}
                      onChange={(e) => setJudgmentBasis(e.target.value)}
                      placeholder="请详细说明您做出上述判断的依据，包括参考的资料数据、理论基础等..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                      <Upload className="w-4 h-4" />
                      上传附件
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                      提交作业
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 老师视角：所有提交 */}
          {currentUser?.role === 'teacher' && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                学生提交列表
                <span className="ml-2 text-sm font-normal text-slate-400">
                  ({allSubmissions.length} 人)
                </span>
              </h2>
              {allSubmissions.length > 0 ? (
                <div className="space-y-3">
                  {allSubmissions.map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/annotations?submissionId=${sub.id}&from=task-${taskId}`}
                      className="block p-4 border border-slate-200 rounded-lg hover:border-primary-300 hover:bg-slate-50 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.studentId}`}
                            alt={sub.studentName}
                            className="w-9 h-9 rounded-full bg-slate-200"
                          />
                          <div>
                            <p className="font-medium text-slate-700">{sub.studentName}</p>
                            <p className="text-xs text-slate-500">提交于 {sub.submittedAt}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {sub.score && (
                            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-bold">
                              {sub.score}分
                            </span>
                          )}
                          <span className={cn(
                            'px-2.5 py-1 rounded text-xs font-medium',
                            sub.status === 'reviewed' ? 'bg-green-100 text-green-700' :
                            sub.status === 'needs_revision' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          )}>
                            {sub.status === 'reviewed' ? '已批阅' :
                             sub.status === 'needs_revision' ? '需修改' : '待批阅'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">{sub.content}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500">暂无学生提交</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 右侧：相关病例资料 */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-5 sticky top-20">
            <h3 className="font-semibold text-slate-800 mb-4">相关病例资料</h3>
            <Link
              to={`/cases/${caseItem.id}`}
              className="block p-3 bg-primary-50 rounded-lg mb-4 hover:bg-primary-100 transition-colors"
            >
              <p className="text-xs text-primary-400 mb-0.5">{caseItem.anonymousCode}</p>
              <p className="text-sm font-medium text-primary-700 line-clamp-1">{caseItem.diagnosis}</p>
            </Link>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">基本信息</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-slate-500">年龄段</span>
                    <span className="text-slate-700">{caseItem.ageGroup}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-500">治疗类型</span>
                    <span className="text-slate-700">{caseItem.treatmentType}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-500">难度等级</span>
                    <span className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      caseItem.difficultyLevel === 'easy' ? 'bg-green-100 text-green-700' :
                      caseItem.difficultyLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    )}>
                      {caseItem.difficultyLevel === 'easy' ? '简单' : 
                       caseItem.difficultyLevel === 'medium' ? '中等' : '困难'}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">病例描述</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{caseItem.description}</p>
              </div>

              {caseItem.photos.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    相关照片 ({caseItem.photos.length})
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {caseItem.photos.slice(0, 6).map((photo) => (
                      <Link
                        key={photo.id}
                        to={`/cases/${caseItem.id}`}
                        className="aspect-square rounded overflow-hidden bg-slate-100 hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={photo.thumbnail}
                          alt={photo.description}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {caseItem.followUpRecords.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">随访记录</h4>
                  <div className="space-y-2">
                    {caseItem.followUpRecords.slice(0, 3).map((record) => (
                      <div key={record.id} className="p-2 bg-slate-50 rounded text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-slate-700">第{record.visitNumber}次</span>
                          <span className="text-slate-400">{record.date}</span>
                        </div>
                        <p className="text-slate-500 line-clamp-1">{record.description}</p>
                      </div>
                    ))}
                  </div>
                  <Link
                    to="/follow-up"
                    className="text-xs text-primary-600 hover:text-primary-700 mt-2 inline-flex items-center gap-1"
                  >
                    查看全部随访记录
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
