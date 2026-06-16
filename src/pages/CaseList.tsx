import { useState, useMemo } from 'react';
import { Layout } from '../components/layout/Layout';
import { CaseCard } from '../components/business/CaseCard';
import { 
  Search, 
  Filter, 
  Plus, 
  Grid3X3, 
  List,
  SlidersHorizontal,
  X,
  RotateCcw
} from 'lucide-react';
import { useCaseStore } from '../store/useCaseStore';
import { cn } from '../lib/utils';
import type { CaseDifficulty, CaseStatus } from '../types';

const difficultyOptions = [
  { value: '', label: '全部难度' },
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
];

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'draft', label: '草稿' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'archived', label: '已归档' },
];

const treatmentTypes = [
  { value: '', label: '全部类型' },
  { value: '固定矫治', label: '固定矫治' },
  { value: '隐形矫治', label: '隐形矫治' },
  { value: '功能矫治', label: '功能矫治' },
  { value: '固定矫治+种植支抗', label: '种植支抗' },
];

const ageGroups = [
  { value: '替牙期 (8-11岁)', label: '替牙期 (8-11岁)' },
  { value: '青少年 (12-16岁)', label: '青少年 (12-16岁)' },
  { value: '成人 (18岁以上)', label: '成人 (18岁以上)' },
];

const teachers = [
  { value: '张明教授', label: '张明教授' },
  { value: '李华主任医师', label: '李华主任医师' },
  { value: '王教授', label: '王教授' },
];

interface NewCaseForm {
  anonymousCode: string;
  diagnosis: string;
  difficultyLevel: CaseDifficulty;
  ageGroup: string;
  treatmentType: string;
  status: CaseStatus;
  description: string;
  teacherName: string;
}

