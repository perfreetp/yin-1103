import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { CaseCard } from '../components/business/CaseCard';
import { 
  Search, 
  Filter, 
  Plus, 
  Grid3X3, 
  List,
  SlidersHorizontal
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

export function CaseList() {
  const { cases } = useCaseStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficulty, setDifficulty] = useState<CaseDifficulty | ''>('');
  const [status, setStatus] = useState<CaseStatus | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredCases = cases.filter((caseItem) => {
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
    return true;
  });

  return (
    <Layout>
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">病例库</h1>
          <p className="text-slate-500 mt-1">
            共 {filteredCases.length} 个教学病例
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
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
              showFilters
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
          <p className="text-sm text-slate-400 mt-1">试试调整筛选条件</p>
        </div>
      )}
    </Layout>
  );
}
