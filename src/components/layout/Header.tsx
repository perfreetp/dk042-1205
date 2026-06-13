import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, ChevronDown, Settings, LogOut } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useAssetStore } from '@/store/useAssetStore';
import { cn } from '@/utils';

export default function Header() {
  const navigate = useNavigate();
  const { currentUser, notifications } = useUserStore();
  const { setFilters } = useAssetStore();
  const [searchValue, setSearchValue] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setFilters({ searchQuery: searchValue });
      navigate('/catalog');
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-dark-bg-900/80 backdrop-blur-md border-b border-dark-bg-700/50 sticky top-0 z-30">
      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="搜索数据资产、系统、标签..."
            className="w-full pl-12 pr-4 py-2.5 bg-dark-bg-800/50 border border-dark-bg-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-tech-cyan-500/50 focus:ring-2 focus:ring-tech-cyan-500/20 transition-all text-sm"
          />
          <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-slate-500 bg-dark-bg-700/50 rounded">
            ⌘K
          </kbd>
        </div>
      </form>

      <div className="flex items-center gap-2 ml-6">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className={cn(
            'relative p-2.5 rounded-lg transition-colors',
            showNotifications
              ? 'bg-dark-bg-800 text-tech-cyan-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-dark-bg-800/50'
          )}
        >
          <Bell className="w-5 h-5" />
          {notifications > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {notifications}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              showUserMenu ? 'bg-dark-bg-800' : 'hover:bg-dark-bg-800/50'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-tech-cyan-400 to-deep-blue-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-medium text-slate-200">{currentUser.name}</div>
              <div className="text-xs text-slate-500">{currentUser.department}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 py-2 bg-dark-bg-800 border border-dark-bg-700 rounded-xl shadow-xl z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-dark-bg-700/50">
                <div className="font-medium text-slate-200">{currentUser.name}</div>
                <div className="text-sm text-slate-500">{currentUser.department}</div>
              </div>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-dark-bg-700/50 transition-colors">
                <Settings className="w-4 h-4" />
                个人设置
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-dark-bg-700/50 transition-colors">
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
