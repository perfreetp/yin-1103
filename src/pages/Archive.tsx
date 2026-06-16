import { useState } from 'react';
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
  ClipboardList
} from 'lucide-react';
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

export function ArchivePage() {
  const [activeTab, setActiveTab] = useState<'all' | 'outline' | 'excellent' | 'reference'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: '全部' },
    { value: 'outline', label: '讨论提纲' },
    { value: 'excellent_case', label: '优秀案例' },
    { value: 'reference', label: '参考资料' },
    { value: 'template', label: '模板规范' },
  ];

  const allItems = [
    ...discussionOutlines.map(o => ({
      id: o.id,
      type: 'outline' as const,
      title: o.title,
      caseName: o.caseName,
      description: `基于病例 ${o.caseName} 的病例讨论提纲`,
      date: o.generatedAt,
    })),
    ...excellentCases.map(e => ({
      id: e.id,
      type: 'excellent_case' as const,
      title: e.caseName,
      caseName: e.caseName,
      description: e.reason,
      date: e.archivedAt,
      tags: e.tags,
      difficulty: e.difficultyLevel,
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
  ];

  const filteredItems = allItems.filter(item => {
    if (activeTab !== 'all') {
      const tabMap: Record<string, string> = {
        outline: 'outline',
        excellent: 'excellent_case',
        reference: 'reference',
      };
      if (item.type !== tabMap[activeTab] && (activeTab !== 'reference' || item.type === 'template')) {
        return false;
      }
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!item.title.toLowerCase().includes(query) && !item.description.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });

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
        {[
          { label: '讨论提纲', value: discussionOutlines.length, icon: Lightbulb, color: 'bg-yellow-50 text-yellow-600' },
          { label: '优秀案例', value: excellentCases.length, icon: Star, color: 'bg-accent-50 text-accent-600' },
          { label: '参考资料', value: 4, icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
          { label: '模板规范', value: 2, icon: FileText, color: 'bg-green-50 text-green-600' },
        ].map((stat) => {
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
                
                return (
                  <button
                    key={cat.value}
                    onClick={() => setActiveTab(cat.value as typeof activeTab)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                      activeTab === cat.value
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{cat.label}</span>
                    <span className="text-xs text-slate-400">{count}</span>
                  </button>
                );
              })}
            </nav>
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
                placeholder="搜索资料标题、内容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            >
              <option value="all">全部分类</option>
              <option value="技术规范">技术规范</option>
              <option value="文书模板">文书模板</option>
              <option value="参考资料">参考资料</option>
            </select>
          </div>

          {/* 优秀案例展示 */}
          {activeTab === 'all' && (
            <div className="mb-8">
              <h3 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-accent-500" />
                精选优秀案例
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {excellentCases.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gradient-to-br from-accent-50 to-white rounded-lg border border-accent-200 p-5 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-xs text-accent-600 font-medium">优秀案例</span>
                        <h4 className="font-medium text-slate-800 mt-1 group-hover:text-primary-700 transition-colors">
                          {item.caseName}
                        </h4>
                      </div>
                      <Star className="w-5 h-5 text-accent-500 fill-accent-500" />
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{item.reason}</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs bg-white rounded text-slate-600 border border-slate-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-accent-100">
                      <span>{item.diagnosis}</span>
                      <span>归档于 {item.archivedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 讨论提纲 */}
          {(activeTab === 'all' || activeTab === 'outline') && (
            <div className="mb-8">
              <h3 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                {activeTab === 'all' ? '最近生成的讨论提纲' : '病例讨论提纲'}
              </h3>
              <div className="space-y-3">
                {discussionOutlines.map((outline) => (
                  <div
                    key={outline.id}
                    className="bg-white rounded-lg border border-slate-200 p-5 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 text-xs bg-yellow-50 text-yellow-700 rounded">
                            讨论提纲
                          </span>
                          <span className="text-xs text-slate-400">{outline.caseName}</span>
                        </div>
                        <h4 className="font-medium text-slate-800 group-hover:text-primary-700 transition-colors">
                          {outline.title}
                        </h4>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {outline.sections.slice(0, 4).map((section, idx) => (
                            <span key={idx} className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                              {section.title}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 transition-colors flex-shrink-0 ml-4" />
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
                      <span>{outline.sections.length} 个讨论要点</span>
                      <span>生成于 {outline.generatedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 文档列表 */}
          {(activeTab === 'all' || activeTab === 'reference') && (
            <div>
              <h3 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                文档资料
              </h3>
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">名称</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">类型</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">作者</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">更新时间</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {archiveDocuments.map((doc) => {
                      const Icon = typeIcons[doc.type] || FileText;
                      return (
                        <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                'w-9 h-9 rounded-lg flex items-center justify-center',
                                doc.type === 'template' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                              )}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-700">{doc.title}</p>
                                <p className="text-xs text-slate-400">{doc.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs text-slate-600">{typeLabels[doc.type]}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm text-slate-600">{doc.author}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm text-slate-500">{doc.createdAt}</span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-primary-600 hover:bg-primary-50 rounded-md transition-colors">
                              <Download className="w-3.5 h-3.5" />
                              下载
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Archive className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500">没有找到相关资料</p>
              <p className="text-sm text-slate-400 mt-1">试试其他搜索条件</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
