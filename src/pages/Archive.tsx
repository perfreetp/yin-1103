import { useState, useMemo } from 'react';
import { Layout } from '../components/layout/Layout';
import { 
  Archive,
  FileText,
  Star,
  Folder,
  File,
  ChevronRight,
  Search,
  Download,
  Plus,
  BookOpen,
  Lightbulb,
  ClipboardList,
  X
} from 'lucide-react';
import type { OutlineSection } from '../types';
import { discussionOutlines, excellentCases, archiveDocuments } from '../data/assessment';
import { cn } from '../lib/utils';

const typeLabels: Record<string, string> = {
  outline: '讨论提纲',
  excellent_case: '优秀案例',
  reference: '参考资料',
  template: '模板规范',
};

const typeIcons: Record<string, any> = {
  outline: Lightbulb,
  excellent_case: Star,
  reference: BookOpen,
  template: ClipboardList,
};

type TabValue = 'all' | 'outline' | 'excellent_case' | 'reference' | 'template';

interface ArchiveItem {
  id: string;
  type: string;
  title: string;
  caseName?: string;
  description: string;
  date: string;
  tags?: string[];
  difficulty?: string;
  author?: string;
  category?: string;
  diagnosis?: string;
  sections?: OutlineSection[];
  reason?: string;
}

