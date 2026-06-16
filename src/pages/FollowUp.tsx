import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { 
  Calendar,
  Image as ImageIcon,
  FileText,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import { cases } from '../data/cases';
import { cn } from '../lib/utils';

export function FollowUp() {
  const [selectedCase, setSelectedCase] = useState<string>(cases[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const currentCase = cases.find(c => c.id === selectedCase);
  const records = currentCase?.followUpRecords || [];

  const filteredRecords = records.filter(record => 
    record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.findings.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      {/* 页面头部 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 font-serif">随访日志</h1>
        <p className="text-slate-500 mt-1">
          记录真实随访时间线，挂接照片和模型观察重点
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧病例选择 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-slate-200 p-4 sticky top-20">
            <h3 className="font-medium text-slate-800 mb-4">选择病例</h3>
            <div className="space-y-2">
              {cases.filter(c => c.status !== 'draft').map((caseItem) => (
                <button
                  key={caseItem.id}
                  onClick={() => setSelectedCase(caseItem.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg transition-all',
                    selectedCase === caseItem.id
                      ? 'bg-primary-50 border border-primary-200'
                      : 'hover:bg-slate-50 border border-transparent'
                  )}
                >
                  <p className="text-xs font-mono text-slate-400 mb-0.5">
                    {caseItem.anonymousCode}
                  </p>
                  <p className="text-sm font-medium text-slate-700 line-clamp-1">
                    {caseItem.diagnosis}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {caseItem.followUpRecords.length} 次随访
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧时间线 */}
        <div className="lg:col-span-3">
          {/* 病例信息栏 */}
          {currentCase && (
            <div className="bg-white rounded-lg border border-slate-200 p-5 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-sm text-slate-400">
                      {currentCase.anonymousCode}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-700">
                      {currentCase.treatmentType}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    {currentCase.diagnosis}
                  </h2>
                </div>
                <button className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  添加随访记录
                </button>
              </div>
            </div>
          )}

          {/* 搜索和筛选 */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索随访内容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4" />
              筛选
            </button>
          </div>

          {/* 时间线 */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="font-medium text-slate-800 mb-6">随访时间线</h3>
            
            {filteredRecords.length > 0 ? (
              <div className="relative">
                {/* 竖线 */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                
                <div className="space-y-6">
                  {filteredRecords.map((record, index) => (
                    <div key={record.id} className="relative pl-14 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                      {/* 时间点 */}
                      <div className="absolute left-2.5 top-1 w-5 h-5 rounded-full bg-primary-600 border-4 border-white shadow-sm"></div>
                      
                      <div className="bg-slate-50 rounded-lg p-5 hover:bg-slate-100 transition-colors group">
                        {/* 头部 */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-primary-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-800">
                                第 {record.visitNumber} 次复诊
                              </h4>
                              <p className="text-sm text-slate-500">{record.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {record.photoIds.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded text-xs text-slate-600 border border-slate-200">
                                <ImageIcon className="w-3.5 h-3.5" />
                                {record.photoIds.length} 张照片
                              </span>
                            )}
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors" />
                          </div>
                        </div>

                        {/* 内容 */}
                        <div className="space-y-2 text-sm">
                          <div className="flex gap-2">
                            <span className="text-slate-400 w-20 flex-shrink-0">治疗内容</span>
                            <span className="text-slate-600 flex-1">{record.description}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-slate-400 w-20 flex-shrink-0">检查所见</span>
                            <span className="text-slate-600 flex-1">{record.findings}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-slate-400 w-20 flex-shrink-0">下一步计划</span>
                            <span className="text-slate-600 flex-1 text-primary-600 font-medium">
                              {record.nextPlan}
                            </span>
                          </div>
                        </div>

                        {/* 照片预览 */}
                        {record.photoIds.length > 0 && currentCase && (
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <div className="flex gap-2">
                              {record.photoIds.slice(0, 4).map((photoId) => {
                                const photo = currentCase.photos.find(p => p.id === photoId || p.id.endsWith(photoId));
                                if (!photo) return null;
                                return (
                                  <div key={photoId} className="w-16 h-16 rounded overflow-hidden bg-slate-200">
                                    <img
                                      src={photo.thumbnail}
                                      alt={photo.description}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                );
                              })}
                              {record.photoIds.length > 4 && (
                                <div className="w-16 h-16 rounded bg-slate-200 flex items-center justify-center text-sm text-slate-500">
                                  +{record.photoIds.length - 4}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500">暂无随访记录</p>
                <p className="text-sm text-slate-400 mt-1">点击上方按钮添加第一条随访记录</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
