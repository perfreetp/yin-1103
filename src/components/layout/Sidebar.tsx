import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  ClipboardList, 
  CalendarDays, 
  MessageSquareText, 
  BarChart3, 
  Archive,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { useUiStore } from '../../store/useUiStore';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../lib/utils';

const menuItems = [
  {
    path: '/dashboard',
    icon: LayoutDashboard,
    label: '工作台',
  },
  {
    path: '/cases',
    icon: FolderKanban,
    label: '病例库',
  },
  {
    path: '/teaching-plan',
    icon: ClipboardList,
    label: '教学方案',
  },
  {
    path: '/follow-up',
    icon: CalendarDays,
    label: '随访日志',
  },
  {
    path: '/annotations',
    icon: MessageSquareText,
    label: '批注点评',
  },
  {
    path: '/assessment',
    icon: BarChart3,
    label: '考核面板',
  },
  {
    path: '/archive',
    icon: Archive,
    label: '资料归档',
  },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const { currentUser } = useAuthStore();
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-primary-700 text-white transition-all duration-300 flex flex-col z-50 z-40',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo区域 */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-primary-600">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-accent-500 rounded flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="whitespace-nowrap">
              <h1 className="font-serif font-bold text-lg leading-tight">正畸教研室</h1>
              <p className="text-xs text-primary-200">教学管理平台</p>
            </div>
          )}
        </div>
      </div>

      {/* 用户信息 */}
      {!sidebarCollapsed && currentUser && (
        <div className="px-4 py-4 border-b border-primary-600">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full bg-primary-600"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-primary-200 truncate">{currentUser.department}</p>
            </div>
          </div>
        </div>
      )}

      {/* 导航菜单 */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-200',
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'text-primary-100 hover:bg-primary-600/50 hover:text-white'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="whitespace-nowrap">{item.label}</span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 收起/展开按钮 */}
      <button
        onClick={toggleSidebar}
        className="h-12 flex items-center justify-center border-t border-primary-600 hover:bg-primary-600/50 transition-colors"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
    </aside>
  );
}
