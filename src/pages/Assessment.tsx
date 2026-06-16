import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { 
  BarChart3,
  Award,
  TrendingUp,
  Users,
  Target,
  CheckCircle,
  XCircle,
  ChevronRight,
  Play,
  Trophy,
  Medal
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { studentAssessments, abnormalCaseExercises } from '../data/assessment';
import { cn } from '../lib/utils';

const weeklyProgress = [
  { week: '第1周', 完成率: 20, 正确率: 60 },
  { week: '第2周', 完成率: 35, 正确率: 65 },
  { week: '第3周', 完成率: 50, 正确率: 72 },
  { week: '第4周', 完成率: 65, 正确率: 78 },
  { week: '第5周', 完成率: 75, 正确率: 82 },
  { week: '第6周', 完成率: 82, 正确率: 85 },
];

export function Assessment() {
  const [activeTab, setActiveTab] = useState<'overview' | 'exercise' | 'ranking'>('overview');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const currentExercise = abnormalCaseExercises[currentExerciseIndex];

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentExerciseIndex < abnormalCaseExercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-sm font-mono text-slate-500">{rank}</span>;
    }
  };

  return (
    <Layout>
      {/* 页面头部 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 font-serif">考核面板</h1>
        <p className="text-slate-500 mt-1">
          统计学生跟踪完整率，设置异常处置练习
        </p>
      </div>

      {/* 标签页 */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'overview', label: '数据概览', icon: BarChart3 },
          { id: 'exercise', label: '异常处置练习', icon: Target },
          { id: 'ranking', label: '学习排行', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">学员总数</p>
                  <p className="text-2xl font-bold text-slate-800 font-mono">24</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">平均完成率</p>
                  <p className="text-2xl font-bold text-green-600 font-mono">72.5%</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-accent-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">平均分数</p>
                  <p className="text-2xl font-bold text-accent-600 font-mono">81.8</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">练习总数</p>
                  <p className="text-2xl font-bold text-purple-600 font-mono">128</p>
                </div>
              </div>
            </div>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-medium text-slate-800 mb-4">学习进度趋势</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="完成率"
                      stroke="#1a365d"
                      strokeWidth={2}
                      dot={{ fill: '#1a365d', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="正确率"
                      stroke="#d97706"
                      strokeWidth={2}
                      dot={{ fill: '#d97706', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-medium text-slate-800 mb-4">各难度完成情况</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: '简单', 完成数: 45, 总数: 50 },
                    { name: '中等', 完成数: 32, 总数: 48 },
                    { name: '困难', 完成数: 15, 总数: 30 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip />
                    <Bar dataKey="总数" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="完成数" fill="#1a365d" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 学员详情列表 */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h3 className="font-medium text-slate-800">学员跟踪情况</h3>
            </div>
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">排名</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">学员</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">完成病例</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">完成率</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">平均分</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">练习正确率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentAssessments.sort((a, b) => a.rank - b.rank).map((student) => (
                  <tr key={student.studentId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 w-16">
                      {getRankIcon(student.rank)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt={student.studentName}
                          className="w-8 h-8 rounded-full bg-slate-200"
                        />
                        <span className="text-sm font-medium text-slate-700">
                          {student.studentName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600">
                        {student.completedCases}/{student.totalCases}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-600 rounded-full"
                            style={{ width: `${student.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-slate-600 font-mono">
                          {student.completionRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-primary-600 font-mono">
                        {student.averageScore}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        'text-sm font-medium',
                        student.exerciseAccuracy >= 80 ? 'text-green-600' :
                        student.exerciseAccuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                      )}>
                        {student.exerciseAccuracy}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'exercise' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 练习列表 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-medium text-slate-800">异常处置练习</h3>
                <p className="text-xs text-slate-500 mt-1">共 {abnormalCaseExercises.length} 道题目</p>
              </div>
              <div className="divide-y divide-slate-100">
                {abnormalCaseExercises.map((exercise, index) => (
                  <button
                    key={exercise.id}
                    onClick={() => {
                      setCurrentExerciseIndex(index);
                      setSelectedAnswer(null);
                      setShowResult(false);
                    }}
                    className={cn(
                      'w-full p-4 text-left transition-colors',
                      currentExerciseIndex === index
                        ? 'bg-primary-50 border-l-4 border-primary-600'
                        : 'hover:bg-slate-50 border-l-4 border-transparent'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                        currentExerciseIndex === index
                          ? 'bg-primary-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      )}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 line-clamp-2">
                          {exercise.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn(
                            'px-1.5 py-0.5 text-xs rounded',
                            exercise.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            exercise.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          )}>
                            {exercise.difficulty === 'easy' ? '简单' : exercise.difficulty === 'medium' ? '中等' : '困难'}
                          </span>
                          <span className="text-xs text-slate-400">{exercise.category}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 练习详情 */}
          <div className="lg:col-span-2">
            {currentExercise && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-sm text-slate-500">
                      第 {currentExerciseIndex + 1} / {abnormalCaseExercises.length} 题
                    </span>
                    <h2 className="text-xl font-semibold text-slate-800 mt-1">
                      {currentExercise.title}
                    </h2>
                  </div>
                  <span className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    currentExercise.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    currentExercise.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  )}>
                    {currentExercise.difficulty === 'easy' ? '简单' : currentExercise.difficulty === 'medium' ? '中等' : '困难'}
                  </span>
                </div>

                {/* 题目描述 */}
                <div className="bg-slate-50 rounded-lg p-5 mb-6">
                  <h3 className="text-sm font-medium text-slate-700 mb-2">病例情景</h3>
                  <p className="text-sm text-slate-600">{currentExercise.scenario}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-700 mb-3">问题</h3>
                  <p className="text-slate-800">{currentExercise.description}</p>
                </div>

                {/* 选项 */}
                <div className="space-y-3 mb-6">
                  {currentExercise.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === currentExercise.correctAnswer;
                    
                    let optionClass = 'border-slate-200 hover:border-primary-300 hover:bg-primary-50/30';
                    if (showResult) {
                      if (isCorrect) {
                        optionClass = 'border-green-500 bg-green-50';
                      } else if (isSelected && !isCorrect) {
                        optionClass = 'border-red-500 bg-red-50';
                      } else {
                        optionClass = 'border-slate-200 opacity-60';
                      }
                    } else if (isSelected) {
                      optionClass = 'border-primary-500 bg-primary-50';
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showResult}
                        className={cn(
                          'w-full p-4 text-left rounded-lg border-2 transition-all',
                          optionClass
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                            showResult && isCorrect ? 'bg-green-500 text-white' :
                            showResult && isSelected && !isCorrect ? 'bg-red-500 text-white' :
                            isSelected ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
                          )}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className={cn(
                            'text-sm',
                            showResult && isCorrect ? 'text-green-700 font-medium' :
                            showResult && isSelected && !isCorrect ? 'text-red-700' : 'text-slate-700'
                          )}>
                            {option}
                          </span>
                          {showResult && isCorrect && (
                            <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* 答案解析 */}
                {showResult && (
                  <div className="bg-primary-50 rounded-lg p-5 mb-6 border border-primary-100 animate-fade-in">
                    <h3 className="text-sm font-medium text-primary-700 mb-2 flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      答案解析
                    </h3>
                    <p className="text-sm text-primary-600">{currentExercise.explanation}</p>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      if (currentExerciseIndex > 0) {
                        setCurrentExerciseIndex(currentExerciseIndex - 1);
                        setSelectedAnswer(null);
                        setShowResult(false);
                      }
                    }}
                    disabled={currentExerciseIndex === 0}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm transition-colors',
                      currentExerciseIndex === 0
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    上一题
                  </button>

                  {!showResult ? (
                    <button
                      onClick={handleSubmit}
                      disabled={selectedAnswer === null}
                      className={cn(
                        'px-6 py-2.5 rounded-lg text-sm font-medium transition-all',
                        selectedAnswer !== null
                          ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      )}
                    >
                      提交答案
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
                    >
                      下一题
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'ranking' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">学习排行榜</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 前三名展示 */}
            {[2, 1, 3].map((rank) => {
              const student = studentAssessments.find(s => s.rank === rank);
              if (!student) return null;
              
              const sizeClass = rank === 1 ? 'h-40' : 'h-32';
              const bgClass = rank === 1 ? 'bg-gradient-to-t from-yellow-400 to-yellow-200' :
                             rank === 2 ? 'bg-gradient-to-t from-slate-300 to-slate-100' :
                             'bg-gradient-to-t from-amber-500 to-amber-200';
              
              return (
                <div key={rank} className={`flex flex-col items-center ${rank === 1 ? 'md:order-2' : rank === 2 ? 'md:order-1 md:mt-8' : 'md:order-3 md:mt-8'}`}>
                  <div className={`w-20 h-20 rounded-full ${bgClass} p-1 mb-3`}>
                    <img
                      src={student.avatar}
                      alt={student.studentName}
                      className="w-full h-full rounded-full bg-white"
                    />
                  </div>
                  <p className="font-medium text-slate-800">{student.studentName}</p>
                  <p className="text-2xl font-bold text-primary-600 font-mono mt-1">
                    {student.averageScore}分
                  </p>
                  <div className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center mt-2',
                    rank === 1 ? 'bg-yellow-400' : rank === 2 ? 'bg-slate-300' : 'bg-amber-500'
                  )}>
                    <Trophy className={cn(
                      'w-8 h-8',
                      rank === 1 ? 'text-yellow-700' : rank === 2 ? 'text-slate-600' : 'text-amber-700'
                    )} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 完整榜单 */}
          <div className="border-t border-slate-200 pt-6">
            <h4 className="font-medium text-slate-700 mb-4">完整榜单</h4>
            <div className="space-y-2">
              {studentAssessments.sort((a, b) => a.rank - b.rank).map((student) => (
                <div
                  key={student.studentId}
                  className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <span className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                    student.rank <= 3 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-600'
                  )}>
                    {student.rank}
                  </span>
                  <img
                    src={student.avatar}
                    alt={student.studentName}
                    className="w-10 h-10 rounded-full bg-slate-200"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-700">{student.studentName}</p>
                    <p className="text-xs text-slate-500">
                      完成 {student.completedCases}/{student.totalCases} 个病例 · 练习 {student.exerciseCount} 次
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600 font-mono">
                      {student.averageScore}
                    </p>
                    <p className="text-xs text-slate-400">平均分</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
