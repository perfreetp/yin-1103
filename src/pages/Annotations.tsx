import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { 
  MessageSquareText,
  AlertTriangle,
  CheckCircle,
  User,
  Clock,
  ChevronRight,
  Filter,
  ThumbsUp,
  XCircle,
  Minus,
  X,
  Send
} from 'lucide-react';
import { useCaseStore } from '../store/useCaseStore';
import { useAuthStore } from '../store/useAuthStore';
import { cn } from '../lib/utils';

const deviationTypeLabels: Record<string, string> = {
  diagnosis: '诊断偏差',
  treatment_plan: '方案偏差',
  timing: '时机偏差',
  method: '方法偏差',
  other: '其他',
};

const severityConfig: Record<number, { label: string; color: string; icon: any }> = {
  1: { label: '轻度', color: 'bg-green-100 text-green-700', icon: ThumbsUp },
  2: { label: '中度', color: 'bg-yellow-100 text-yellow-700', icon: Minus },
  3: { label: '重度', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
};

export function Annotations() {
  const { submissions, originalCases, addAnnotation } = useCaseStore();
  const { currentUser } = useAuthStore();
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(
    submissions.find(s => s.annotations.length > 0)?.id || null
  );
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'compare'>('list');
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newDeviationType, setNewDeviationType] = useState('diagnosis');
  const [newSeverity, setNewSeverity] = useState<1 | 2 | 3>(2);

  const currentSubmission = submissions.find(s => s.id === selectedSubmission);
  const currentCase = currentSubmission
    ? originalCases.find(c => c.id === currentSubmission.caseId)
    : null;

  const filteredSubmissions = submissions.filter(s => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return s.status === 'submitted' && s.annotations.length === 0;
    if (filterStatus === 'reviewed') return s.status === 'reviewed';
    if (filterStatus === 'needs_revision') return s.status === 'needs_revision';
    return true;
  });

  const submissionsForCompare = submissions.filter(s => s.taskId === 'case-001-task-4');

  const stats = {
    pending: submissions.filter(s => s.status === 'submitted').length,
    reviewed: submissions.filter(s => s.status === 'reviewed').length,
    needsRevision: submissions.filter(s => s.status === 'needs_revision').length,
    totalAnnotations: submissions.reduce((acc, s) => acc + s.annotations.length, 0),
  };

  const handleAddAnnotation = () => {
    if (!currentSubmission || !currentUser) return;
    if (!newContent.trim()) {
      alert('请填写批注内容');
      return;
    }
    addAnnotation(
      currentSubmission.id,
      {
        content: newContent,
        deviationType: newDeviationType,
        severity: newSeverity,
      },
      currentUser.id,
      currentUser.name
    );
    setShowAnnotationModal(false);
    setNewContent('');
    setNewDeviationType('diagnosis');
    setNewSeverity(2);
  };

  return (
    <Layout>
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">批注点评</h1>
          <p className="text-slate-500 mt-1">
            逐条批注方案偏差，对比不同学生的复诊决策
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* 视图切换 */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-4 py-2 text-sm transition-colors',
                viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-slate-500 hover:bg-slate-50'
              )}
            >
              列表视图
            </button>
            <button
              onClick={() => setViewMode('compare')}
              className={cn(
                'px-4 py-2 text-sm transition-colors',
                viewMode === 'compare' ? 'bg-primary-50 text-primary-600' : 'text-slate-500 hover:bg-slate-50'
              )}
            >
              对比视图
            </button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: '待批阅', value: stats.pending, color: 'text-accent-600 bg-accent-50' },
          { label: '已批注', value: stats.reviewed, color: 'text-green-600 bg-green-50' },
          { label: '需修改', value: stats.needsRevision, color: 'text-red-600 bg-red-50' },
          { label: '批注总数', value: stats.totalAnnotations, color: 'text-primary-600 bg-primary-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-sm text-slate-500 mb-2">{stat.label}</p>
            <div className="flex items-center gap-2">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', stat.color)}>
                <MessageSquareText className="w-4 h-4" />
              </div>
              <span className="text-2xl font-bold text-slate-800 font-mono">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧提交列表 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-slate-800">学生提交</h3>
                  <Filter className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex gap-2">
                  {[
                    { value: 'all', label: '全部' },
                    { value: 'pending', label: '待批阅' },
                    { value: 'reviewed', label: '已批注' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFilterStatus(opt.value)}
                      className={cn(
                        'px-3 py-1.5 text-xs rounded-md transition-colors',
                        filterStatus === opt.value
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {filteredSubmissions.map((submission) => {
                  const caseItem = originalCases.find(c => c.id === submission.caseId);
                  const isSelected = selectedSubmission === submission.id;
                  
                  return (
                    <div
                      key={submission.id}
                      onClick={() => setSelectedSubmission(submission.id)}
                      className={cn(
                        'p-4 cursor-pointer transition-all',
                        isSelected
                          ? 'bg-primary-50 border-l-4 border-primary-600'
                          : 'hover:bg-slate-50 border-l-4 border-transparent'
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${submission.studentId}`}
                            alt={submission.studentName}
                            className="w-8 h-8 rounded-full bg-slate-200"
                          />
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {submission.studentName}
                            </p>
                            <p className="text-xs text-slate-400">
                              {caseItem?.anonymousCode}
                            </p>
                          </div>
                        </div>
                        {submission.status === 'reviewed' ? (
                          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                            已批阅
                          </span>
                        ) : submission.status === 'needs_revision' ? (
                          <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                            需修改
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs font-medium bg-accent-100 text-accent-700 rounded">
                            待批阅
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                        {submission.content.substring(0, 60)}...
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{submission.submittedAt}</span>
                        </div>
                        {submission.annotations.length > 0 && (
                          <span className="flex items-center gap-1 text-primary-500">
                            <MessageSquareText className="w-3 h-3" />
                            {submission.annotations.length} 条批注
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {filteredSubmissions.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-slate-400 text-sm">暂无匹配的提交记录</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧详情和批注 */}
          <div className="lg:col-span-2 space-y-6">
            {currentSubmission && currentCase ? (
              <>
                {/* 学生提交内容 */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentSubmission.studentId}`}
                        alt={currentSubmission.studentName}
                        className="w-10 h-10 rounded-full bg-slate-200"
                      />
                      <div>
                        <h3 className="font-medium text-slate-800">
                          {currentSubmission.studentName}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {currentCase.anonymousCode} · 提交于 {currentSubmission.submittedAt}
                        </p>
                      </div>
                    </div>
                    {currentSubmission.score && (
                      <div className="text-right">
                        <span className="text-2xl font-bold text-primary-600 font-mono">
                          {currentSubmission.score}
                        </span>
                        <span className="text-sm text-slate-400">/100</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-2">诊断判断</h4>
                      <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg leading-relaxed">
                        {currentSubmission.content}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-2">判断依据</h4>
                      <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg leading-relaxed">
                        {currentSubmission.judgmentBasis}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 批注列表 */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-medium text-slate-800">老师批注</h3>
                    <button 
                      onClick={() => setShowAnnotationModal(true)}
                      className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1"
                    >
                      <Send className="w-4 h-4" />
                      添加批注
                    </button>
                  </div>

                  {currentSubmission.annotations.length > 0 ? (
                    <div className="space-y-4">
                      {currentSubmission.annotations.map((annotation) => {
                        const severity = severityConfig[annotation.severity];
                        const SeverityIcon = severity.icon;
                        
                        return (
                          <div
                            key={annotation.id}
                            className="bg-slate-50 rounded-lg p-4 border-l-4 border-primary-500"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={cn('px-2 py-0.5 rounded text-xs font-medium inline-flex items-center gap-1', severity.color)}>
                                  <SeverityIcon className="w-3 h-3" />
                                  {severity.label}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {deviationTypeLabels[annotation.deviationType]}
                                </span>
                              </div>
                              <span className="text-xs text-slate-400">{annotation.createdAt}</span>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed">{annotation.content}</p>
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200">
                              <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${annotation.teacherId}`}
                                alt={annotation.teacherName}
                                className="w-5 h-5 rounded-full bg-slate-200"
                              />
                              <span className="text-xs text-slate-500">{annotation.teacherName}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MessageSquareText className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500">暂无批注</p>
                      <p className="text-xs text-slate-400 mt-1">点击上方按钮添加批注</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 p-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquareText className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500">请选择一个学生提交查看详情</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 对比视图 */
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-medium text-slate-800">复诊决策对比</h3>
              <p className="text-sm text-slate-500 mt-1">
                CASE-A-2024-001 · 第3次复诊决策
              </p>
            </div>
            <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
              <option>选择任务</option>
              <option>第3次复诊决策</option>
              <option>初诊评估</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {submissionsForCompare.map((submission, index) => (
              <div
                key={submission.id}
                className={cn(
                  'rounded-lg p-5 border-2 transition-all',
                  index === 0 ? 'border-primary-200 bg-primary-50/30' : 'border-slate-200 bg-slate-50/50'
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${submission.studentId}`}
                      alt={submission.studentName}
                      className="w-10 h-10 rounded-full bg-slate-200"
                    />
                    <div>
                      <h4 className="font-medium text-slate-800">{submission.studentName}</h4>
                      <p className="text-xs text-slate-500">提交于 {submission.submittedAt}</p>
                    </div>
                  </div>
                  {submission.status === 'reviewed' && submission.score && (
                    <span className="px-3 py-1 bg-primary-600 text-white text-sm font-bold rounded-full">
                      {submission.score}分
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">决策内容</p>
                    <p className="text-sm text-slate-700">{submission.content}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">判断依据</p>
                    <p className="text-sm text-slate-700">{submission.judgmentBasis}</p>
                  </div>
                </div>

                {submission.annotations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs font-medium text-slate-500 mb-2">批注要点</p>
                    <div className="space-y-2">
                      {submission.annotations.slice(0, 2).map((anno) => (
                        <div
                          key={anno.id}
                          className="text-xs text-slate-600 bg-white rounded p-2 border border-slate-200"
                        >
                          <span className="font-medium text-primary-600">
                            {deviationTypeLabels[anno.deviationType]}：
                          </span>
                          {anno.content}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => { setSelectedSubmission(submission.id); setViewMode('list'); }}
                  className="w-full mt-4 py-2 text-sm text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors flex items-center justify-center gap-1"
                >
                  查看完整批注
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
            {submissionsForCompare.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <p className="text-slate-400">暂无对比数据</p>
              </div>
            )}
          </div>

          {/* 对比总结 */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-medium text-slate-800 mb-3">对比总结</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-700">共同点</p>
                  <p className="text-slate-500">两位同学都认为可以进入下一阶段，治疗进度判断一致</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-700">分歧点</p>
                  <p className="text-slate-500">关于换丝时机和力的大小存在不同意见，需重点讲解</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 添加批注模态框 */}
      {showAnnotationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">添加批注</h3>
              <button
                onClick={() => setShowAnnotationModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              {currentSubmission && (
                <div className="p-3 bg-slate-50 rounded-lg flex items-center gap-3">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentSubmission.studentId}`}
                    alt={currentSubmission.studentName}
                    className="w-9 h-9 rounded-full bg-slate-200"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-700">给 {currentSubmission.studentName} 添加批注</p>
                    <p className="text-xs text-slate-500">{currentCase?.anonymousCode}</p>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  偏差类型
                </label>
                <select
                  value={newDeviationType}
                  onChange={(e) => setNewDeviationType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                >
                  {Object.entries(deviationTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  严重程度
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(severityConfig).map(([key, config]) => {
                    const level = Number(key) as 1 | 2 | 3;
                    const SeverityIcon = config.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setNewSeverity(level)}
                        className={cn(
                          'flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all',
                          newSeverity === level
                            ? `${config.color} border-current`
                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        )}
                      >
                        <SeverityIcon className="w-4 h-4" />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  批注内容
                </label>
                <textarea
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="请详细描述问题点和改进建议，具体说明应该如何调整方案、时机或方法..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setShowAnnotationModal(false)}
                className="px-5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddAnnotation}
                className="px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                保存批注
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
