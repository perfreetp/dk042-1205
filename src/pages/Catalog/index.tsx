import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Eye,
  Clock,
  Database,
  Download,
  User,
  Building2,
  BookmarkPlus,
  Bookmark,
  Trash2,
} from 'lucide-react';
import { useAssetStore } from '@/store/useAssetStore';
import { useViewStore } from '@/store/useViewStore';
import { systems, themes } from '@/data/systems';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import HeatLevel from '@/components/ui/HeatLevel';
import FavoriteButton from '@/components/ui/FavoriteButton';
import {
  cn,
  formatDate,
  getQualityColor,
  getQualityLabel,
  getSensitivityColor,
  getSensitivityLabel,
  formatNumber,
} from '@/utils';
import type {
  QualityStatus,
  SensitivityLevel,
  SortField,
  SortOrder,
  DataAsset,
  SavedView,
} from '@/types';

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-dark-bg-700/50 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 text-sm font-medium text-slate-200 hover:text-slate-100 transition-colors"
      >
        {title}
        <ChevronDown
          className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
        />
      </button>
      {isOpen && <div className="pb-4 space-y-2">{children}</div>}
    </div>
  );
}

interface ActiveFilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
}

function ActiveFilterChip({ label, value, onRemove }: ActiveFilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-tech-cyan-500/10 border border-tech-cyan-500/30 text-tech-cyan-300">
      <span className="text-tech-cyan-400/70">{label}:</span>
      <span>{value}</span>
      <button
        onClick={onRemove}
        className="ml-0.5 hover:text-white transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function AssetCard({ asset }: { asset: DataAsset }) {
  const { toggleFavorite } = useAssetStore();

  return (
    <Card hover className="p-4 flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <Link
            to={`/asset/${asset.id}`}
            className="font-medium text-slate-100 hover:text-tech-cyan-400 transition-colors line-clamp-1"
          >
            {asset.name}
          </Link>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Database className="w-3 h-3" />
            {asset.systemName}
          </div>
        </div>
        <FavoriteButton
          isFavorite={asset.isFavorite}
          onClick={() => toggleFavorite(asset.id)}
        />
      </div>

      <p className="text-sm text-slate-400 text-sm line-clamp-2 mb-3 flex-1">
        {asset.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge className={getQualityColor(asset.qualityStatus)} size="sm">
          {getQualityLabel(asset.qualityStatus)}
        </Badge>
        <Badge className={getSensitivityColor(asset.sensitivityLevel)} size="sm">
          {getSensitivityLabel(asset.sensitivityLevel)}
        </Badge>
        {(asset.tags || []).slice(0, 2).map((tag) => (
          <Badge key={tag} variant="default" size="sm">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-dark-bg-700/50 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />
          {formatNumber(asset.viewCount)}
        </div>
        <HeatLevel level={asset.heatLevel} />
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {formatDate(asset.lastUpdated)}
        </div>
      </div>
    </Card>
  );
}

function AssetListItem({ asset }: { asset: DataAsset }) {
  const { toggleFavorite } = useAssetStore();

  return (
    <Link
      to={`/asset/${asset.id}`}
      className="flex items-center gap-4 p-4 border-b border-dark-bg-700/30 hover:bg-dark-bg-700/30 transition-colors group"
    >
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-tech-cyan-500/20 to-deep-blue-500/20 border border-tech-cyan-500/30 flex items-center justify-center flex-shrink-0">
        <Database className="w-5 h-5 text-tech-cyan-400" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-200 group-hover:text-tech-cyan-400 transition-colors">
          {asset.name}
        </div>
        <div className="text-sm text-slate-500 truncate">{asset.description}</div>
      </div>

      <div className="hidden md:flex items-center gap-3 flex-shrink-0">
        <Badge className={getQualityColor(asset.qualityStatus)} size="sm">
          {getQualityLabel(asset.qualityStatus)}
        </Badge>
        <Badge className={getSensitivityColor(asset.sensitivityLevel)} size="sm">
          {getSensitivityLabel(asset.sensitivityLevel)}
        </Badge>
      </div>

      <div className="hidden lg:block text-sm text-slate-500 w-32 text-right flex-shrink-0">
        {asset.systemName}
      </div>

      <div className="hidden lg:flex items-center gap-4 flex-shrink-0 w-40">
        <HeatLevel level={asset.heatLevel} showLabel />
      </div>

      <div className="hidden xl:block text-sm text-slate-500 w-32 text-right flex-shrink-0">
        {formatNumber(asset.viewCount)} 次浏览
      </div>

      <div className="hidden xl:block text-sm text-slate-500 w-32 text-right flex-shrink-0">
        {formatDate(asset.lastUpdated)}
      </div>

      <div className="flex-shrink-0">
        <FavoriteButton
          isFavorite={asset.isFavorite}
          onClick={() => toggleFavorite(asset.id)}
        />
      </div>
    </Link>
  );
}

function SaveViewModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-dark-bg-800 border border-dark-bg-600 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-dark-bg-700">
          <h3 className="text-lg font-semibold text-slate-100">保存当前筛选视图</h3>
          <button onClick={onClose} className="p-1 hover:bg-dark-bg-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="p-5">
          <label className="block text-sm text-slate-300 mb-2">视图名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如：交易线高敏资产"
            className="w-full px-3 py-2 bg-dark-bg-900 border border-dark-bg-600 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-tech-cyan-500/50"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && name.trim()) {
                onSave(name.trim());
                setName('');
              }
            }}
          />
          <p className="text-xs text-slate-500 mt-2">
            保存后可在首页和目录页一键切换此筛选组合
          </p>
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-dark-bg-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => {
              if (name.trim()) {
                onSave(name.trim());
                setName('');
              }
            }}
            disabled={!name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-tech-cyan-600 rounded-lg hover:bg-tech-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            保存视图
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewSelector({
  views,
  activeViewId,
  onSelect,
  onDelete,
}: {
  views: SavedView[];
  activeViewId: string | null;
  onSelect: (view: SavedView) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  if (views.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors',
          activeViewId
            ? 'bg-tech-cyan-500/10 border-tech-cyan-500/30 text-tech-cyan-400'
            : 'border-dark-bg-600 text-slate-400 hover:border-dark-bg-500 hover:text-slate-300'
        )}
      >
        <Bookmark className="w-3.5 h-3.5" />
        {activeViewId ? views.find((v) => v.id === activeViewId)?.name || '常用视图' : '常用视图'}
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-64 bg-dark-bg-800 border border-dark-bg-600 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-2 border-b border-dark-bg-700">
              <span className="text-xs text-slate-500 px-2">已保存的筛选视图</span>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {views.map((view) => (
                <div
                  key={view.id}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-dark-bg-700/50 transition-colors',
                    activeViewId === view.id && 'bg-tech-cyan-500/5'
                  )}
                  onClick={() => {
                    onSelect(view);
                    setOpen(false);
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      'text-sm truncate',
                      activeViewId === view.id ? 'text-tech-cyan-400' : 'text-slate-200'
                    )}>
                      {view.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {view.createdAt}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(view.id);
                    }}
                    className="ml-2 p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Catalog() {
  const {
    filters,
    departments,
    setFilters,
    resetFilters,
    setDepartments,
    sortField,
    sortOrder,
    setSort,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    pageSize,
    getFilteredAssets,
    getActiveFilterCount,
    getOwnerList,
    getDepartmentList,
    exportAssets,
    toggleFavorite,
    _hasHydrated,
  } = useAssetStore();

  const { views, addView, removeView, getViewById } = useViewStore();
  const [searchParams] = useSearchParams();
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    if (_hasHydrated) {
      const hasInvalidState = 
        departments.length > 5 ||
        filters.systems.length > 5 ||
        filters.themes.length > 5;
      if (hasInvalidState) {
        resetFilters();
      }
    }
  }, [_hasHydrated, departments, filters, resetFilters]);

  useEffect(() => {
    if (!_hasHydrated) return;
    const viewId = searchParams.get('view');
    if (viewId) {
      const view = getViewById(viewId);
      if (view) {
        setFilters(view.filters);
        setDepartments(view.departments);
        setSort(view.sortField, view.sortOrder);
        setActiveViewId(view.id);
      }
    }
  }, [_hasHydrated, searchParams]);

  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.searchQuery);

  const owners = useMemo(() => getOwnerList(), [getOwnerList]);
  const departmentList = useMemo(() => getDepartmentList(), [getDepartmentList]);
  const filteredAssets = useMemo(() => getFilteredAssets(), [getFilteredAssets]);
  const totalPages = Math.ceil(filteredAssets.length / pageSize);
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const activeFilterCount = getActiveFilterCount();
  const hasActiveFilters = activeFilterCount > 0;

  const qualityOptions: { value: QualityStatus; label: string; color: string }[] = [
    { value: 'excellent', label: '优秀', color: 'text-emerald-400' },
    { value: 'good', label: '良好', color: 'text-cyan-400' },
    { value: 'warning', label: '警告', color: 'text-amber-400' },
    { value: 'poor', label: '较差', color: 'text-rose-400' },
  ];

  const sensitivityOptions: { value: SensitivityLevel; label: string; color: string }[] = [
    { value: 'public', label: '公开', color: 'text-slate-400' },
    { value: 'internal', label: '内部', color: 'text-blue-400' },
    { value: 'confidential', label: '机密', color: 'text-amber-400' },
    { value: 'restricted', label: '受限', color: 'text-rose-400' },
  ];

  const toggleFilter = (
    value: string,
    current: string[],
    setter: (val: string[]) => void
  ) => {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ searchQuery: searchInput });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    setFilters({ searchQuery: val });
  };

  const sortOptions: { field: SortField; label: string }[] = [
    { field: 'heat', label: '热度' },
    { field: 'name', label: '名称' },
    { field: 'updated', label: '更新时间' },
    { field: 'created', label: '创建时间' },
  ];

  const handleExport = () => {
    const csvContent = exportAssets();
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `资产清单_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveView = useCallback((name: string) => {
    addView(name, filters, departments, sortField, sortOrder);
    setShowSaveModal(false);
  }, [addView, filters, departments, sortField, sortOrder]);

  const handleApplyView = useCallback((view: SavedView) => {
    setFilters(view.filters);
    setDepartments(view.departments);
    setSort(view.sortField, view.sortOrder);
    setActiveViewId(view.id);
  }, [setFilters, setDepartments, setSort]);

  const handleDeleteView = useCallback((id: string) => {
    removeView(id);
    if (activeViewId === id) {
      setActiveViewId(null);
    }
  }, [removeView, activeViewId]);

  const activeFilters = useMemo(() => {
    const chips: Array<{ label: string; value: string; key: string; onRemove: () => void }> = [];
    
    if (filters.searchQuery) {
      chips.push({
        label: '搜索',
        value: filters.searchQuery,
        key: 'search',
        onRemove: () => {
          setFilters({ searchQuery: '' });
          setSearchInput('');
        },
      });
    }
    
    filters.systems.forEach((sysId) => {
      const sys = systems.find((s) => s.id === sysId);
      if (sys) {
        chips.push({
          label: '系统',
          value: sys.name,
          key: `sys-${sysId}`,
          onRemove: () => toggleFilter(sysId, filters.systems, (val) => setFilters({ systems: val })),
        });
      }
    });
    
    filters.themes.forEach((themeId) => {
      const theme = themes.find((t) => t.id === themeId);
      if (theme) {
        chips.push({
          label: '主题',
          value: theme.name,
          key: `theme-${themeId}`,
          onRemove: () => toggleFilter(themeId, filters.themes, (val) => setFilters({ themes: val })),
        });
      }
    });
    
    filters.owners.forEach((ownerId) => {
      const owner = owners.find((o) => o.id === ownerId);
      if (owner) {
        chips.push({
          label: '负责人',
          value: owner.name,
          key: `owner-${ownerId}`,
          onRemove: () => toggleFilter(ownerId, filters.owners, (val) => setFilters({ owners: val as string[] })),
        });
      }
    });
    
    departments.forEach((dept) => {
      chips.push({
        label: '部门',
        value: dept,
        key: `dept-${dept}`,
        onRemove: () => toggleFilter(dept, departments, setDepartments),
      });
    });
    
    filters.qualityStatuses.forEach((status) => {
      const opt = qualityOptions.find((o) => o.value === status);
      if (opt) {
        chips.push({
          label: '质量',
          value: opt.label,
          key: `quality-${status}`,
          onRemove: () => toggleFilter(status, filters.qualityStatuses, (val) => setFilters({ qualityStatuses: val as QualityStatus[] })),
        });
      }
    });
    
    filters.sensitivityLevels.forEach((level) => {
      const opt = sensitivityOptions.find((o) => o.value === level);
      if (opt) {
        chips.push({
          label: '敏感',
          value: opt.label,
          key: `sens-${level}`,
          onRemove: () => toggleFilter(level, filters.sensitivityLevels, (val) => setFilters({ sensitivityLevels: val as SensitivityLevel[] })),
        });
      }
    });
    
    filters.tags.forEach((tag) => {
      chips.push({
        label: '标签',
        value: tag,
        key: `tag-${tag}`,
        onRemove: () => toggleFilter(tag, filters.tags, (val) => setFilters({ tags: val })),
      });
    });
    
    return chips;
  }, [filters, departments, owners, systems, themes]);

  return (
    <div className="flex gap-6">
      {/* Filter Sidebar */}
      <aside
        className={cn(
          'w-64 flex-shrink-0',
          showMobileFilter ? 'fixed inset-0 z-50 bg-dark-bg-900/95 lg:bg-transparent lg:relative p-4 lg:p-0 overflow-auto' : 'hidden lg:block'
        )}
      >
        <div className="sticky top-20 space-y-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-200 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              筛选条件
            </h2>
            {showMobileFilter && (
              <button
                onClick={() => setShowMobileFilter(false)}
                className="lg:hidden p-1 hover:bg-dark-bg-700 rounded"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            )}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-tech-cyan-400 hover:text-tech-cyan-300"
              >
                重置
              </button>
            )}
          </div>

          <Card className="p-4">
            <FilterSection title="所属部门">
              <div className="space-y-1">
                {departmentList.map((dept) => (
                  <label
                    key={dept}
                    className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer hover:text-slate-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={departments.includes(dept)}
                      onChange={() => toggleFilter(dept, departments, setDepartments)}
                      className="w-4 h-4 rounded border-dark-bg-600 bg-dark-bg-700 text-tech-cyan-500 focus:ring-tech-cyan-500/30"
                    />
                    <span className="flex items-center gap-1.5 flex-1 truncate">
                      <Building2 className="w-3 h-3 text-slate-500" />
                      {dept}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="所属系统">
              <div className="space-y-1">
                {systems.map((sys) => (
                  <label
                    key={sys.id}
                    className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer hover:text-slate-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={filters.systems.includes(sys.id)}
                      onChange={() =>
                        toggleFilter(sys.id, filters.systems, (val) =>
                          setFilters({ systems: val })
                        )
                      }
                      className="w-4 h-4 rounded border-dark-bg-600 bg-dark-bg-700 text-tech-cyan-500 focus:ring-tech-cyan-500/30"
                    />
                    <span className="flex-1 truncate">{sys.name}</span>
                    <span className="text-xs text-slate-500">{sys.assetCount}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="主题域">
              <div className="space-y-1">
                {themes.map((theme) => (
                  <label
                    key={theme.id}
                    className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer hover:text-slate-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={filters.themes.includes(theme.id)}
                      onChange={() =>
                        toggleFilter(theme.id, filters.themes, (val) =>
                          setFilters({ themes: val })
                        )
                      }
                      className="w-4 h-4 rounded border-dark-bg-600 bg-dark-bg-700 text-tech-cyan-500 focus:ring-tech-cyan-500/30"
                    />
                    <span className="flex-1 truncate">{theme.name}</span>
                    <span className="text-xs text-slate-500">{theme.assetCount}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="负责人">
              <div className="space-y-1">
                {owners.map((owner) => (
                  <label
                    key={owner.id}
                    className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer hover:text-slate-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={filters.owners.includes(owner.id)}
                      onChange={() =>
                        toggleFilter(owner.id, filters.owners, (val) =>
                          setFilters({ owners: val as string[] })
                        )
                      }
                      className="w-4 h-4 rounded border-dark-bg-600 bg-dark-bg-700 text-tech-cyan-500 focus:ring-tech-cyan-500/30"
                    />
                    <img
                      src={owner.avatar}
                      alt={owner.name}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="flex-1 truncate">{owner.name}</span>
                    <span className="text-xs text-slate-500">{owner.department}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="质量状态">
              <div className="flex flex-wrap gap-2">
                {qualityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      toggleFilter(
                        opt.value,
                        filters.qualityStatuses,
                        (val) => setFilters({ qualityStatuses: val as QualityStatus[] })
                      )
                    }
                    className={cn(
                      'px-2.5 py-1 text-xs rounded-md border transition-all',
                      filters.qualityStatuses.includes(opt.value)
                        ? opt.color + ' bg-current/10 border-current/30'
                        : 'text-slate-500 border-dark-bg-600 hover:border-dark-bg-500'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="敏感等级">
              <div className="flex flex-wrap gap-2">
                {sensitivityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      toggleFilter(
                        opt.value,
                        filters.sensitivityLevels,
                        (val) =>
                          setFilters({ sensitivityLevels: val as SensitivityLevel[] })
                      )
                    }
                    className={cn(
                      'px-2.5 py-1 text-xs rounded-md border transition-all',
                      filters.sensitivityLevels.includes(opt.value)
                        ? opt.color + ' bg-current/10 border-current/30'
                        : 'text-slate-500 border-dark-bg-600 hover:border-dark-bg-500'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </FilterSection>
          </Card>

          {/* Tags */}
          <Card className="p-4 mt-4">
            <FilterSection title="热门标签">
              <div className="flex flex-wrap gap-2">
                {['核心', '高频', '近源', '加工', '汇总', '明细', '宽表', '实时', 'T+1'].map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() =>
                        toggleFilter(tag, filters.tags, (val) => setFilters({ tags: val }))
                      }
                      className={cn(
                        'px-2.5 py-1 text-xs rounded-full border transition-all',
                        filters.tags.includes(tag)
                          ? 'text-tech-cyan-400 bg-tech-cyan-500/10 border-tech-cyan-500/30'
                          : 'text-slate-400 border-dark-bg-600 hover:border-tech-cyan-500/50'
                      )}
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </FilterSection>
          </Card>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-slate-100">资产目录</h1>
            <Badge variant="cyan">{filteredAssets.length} 个资产</Badge>
            {hasActiveFilters && (
              <Badge variant="warning">
                {activeFilterCount} 个筛选条件
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            <ViewSelector
              views={views}
              activeViewId={activeViewId}
              onSelect={handleApplyView}
              onDelete={handleDeleteView}
            />
            <button
              onClick={() => setShowSaveModal(true)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-300 bg-dark-bg-800 border border-dark-bg-600 rounded-lg hover:bg-dark-bg-700 hover:border-dark-bg-500 transition-colors"
            >
              <BookmarkPlus className="w-4 h-4" />
              保存视图
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-300 bg-dark-bg-800 border border-dark-bg-600 rounded-lg hover:bg-dark-bg-700 hover:border-dark-bg-500 transition-colors"
            >
              <Download className="w-4 h-4" />
              导出清单
            </button>

            <button
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className={cn(
                'lg:hidden flex items-center gap-2 px-3 py-2 text-sm rounded-lg border',
                showMobileFilter
                  ? 'bg-tech-cyan-500/10 border-tech-cyan-500/30 text-tech-cyan-400'
                  : 'border-dark-bg-600 text-slate-400 hover:border-dark-bg-500'
              )}
            >
              <Filter className="w-4 h-4" />
              筛选
            </button>

            {/* View toggle */}
            <div className="flex items-center bg-dark-bg-800 rounded-lg border border-dark-bg-700/50 p-1">
              <button
                onClick={() => setViewMode('card')}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  viewMode === 'card'
                    ? 'bg-dark-bg-700 text-tech-cyan-400'
                    : 'text-slate-500 hover:text-slate-300'
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  viewMode === 'list'
                    ? 'bg-dark-bg-700 text-tech-cyan-400'
                    : 'text-slate-500 hover:text-slate-300'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">排序:</span>
              <select
                value={sortField}
                onChange={(e) => setSort(e.target.value as SortField, sortOrder)}
                className="bg-dark-bg-800 border border-dark-bg-600 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-tech-cyan-500/50"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.field} value={opt.field}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setSort(sortField, sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 rounded-lg bg-dark-bg-800 border border-dark-bg-600 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {sortOrder === 'desc' ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4 rotate-90" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-4 flex-wrap p-3 bg-dark-bg-800/50 rounded-lg border border-dark-bg-700/50">
            <span className="text-xs text-slate-500 mr-2">当前筛选:</span>
            {activeFilters.map((chip) => (
              <ActiveFilterChip
                key={chip.key}
                label={chip.label}
                value={chip.value}
                onRemove={chip.onRemove}
              />
            ))}
            <button
              onClick={resetFilters}
              className="ml-auto text-xs text-tech-cyan-400 hover:text-tech-cyan-300"
            >
              清除全部
            </button>
          </div>
        )}

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearch} className="mb-4 lg:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="搜索资产名称、描述、标签..."
              className="w-full pl-10 pr-4 py-2 bg-dark-bg-800 border border-dark-bg-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-tech-cyan-500/50"
            />
          </div>
        </form>

        {/* Asset Grid/List */}
        {viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedAssets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="divide-y divide-dark-bg-700/30">
              {paginatedAssets.map((asset) => (
                <AssetListItem key={asset.id} asset={asset} />
              ))}
            </div>
          </Card>
        )}

        {paginatedAssets.length === 0 && (
          <div className="py-16 text-center">
            <Database className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">没有找到匹配的资产</p>
            <p className="text-sm text-slate-500 mt-1">
              尝试调整筛选条件或搜索关键词
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-4 text-sm text-tech-cyan-400 hover:text-tech-cyan-300"
              >
                清除所有筛选条件
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-dark-bg-600 text-slate-400 hover:bg-dark-bg-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                      currentPage === pageNum
                        ? 'bg-tech-cyan-500 text-white'
                        : 'text-slate-400 hover:bg-dark-bg-700'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-dark-bg-600 text-slate-400 hover:bg-dark-bg-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <SaveViewModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveView}
      />
    </div>
  );
}