export function CaseList() {
  const { cases, originalCases, addCase, resetFilters } = useCaseStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficulty, setDifficulty] = useState<CaseDifficulty | ''>('');
  const [status, setStatus] = useState<CaseStatus | ''>('');
  const [treatmentType, setTreatmentType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newCase, setNewCase] = useState<NewCaseForm>({
    anonymousCode: '',
    diagnosis: '',
    difficultyLevel: 'medium',
    ageGroup: '青少年 (12-16岁)',
    treatmentType: '固定矫治',
    status: 'draft',
    description: '',
    teacherName: '张明教授',
  });

  const filteredCases = useMemo(() => {
    const source = cases.length > 0 ? cases : originalCases;
    return source.filter((caseItem) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const match = 
          caseItem.anonymousCode.toLowerCase().includes(query) ||
          caseItem.diagnosis.toLowerCase().includes(query) ||
          caseItem.description.toLowerCase().includes(query);
        if (!match) return false;
      }
      if (difficulty && caseItem.difficultyLevel !== difficulty) return false;
      if (status && caseItem.status !== status) return false;
      if (treatmentType && caseItem.treatmentType !== treatmentType) return false;
      return true;
    });
  }, [cases, originalCases, searchQuery, difficulty, status, treatmentType]);

  const hasActiveFilters = difficulty || status || treatmentType || searchQuery;

  const handleResetFilters = () => {
    setDifficulty('');
    setStatus('');
    setTreatmentType('');
    setSearchQuery('');
    resetFilters();
  };

  const handleCreateCase = () => {
    if (!newCase.anonymousCode || !newCase.diagnosis) {
      alert('请填写病例编号和诊断');
      return;
    }
    addCase(newCase);
    setShowCreateModal(false);
    setNewCase({
      anonymousCode: '',
      diagnosis: '',
      difficultyLevel: 'medium',
      ageGroup: '青少年 (12-16岁)',
      treatmentType: '固定矫治',
      status: 'draft',
      description: '',
      teacherName: '张明教授',
    });
  };

  return (
    <Layout>
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">病例库</h1>
          <p className="text-slate-500 mt-1">
            共 {filteredCases.length} 个教学病例
            {hasActiveFilters && (
              <button 
                onClick={handleResetFilters}
                className="ml-3 text-xs text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                清空筛选
              </button>
            )}
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>新建病例</span>
        </button>
      </div>

      {/* 搜索和筛选栏 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索病例编号、诊断..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>

          {/* 筛选按钮 */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors',
              showFilters || (difficulty || status || treatmentType)
                ? 'border-primary-500 bg-primary-50 text-primary-600'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>筛选</span>
          </button>

          {/* 视图切换 */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2.5 transition-colors',
                viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-slate-400 hover:bg-slate-50'
              )}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2.5 transition-colors',
                viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-slate-400 hover:bg-slate-50'
              )}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 筛选选项 */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">难度等级</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as CaseDifficulty | '')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
              >
                {difficultyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">病例状态</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CaseStatus | '')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">治疗类型</label>
              <select
                value={treatmentType}
                onChange={(e) => setTreatmentType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
              >
                {treatmentTypes.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 病例列表 */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCases.map((caseItem) => (
            <CaseCard key={caseItem.id} caseData={caseItem} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  病例编号
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  诊断
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  难度
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  治疗类型
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  带教老师
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  学员数
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.map((caseItem) => (
                <tr
                  key={caseItem.id}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => window.location.href = `/cases/${caseItem.id}`}
                >
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono text-slate-600">
                      {caseItem.anonymousCode}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-800">{caseItem.diagnosis}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      caseItem.difficultyLevel === 'easy' ? 'bg-green-100 text-green-700' :
                      caseItem.difficultyLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    )}>
                      {caseItem.difficultyLevel === 'easy' ? '简单' : caseItem.difficultyLevel === 'medium' ? '中等' : '困难'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      {caseItem.treatmentType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      caseItem.status === 'in_progress' ? 'bg-primary-100 text-primary-700' :
                      caseItem.status === 'completed' ? 'bg-green-100 text-green-700' :
                      caseItem.status === 'draft' ? 'bg-slate-100 text-slate-600' :
                      'bg-slate-100 text-slate-500'
                    )}>
                      {caseItem.status === 'in_progress' ? '进行中' :
                       caseItem.status === 'completed' ? '已完成' :
                       caseItem.status === 'draft' ? '草稿' : '已归档'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-600">{caseItem.teacherName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-600">{caseItem.studentCount} 人</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredCases.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500">没有找到符合条件的病例</p>
          <button 
            onClick={handleResetFilters}
            className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            清空筛选条件
          </button>
        </div>
      )}

      {/* 新建病例弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 font-serif">新建匿名教学病例</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    病例编号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="例如：CASE-A-2024-010"
                    value={newCase.anonymousCode}
                    onChange={(e) => setNewCase({ ...newCase, anonymousCode: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    诊断 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="例如：安氏II类错颌畸形"
                    value={newCase.diagnosis}
                    onChange={(e) => setNewCase({ ...newCase, diagnosis: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">难度等级</label>
                  <select
                    value={newCase.difficultyLevel}
                    onChange={(e) => setNewCase({ ...newCase, difficultyLevel: e.target.value as CaseDifficulty })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                  >
                    {difficultyOptions.filter(o => o.value).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">年龄段</label>
                  <select
                    value={newCase.ageGroup}
                    onChange={(e) => setNewCase({ ...newCase, ageGroup: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                  >
                    {ageGroups.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">治疗类型</label>
                  <select
                    value={newCase.treatmentType}
                    onChange={(e) => setNewCase({ ...newCase, treatmentType: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                  >
                    {treatmentTypes.filter(o => o.value).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">病例状态</label>
                  <select
                    value={newCase.status}
                    onChange={(e) => setNewCase({ ...newCase, status: e.target.value as CaseStatus })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                  >
                    {statusOptions.filter(o => o.value).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">带教老师</label>
                  <select
                    value={newCase.teacherName}
                    onChange={(e) => setNewCase({ ...newCase, teacherName: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                  >
                    {teachers.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">病例描述</label>
                  <textarea
                    rows={4}
                    placeholder="简要描述病例特点、治疗要点等信息..."
                    value={newCase.description}
                    onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm resize-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-5 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateCase}
                className="px-5 py-2.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
              >
                保存病例
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
