import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  GitBranch,
  Shield,
  ClipboardList,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { cn } from '@/utils';

const navItems = [
  { path: '/', label: '地图首页', icon: LayoutDashboard },
  { path: '/catalog', label: '资产目录', icon: Database },
  { path: '/lineage/asset-001', label: '血缘视图', icon: GitBranch },
  { path: '/permissions', label: '权限申请', icon: Shield },
  { path: '/inventory', label: '盘点任务', icon: ClipboardList },
  { path: '/favorites', label: '我的收藏', icon: Star },
];

export default function Sidebar() {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useUserStore();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path.split('/').slice(0, 2).join('/'));
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-40 flex flex-col bg-dark-bg-900/95 backdrop-blur-sm border-r border-dark-bg-700/50 transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-dark-bg-700/50">
        <div className={cn('flex items-center gap-3', sidebarCollapsed && 'justify-center w-full')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-tech-cyan-400 to-deep-blue-500 flex items-center justify-center flex-shrink-0">
            <Database className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-bold text-lg bg-gradient-to-r from-tech-cyan-400 to-deep-blue-400 bg-clip-text text-transparent">
              数据资产地图
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                    active
                      ? 'bg-tech-cyan-500/10 text-tech-cyan-400 border border-tech-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-dark-bg-800/50 border border-transparent',
                    sidebarCollapsed && 'justify-center px-2'
                  )}
                >
                  <Icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-tech-cyan-400')} />
                  {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                  {active && !sidebarCollapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-tech-cyan-400 animate-pulse" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        onClick={toggleSidebar}
        className="h-12 flex items-center justify-center border-t border-dark-bg-700/50 text-slate-500 hover:text-slate-300 hover:bg-dark-bg-800/50 transition-colors"
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
