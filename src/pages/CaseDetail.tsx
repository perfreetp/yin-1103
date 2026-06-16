import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Clock,
  ChevronRight,
  Image as ImageIcon,
  XCircle,
  CheckCircle2,
  Circle,
  FileText,
  Star,
  Lightbulb,
  BookOpen
} from 'lucide-react';
import { useCaseStore } from '../store/useCaseStore';
import { cn } from '../lib/utils';

const tabs = [
  { id: 'overview', label: '病例概览' },
  { id: 'diagnosis', label: '诊断资料' },
  { id: 'treatment', label: '治疗方案' },
  { id: 'followup', label: '随访记录' },
  { id: 'photos', label: '照片模型' },
  { id: 'materials', label: '相关资料' },
];

const difficultyConfig = {
  easy: { label: '简单', color: 'bg-green-100 text-green-700' },
  medium: { label: '中等', color: 'bg-yellow-100 text-yellow-700' },
  hard: { label: '困难', color: 'bg-red-100 text-red-700' },
};

const statusConfig = {
  draft: { label: '草稿', color: 'bg-slate-100 text-slate-600' },
  in_progress: { label: '进行中', color: 'bg-primary-100 text-primary-700' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
  archived: { label: '已归档', color: 'bg-slate-100 text-slate-500' },
};

const photoTypeLabels: Record<string, string> = {
  intraoral: '口内照片',
  extraoral: '面像照片',
  xray: 'X光片',
  model: '模型照片',
  others: '其他',
};

export function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentCase, fetchCaseDetail, discussionOutlines, excellentCases, archiveDocuments } = useCaseStore();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      fetchCaseDetail(id);
    }
  }, [id, fetchCaseDetail]);

  // 筛选当前病例关联的资料
  const caseMaterials = useMemo(() => {
    const materials: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      date: string;
      taskName?: string;
      icon: any;
      color: string;
    }> = [];
    
    // 讨论提纲
    discussionOutlines
      .filter(o => o.caseId === id)
      .forEach(o => materials.push({
        id: o.id,
        type: 'outline',
        title: o.title,
        description: '病例讨论提纲',
        date: o.generatedAt,
        taskName: o.taskName,
        icon: Lightbulb,
        color: 'bg-yellow-50 text-yellow-600',
      }));
    
    // 优秀案例
    excellentCases
      .filter(e => e.caseId === id)
      .forEach(e => materials.push({
        id: e.id,
        type: 'excellent_case',
        title: e.caseName,
        description: e.reason,
        date: e.archivedAt,
        taskName: e.taskName,
        icon: Star,
        color: 'bg-accent-50 text-accent-600',
      }));
    
    // 参考资料和模板
    archiveDocuments
      .filter(d => d.caseId === id)
      .forEach(d => materials.push({
        id: d.id,
        type: d.type,
        title: d.title,
        description: d.description,
        date: d.createdAt,
        taskName: d.taskName,
        icon: d.type === 'template' ? FileText : BookOpen,
        color: d.type === 'template' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600',
      }));
    
    return materials;
  }, [id, discussionOutlines, excellentCases, archiveDocuments]);

  if (!currentCase) {
    return (
      <Layout>
        <div className="text-center py-16">
          <p className="text-slate-500">加载中...</p>
        </div>
      </Layout>
    );
  }

  const difficulty = difficultyConfig[currentCase.difficultyLevel];
  const status = statusConfig[currentCase.status];

  const getTaskStatusIcon = (taskStatus: string) => {
    switch (taskStatus) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Circle className="w-4 h-4 text-primary-500 fill-primary-100" />;
      default:
        return <XCircle className="w-4 h-4 text-slate-300" />;
    }
  };

  return (
    <Layout>
      {/* 返回按钮 */}
      <button
        onClick={() => navigate('/cases')}
        className="flex items-center gap-2 text-slate-600 hover:text-primary-600 mb-4 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>返回病例库</span>
      </button>

      {/* 病例头部信息 */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm text-slate-400">
                {currentCase.anonymousCode}
              </span>
              <span className={cn('px-2 py-0.5 rounded text-xs font-medium', difficulty.color)}>
                {difficulty.label}
              </span>
              <span className={cn('px-2 py-0.5 rounded text-xs font-medium', status.color)}>
                {status.label}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2 font-serif">
              {currentCase.diagnosis}
            </h1>
            <p className="text-slate-500 text-sm">{currentCase.description}</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              编辑病例
            </button>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors">
              开始学习
            </button>
          </div>
        </div>

        {/* 基本信息 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">年龄段</p>
              <p className="text-sm font-medium text-slate-700">{currentCase.ageGroup}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-50 rounded-lg flex items-center justify-center">
              <ChevronRight className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">治疗类型</p>
              <p className="text-sm font-medium text-slate-700">{currentCase.treatmentType}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">创建时间</p>
              <p className="text-sm font-medium text-slate-700">{currentCase.createdAt}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">带教老师</p>
              <p className="text-sm font-medium text-slate-700">{currentCase.teacherName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="bg-white rounded-lg border border-slate-200 mb-6">
        <div className="flex overflow-x-auto border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'text-primary-600 border-primary-600'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 标签页内容 */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 治疗阶段时间线 */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">治疗阶段</h3>
              <div className="space-y-4">
                {currentCase.phases.map((phase, phaseIndex) => (
                  <div key={phase.id} className="relative pl-8">
                    {/* 连接线 */}
                    {phaseIndex < currentCase.phases.length - 1 && (
                      <div className="absolute left-[11px] top-6 w-0.5 h-full bg-slate-200"></div>
                    )}
                    {/* 节点 */}
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{phase.order}</span>
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-800">{phase.name}</h4>
                        <span className="text-xs text-slate-500">{phase.duration}</span>
                      </div>
                      <p className="text-sm text-slate-500 mb-3">{phase.description}</p>
                      
                      {/* 任务列表 */}
                      <div className="space-y-2">
                        {phase.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-3 p-2 bg-white rounded border border-slate-100"
                          >
                            {getTaskStatusIcon(task.status)}
                            <span className="text-sm text-slate-700 flex-1">{task.title}</span>
                            <span className="text-xs text-slate-400">{task.deadline}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 右侧信息 */}
            <div className="space-y-6">
              {/* 学习进度 */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">学习进度</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">任务完成</span>
                      <span className="font-medium text-primary-600">3/6</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-600 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">批注已读</span>
                      <span className="font-medium text-green-600">8/10</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 参与学员 */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  参与学员 <span className="text-sm font-normal text-slate-400">({currentCase.studentCount}人)</span>
                </h3>
                <div className="flex -space-x-2 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <img
                      key={i}
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=student${i}`}
                      alt="学员头像"
                      className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"
                    />
                  ))}
                </div>
                <button className="w-full py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  查看全部学员
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'diagnosis' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">诊断资料</h3>
            <div className="prose prose-sm max-w-none">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">一、主诉</h4>
                  <p className="text-slate-600">牙列不齐，上前牙前突，要求矫治。</p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">二、现病史</h4>
                  <p className="text-slate-600">患者替牙后即出现牙列不齐，上前牙前突明显，影响美观。无口腔不良习惯，无家族遗传史。</p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">三、临床检查</h4>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    <li>正面观：面部基本对称，面下1/3稍长</li>
                    <li>侧面观：凸面型，下颌后缩</li>
                    <li>口内检查：恒牙列期，磨牙远中关系</li>
                    <li>前牙深覆盖约6mm，深覆颌II度</li>
                    <li>上下牙列轻度拥挤</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">四、头影测量分析</h4>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-2 text-slate-500">SNA</td>
                          <td className="py-2 text-slate-700 text-right">84.5°</td>
                          <td className="py-2 text-slate-400 text-right">偏大</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-slate-500">SNB</td>
                          <td className="py-2 text-slate-700 text-right">77.2°</td>
                          <td className="py-2 text-slate-400 text-right">偏小</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-slate-500">ANB</td>
                          <td className="py-2 text-slate-700 text-right">7.3°</td>
                          <td className="py-2 text-red-500 text-right">增大</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-slate-500">U1-SN</td>
                          <td className="py-2 text-slate-700 text-right">108°</td>
                          <td className="py-2 text-slate-400 text-right">正常</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">五、诊断</h4>
                  <p className="text-slate-600">安氏II类一分类错颌畸形；骨性II类；上颌前突伴下颌后缩。</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'treatment' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">治疗方案</h3>
            <div className="space-y-6">
              <div className="border-l-4 border-primary-500 pl-4 py-1">
                <h4 className="font-medium text-slate-800 mb-2">治疗设计</h4>
                <p className="text-sm text-slate-600">
                  患者骨性II类，以上颌前突为主，下颌轻度后缩。考虑患者年龄和生长发育潜力，
                  建议采用拔牙矫治方案，拔除四个第一双尖牙，以内收前牙改善侧貌。
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4 py-1">
                <h4 className="font-medium text-slate-800 mb-2">矫治器选择</h4>
                <p className="text-sm text-slate-600">
                  直丝弓矫治系统（MBT），0.022英寸槽沟。配合使用种植体支抗加强后牙支抗。
                </p>
              </div>

              <div className="border-l-4 border-accent-500 pl-4 py-1">
                <h4 className="font-medium text-slate-800 mb-2">治疗步骤</h4>
                <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1">
                  <li>拔除14、24、34、44</li>
                  <li>第一阶段：排齐整平（约6-8个月）</li>
                  <li>第二阶段：间隙关闭（约6-9个月）</li>
                  <li>第三阶段：精细调整（约3-4个月）</li>
                  <li>保持阶段： Hawley保持器+舌侧丝保持</li>
                </ol>
              </div>

              <div className="border-l-4 border-red-400 pl-4 py-1">
                <h4 className="font-medium text-slate-800 mb-2">风险与注意事项</h4>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                  <li>牙根吸收风险：治疗前中后定期拍摄根尖片观察</li>
                  <li>牙周健康：加强口腔卫生宣教，定期牙周维护</li>
                  <li>颞下颌关节：治疗中关注关节症状，必要时会诊</li>
                  <li>保持依从性：强调保持的重要性，防止复发</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'followup' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">随访记录</h3>
            <div className="space-y-4">
              {currentCase.followUpRecords.map((record) => (
                <div key={record.id} className="relative pl-8 pb-6 border-l-2 border-slate-200 last:border-0 last:pb-0">
                  <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary-500 border-4 border-white"></div>
                  
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-800">
                          第 {record.visitNumber} 次复诊
                        </span>
                        <span className="text-xs text-slate-500">{record.date}</span>
                      </div>
                      {record.photoIds.length > 0 && (
                        <span className="text-xs text-primary-600 flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5" />
                          {record.photoIds.length} 张照片
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      <span className="font-medium">治疗内容：</span>
                      {record.description}
                    </p>
                    <p className="text-sm text-slate-600 mb-2">
                      <span className="font-medium">检查所见：</span>
                      {record.findings}
                    </p>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">下一步计划：</span>
                      {record.nextPlan}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">照片模型</h3>
            
            {/* 按类型分组 */}
            {Object.entries(photoTypeLabels).map(([type, label]) => {
              const photos = currentCase.photos.filter(p => p.type === type);
              if (photos.length === 0) return null;
              
              return (
                <div key={type} className="mb-8">
                  <h4 className="text-md font-medium text-slate-700 mb-4 pb-2 border-b border-slate-100">
                    {label}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                      <div key={photo.id} className="group relative">
                        <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 cursor-pointer">
                          <img
                            src={photo.url}
                            alt={photo.description}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <p className="text-sm text-slate-600 mt-2">{photo.description}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          观察重点：{photo.focusPoints}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">相关资料</h3>
              <Link
                to="/archive"
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                查看全部
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            {caseMaterials.length > 0 ? (
              <div className="space-y-3">
                {caseMaterials.map((material) => {
                  const Icon = material.icon;
                  return (
                    <div
                      key={material.id}
                      className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:border-primary-300 hover:bg-slate-50 transition-all cursor-pointer group"
                    >
                      <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0', material.color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-800 group-hover:text-primary-700 transition-colors">
                          {material.title}
                        </h4>
                        <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">
                          {material.description}
                        </p>
                        {material.taskName && (
                          <span className="inline-block mt-1.5 px-2 py-0.5 text-xs bg-green-50 text-green-600 rounded">
                            关联任务：{material.taskName}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex-shrink-0">
                        {material.date}
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 transition-colors flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium mb-1">暂无相关资料</p>
                <p className="text-sm text-slate-400">
                  该病例暂未关联归档资料，可在资料归档中上传并关联
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
