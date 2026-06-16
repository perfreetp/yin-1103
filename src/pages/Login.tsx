import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, User, Lock, ChevronRight, Stethoscope, BookOpen, UserCheck } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import type { UserRole } from '../types';
import { cn } from '../lib/utils';

const roleOptions = [
  {
    role: 'teacher' as UserRole,
    icon: Stethoscope,
    title: '带教老师',
    description: '创建病例、发布方案、批注点评',
  },
  {
    role: 'intern' as UserRole,
    icon: UserCheck,
    title: '实习医生',
    description: '参与病例、提交决策、学习提升',
  },
  {
    role: 'student' as UserRole,
    icon: BookOpen,
    title: '学生',
    description: '学习病例、完成任务、考核练习',
  },
];

export function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, setSelectedRole: setStoreRole } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole) {
      login(username || 'demo', password || 'demo', selectedRole);
      setStoreRole(selectedRole);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* 左侧品牌区 */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-700 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* 装饰背景 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-32 right-20 w-96 h-96 border-2 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-48 h-48 border border-white rounded-full"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold">口腔正畸教研室</h1>
              <p className="text-primary-200 text-sm">教学管理平台</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="font-serif text-4xl font-bold mb-6 leading-tight">
            从"会看方案"<br />
            到<span className="text-accent-400">"会跟方案"</span>
          </h2>
          <p className="text-primary-100 text-lg leading-relaxed">
            追踪式正畸教学，培养临床决策能力。通过真实病例、阶段任务、批注点评，
            让每一位学员都能在实践中成长。
          </p>
        </div>

        <div className="relative z-10 text-sm text-primary-200">
          <p>© 2024 口腔正畸教研室 教学管理平台</p>
        </div>
      </div>

      {/* 右侧登录表单区 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* 移动端Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-serif text-xl font-bold text-primary-700">正畸教研室</h1>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-2">欢迎回来</h2>
          <p className="text-slate-500 mb-8">请选择您的身份并登录系统</p>

          {/* 角色选择 */}
          <div className="space-y-3 mb-8">
            {roleOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedRole === option.role;
              return (
                <button
                  key={option.role}
                  onClick={() => setSelectedRole(option.role)}
                  className={cn(
                    'w-full p-4 border-2 rounded-lg text-left transition-all flex items-center gap-4',
                    isSelected
                      ? 'border-primary-600 bg-primary-50 shadow-md'
                      : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                  )}
                >
                  <div
                    className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                      isSelected ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className={cn('font-medium', isSelected ? 'text-primary-700' : 'text-slate-700')}>
                      {option.title}
                    </h3>
                    <p className="text-sm text-slate-500">{option.description}</p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* 登录表单 */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">用户名</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                记住我
              </label>
              <a href="#" className="text-primary-600 hover:text-primary-700">
                忘记密码?
              </a>
            </div>

            <button
              type="submit"
              disabled={!selectedRole}
              className={cn(
                'w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2',
                selectedRole
                  ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              )}
            >
              登录系统
              <ChevronRight className="w-5 h-5" />
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            演示账号：直接选择角色后点击登录即可
          </p>
        </div>
      </div>
    </div>
  );
}