export function ArchivePage() {
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: '全部' },
    { value: 'outline', label: '讨论提纲' },
    { value: 'excellent_case', label: '优秀案例' },
    { value: 'reference', label: '参考资料' },
    { value: 'template', label: '模板规范' },
  ];

  // 构造统一格式的所有条目
  const allItems: ArchiveItem[] = useMemo(() => [
    ...discussionOutlines.map(o => ({
      id: o.id,
      type: 'outline',
      title: o.title,
      caseName: o.caseName,
      description: `基于病例 ${o.caseName} 的病例讨论提纲`,
      date: o.generatedAt,
      sections: o.sections,
    })),
    ...excellentCases.map(e => ({
      id: e.id,
      type: 'excellent_case',
      title: e.caseName,
      caseName: e.caseName,
      description: e.reason,
      date: e.archivedAt,
      tags: e.tags,
      difficulty: e.difficultyLevel,
      diagnosis: e.diagnosis,
      reason: e.reason,
    })),
    ...archiveDocuments.map(d => ({
      id: d.id,
      type: d.type,
      title: d.title,
      description: d.description,
      date: d.createdAt,
      author: d.author,
      category: d.category,
    })),
  ], []);

  // 统一筛选逻辑：tab + search + category下拉
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      // 1. Tab筛选
      if (activeTab !== 'all' && item.type !== activeTab) {
        return false;
      }
      // 2. 搜索筛选
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchFields = [
          item.title,
          item.description,
          item.caseName,
          item.diagnosis,
          item.author,
          item.category,
          ...(item.tags || []),
        ].filter(Boolean).map(s => String(s).toLowerCase());
        if (!matchFields.some(s => s.includes(query))) {
          return false;
        }
      }
      // 3. 分类下拉筛选（针对参考资料/模板的category字段，以及类型）
      if (selectedCategory !== 'all') {
        // 如果是资料类型的category（技术规范/文书模板/参考资料），匹配category字段
        if (['技术规范', '文书模板', '参考资料'].includes(selectedCategory)) {
          if (item.category !== selectedCategory) {
            return false;
          }
        }
      }
      return true;
    });
  }, [allItems, activeTab, searchQuery, selectedCategory]);

  // 按类型分组统计
  const stats = useMemo(() => [
    { label: '讨论提纲', value: allItems.filter(i => i.type === 'outline').length, icon: Lightbulb, color: 'bg-yellow-50 text-yellow-600' },
    { label: '优秀案例', value: allItems.filter(i => i.type === 'excellent_case').length, icon: Star, color: 'bg-accent-50 text-accent-600' },
    { label: '参考资料', value: allItems.filter(i => i.type === 'reference').length, icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
    { label: '模板规范', value: allItems.filter(i => i.type === 'template').length, icon: FileText, color: 'bg-green-50 text-green-600' },
  ], [allItems]);

  // 渲染单个条目，根据type不同样式不同
  const renderItemCard = (item: ArchiveItem) => {
    const Icon = typeIcons[item.type] || File;
    
    if (item.type === 'excellent_case') {
      return (
        <div
          key={item.id}
          className="bg-gradient-to-br from-accent-50 to-white rounded-lg border border-accent-200 p-5 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-xs text-accent-600 font-medium">{typeLabels[item.type]}</span>
              <h4 className="font-medium text-slate-800 mt-1 group-hover:text-primary-700 transition-colors">
                {item.title}
              </h4>
            </div>
            <Star className="w-5 h-5 text-accent-500 fill-accent-500" />
          </div>
          <p className="text-sm text-slate-600 mb-3">{item.description}</p>
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {item.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs bg-white rounded text-slate-600 border border-slate-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-accent-100">
            <span>{item.diagnosis}</span>
            <span>归档于 {item.date}</span>
          </div>
        </div>
      );
    }

    if (item.type === 'outline') {
      return (
        <div
          key={item.id}
          className="bg-white rounded-lg border border-slate-200 p-5 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 text-xs bg-yellow-50 text-yellow-700 rounded inline-flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  {typeLabels[item.type]}
                </span>
                {item.caseName && (
                  <span className="text-xs text-slate-400">{item.caseName}</span>
                )}
              </div>
              <h4 className="font-medium text-slate-800 group-hover:text-primary-700 transition-colors">
                {item.title}
              </h4>
              {item.sections && item.sections.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.sections.slice(0, 4).map((section, idx) => (
                    <span key={idx} className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                      {section.title}
                    </span>
                  ))}
                  {item.sections.length > 4 && (
                    <span className="text-xs text-slate-400 px-2 py-1">
                      +{item.sections.length - 4} 个要点
                    </span>
                  )}
                </div>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 transition-colors flex-shrink-0 ml-4" />
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
            <span>{item.sections?.length || 0} 个讨论要点</span>
            <span>生成于 {item.date}</span>
          </div>
        </div>
      );
    }

    // reference 或 template
    return (
      <div
        key={item.id}
        className="bg-white rounded-lg border border-slate-200 p-5 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group"
      >
        <div className="flex items-start gap-4">
          <div className={cn(
            'w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0',
            item.type === 'template' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn(
                  'px-2 py-0.5 text-xs rounded flex-shrink-0',
                  item.type === 'template' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                )}>
                  {typeLabels[item.type]}
                </span>
                {item.category && (
                  <span className="text-xs text-slate-400 truncate">{item.category}</span>
                )}
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0">{item.date}</span>
            </div>
            <h4 className="font-medium text-slate-800 group-hover:text-primary-700 transition-colors mb-1">
              {item.title}
            </h4>
            <p className="text-sm text-slate-500 line-clamp-2 mb-2">{item.description}</p>
            <div className="flex items-center justify-between">
              {item.author && (
                <span className="text-xs text-slate-400">作者：{item.author}</span>
              )}
              <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-primary-600 hover:bg-primary-50 rounded-md transition-colors ml-auto">
                <Download className="w-3.5 h-3.5" />
                下载
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 重置筛选
  const clearAllFilters = () => {
    setActiveTab('all');
    setSearchQuery('');
    setSelectedCategory('all');
  };

  return (
    <Layout>
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">资料归档</h1>
          <p className="text-slate-500 mt-1">
            自动生成病例讨论提纲，沉淀优秀案例模板
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <Plus className="w-5 h-5" />
          <span>上传资料</span>
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800 font-mono">{stat.value}</p>
                </div>
                <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', stat.color)}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧分类 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-slate-200 p-4 sticky top-20">
            <h3 className="font-medium text-slate-800 mb-4">资料分类</h3>
            <nav className="space-y-1">
              {categories.map((cat) => {
                const Icon = cat.value === 'all' ? Folder : typeIcons[cat.value] || File;
                const count = cat.value === 'all' 
                  ? allItems.length 
                  : allItems.filter(i => i.type === cat.value).length;
                const active = activeTab === cat.value;
                
                return (
                  <button
                    key={cat.value}
                    onClick={() => setActiveTab(cat.value as TabValue)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                      active
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{cat.label}</span>
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded',
                      active ? 'bg-primary-100 text-primary-600' : 'text-slate-400 bg-slate-100'
                    )}>{count}</span>
                  </button>
                );
              })}
            </nav>

            {/* 当前筛选提示 */}
            {(searchQuery || selectedCategory !== 'all') && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-2">当前筛选</p>
                <div className="flex flex-wrap gap-1.5">
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">
                      关键词: {searchQuery}
                      <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {selectedCategory !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">
                      {selectedCategory}
                      <button onClick={() => setSelectedCategory('all')}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧内容区 */}
        <div className="lg:col-span-3">
          {/* 搜索栏 */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索标题、描述、标签、作者..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded"
                >
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}
            </div>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white min-w-[140px]"
            >
              <option value="all">全部分类</option>
              <option value="技术规范">技术规范</option>
              <option value="文书模板">文书模板</option>
              <option value="参考资料">参考资料</option>
            </select>
          </div>

          {/* 结果统计 */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              共找到 <span className="font-semibold text-slate-700">{filteredItems.length}</span> 条资料
              {(activeTab !== 'all' || searchQuery || selectedCategory !== 'all') && ' · 已应用筛选'}
            </p>
            {(activeTab !== 'all' || searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                清空筛选
              </button>
            )}
          </div>

          {/* 内容列表 */}
          {filteredItems.length > 0 ? (
            <div className="space-y-4">
              {/* 全部视图下，如果是优秀案例则两列展示，其他单列 */}
              {activeTab === 'excellent_case' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredItems.map(renderItemCard)}
                </div>
              ) : (
                filteredItems.map(renderItemCard)
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-slate-200 border-dashed">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Archive className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-700 font-medium mb-1">没有找到相关资料</p>
              <p className="text-sm text-slate-400 mb-4">试试调整搜索条件或清除筛选</p>
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
              >
                <X className="w-4 h-4" />
                清除所有筛选
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
