import { useState, useMemo } from 'react';
import {
  ClipboardList,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  Trash2,
  ChevronRight,
  Download,
  Filter,
  Search,
  Users,
  Calendar,
  Building2,
  XCircle,
  FileText,
  Check,
  X,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { useInventoryStore } from '@/store/useInventoryStore';
import { useAssetStore } from '@/store/useAssetStore';
import { systems, users, currentUser } from '@/data/systems';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  cn,
  formatDateFull,
  getTaskStatusColor,
  getTaskStatusLabel,
  getInventoryColor,
  getInventoryLabel,
  getSensitivityColor,
  getSensitivityLabel,
} from '@/utils';
import type { InventoryTask, TaskStatus, InventoryStatus, DataAsset } from '@/types';

function ProgressRing({
  value,
  max,
  size = 64,
  strokeWidth = 6,
}: {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = max > 0 ? (value / max) * circumference : 0;
  const offset = circumference - progress;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(71, 85, 105, 0.3)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#10b981"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-slate-200">
          {max > 0 ? Math.round((value / max) * 100) : 0}%
        </span>
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: InventoryTask }) {
  const progress = task.totalAssets > 0 ? task.confirmedAssets / task.totalAssets : 0;

  return (
    <Card hover className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-200 truncate">{task.name}</h3>
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{task.description}</p>
        </div>
        <Badge className={cn('ml-3 flex-shrink-0', getTaskStatusColor(task.status))}>
          {getTaskStatusLabel(task.status)}
        </Badge>
      </div>

      <div className="flex items-center gap-6">
        <ProgressRing value={task.confirmedAssets} max={task.totalAssets} />

        <div className="flex-1 grid grid-cols-3 gap-3">
          <div>
            <div className="text-lg font-bold text-slate-100 font-mono">
              {task.totalAssets}
            </div>
            <div className="text-xs text-slate-500">总资产</div>
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-400 font-mono">
              {task.confirmedAssets}
            </div>
            <div className="text-xs text-slate-500">已确认</div>
          </div>
          <div>
            <div className="text-lg font-bold text-amber-400 font-mono">
              {task.pendingAssets}
            </div>
            <div className="text-xs text-slate-500">待盘点</div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-dark-bg-700/50 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            {task.department}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDateFull(task.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {task.creatorName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {task.deprecatedAssets > 0 && (
            <Badge variant="default" size="sm">
              <Trash2 className="w-3 h-3 mr-1" />
              {task.deprecatedAssets} 废弃
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

function AssetInventoryItem({ asset, onStatusChange }: { 
  asset: DataAsset; 
  onStatusChange: (assetId: string, status: InventoryStatus) => void;
}) {
  const statusActions = [
    { value: 'confirmed', label: '确认', icon: Check, color: 'text-emerald-400 hover:bg-emerald-500/10' },
    { value: 'pending', label: '待盘点', icon: Clock, color: 'text-amber-400 hover:bg-amber-500/10' },
    { value: 'deprecated', label: '废弃', icon: Trash2, color: 'text-slate-400 hover:bg-slate-500/10' },
    { value: 'unverified', label: '待确认', icon: HelpCircle, color: 'text-rose-400 hover:bg-rose-500/10' },
  ];

  return (
    <div className="flex items-center gap-4 p-4 border-b border-dark-bg-700/30 hover:bg-dark-bg-700/20 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-200">{asset.name}</div>
        <div className="text-sm text-slate-500 mt-0.5">
          {asset.systemName} · {asset.themeName} · {asset.ownerName}
        </div>
      </div>

      <Badge className={cn('hidden sm:inline-flex', getSensitivityColor(asset.sensitivityLevel))}>
        {getSensitivityLabel(asset.sensitivityLevel)}
      </Badge>

      <Badge className={cn('hidden md:inline-flex', getInventoryColor(asset.inventoryStatus))}>
        {getInventoryLabel(asset.inventoryStatus)}
      </Badge>

      <div className="flex items-center gap-1">
        {statusActions.map((action) => (
          <button
            key={action.value}
            onClick={() => onStatusChange(asset.id, action.value as InventoryStatus)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              asset.inventoryStatus === action.value
                ? action.color + ' bg-current/10'
                : 'text-slate-600 hover:text-slate-400'
            )}
            title={action.label}
          >
            <action.icon className="w-4 h-4" />
          </button>
        ))}
      </div>
    </div>
  );
}

function NewTaskModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const { addTask, getDepartmentList } = useInventoryStore();
  const { assets } = useAssetStore();

  const departments = useMemo(() => getDepartmentList(), [getDepartmentList]);

  const filteredAssets = useMemo(() => {
    let filtered = [...assets];
    if (department) {
      filtered = filtered.filter((a) => a.department === department);
    }
    if (selectedSystem) {
      filtered = filtered.filter((a) => a.systemId === selectedSystem);
    }
    return filtered;
  }, [assets, department, selectedSystem]);

  const availableAssignees = useMemo(() => {
    if (!department) return [];
    return users.filter((u) => u.department === department);
  }, [department]);

  const canProceed = step === 1 
    ? taskName.trim() && department 
    : step === 2 
      ? deadline && selectedAssignees.length > 0 
      : true;

  const toggleAssignee = (userId: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = () => {
    const assigneeNames = selectedAssignees
      .map((id) => users.find((u) => u.id === id)?.name)
      .filter(Boolean) as string[];

    addTask({
      name: taskName,
      description,
      department,
      systemId: selectedSystem || undefined,
      deadline,
      assignees: assigneeNames,
      assetIds: filteredAssets.map((a) => a.id),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-dark-bg-700/50 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-100">新建盘点任务</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-dark-bg-700/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            {['基本信息', '盘点范围', '确认提交'].map((label, index) => {
              const stepNum = index + 1;
              const isActive = step === stepNum;
              const isDone = step > stepNum;

              return (
                <div key={label} className="flex items-center flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium',
                        isActive
                          ? 'bg-tech-cyan-500 text-white'
                          : isDone
                          ? 'bg-emerald-500 text-white'
                          : 'bg-dark-bg-700 text-slate-500'
                      )}
                    >
                      {isDone ? <CheckCircle className="w-4 h-4" /> : stepNum}
                    </div>
                    <span
                      className={cn(
                        'text-sm',
                        isActive || isDone ? 'text-slate-200' : 'text-slate-500'
                      )}
                    >
                      {label}
                    </span>
                  </div>
                  {index < 2 && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 mx-2',
                        isDone ? 'bg-emerald-500/50' : 'bg-dark-bg-700'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  任务名称 <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="例如：Q1数据资产盘点"
                  className="w-full px-4 py-2.5 bg-dark-bg-800 border border-dark-bg-600 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-tech-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  任务描述
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="描述盘点目的和范围..."
                  rows={3}
                  className="w-full px-4 py-3 bg-dark-bg-800 border border-dark-bg-600 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-tech-cyan-500/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  负责部门 <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      onClick={() => {
                        setDepartment(dept);
                        setSelectedAssignees([]);
                      }}
                      className={cn(
                        'py-2 text-sm rounded-lg border transition-all text-left px-3',
                        department === dept
                          ? 'border-tech-cyan-500/50 bg-tech-cyan-500/10 text-tech-cyan-400'
                          : 'border-dark-bg-600 text-slate-400 hover:border-dark-bg-500'
                      )}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  盘点范围
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      checked={!selectedSystem}
                      onChange={() => setSelectedSystem('')}
                      className="w-4 h-4 text-tech-cyan-500"
                    />
                    部门全部资产
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      checked={!!selectedSystem}
                      onChange={() => setSelectedSystem(systems[0]?.id || '')}
                      className="w-4 h-4 text-tech-cyan-500"
                    />
                    指定系统
                  </label>
                </div>
              </div>

              {selectedSystem !== '' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    选择系统
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {systems.map((sys) => (
                      <button
                        key={sys.id}
                        onClick={() => setSelectedSystem(sys.id)}
                        className={cn(
                          'w-full p-3 rounded-lg border text-left transition-all',
                          selectedSystem === sys.id
                            ? 'border-tech-cyan-500/50 bg-tech-cyan-500/10'
                            : 'border-dark-bg-600 hover:border-dark-bg-500'
                        )}
                      >
                        <div className="text-sm text-slate-200">{sys.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {sys.assetCount} 个资产
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  负责人 <span className="text-rose-400">*</span>
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableAssignees.length > 0 ? (
                    availableAssignees.map((user) => (
                      <label
                        key={user.id}
                        className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-dark-bg-700/30 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAssignees.includes(user.id)}
                          onChange={() => toggleAssignee(user.id)}
                          className="w-4 h-4 rounded border-dark-bg-600 bg-dark-bg-700 text-tech-cyan-500 focus:ring-tech-cyan-500/30"
                        />
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm text-slate-300">{user.name}</span>
                        <Badge size="sm" variant="default">
                          {user.role === 'admin' ? '管理员' : user.role === 'owner' ? '资产负责人' : '分析师'}
                        </Badge>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">请先选择部门</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  截止日期 <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-bg-800 border border-dark-bg-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-tech-cyan-500/50"
                />
              </div>

              <div className="p-3 rounded-lg bg-dark-bg-700/30 border border-dark-bg-600/50">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">预计盘点资产数</span>
                  <span className="text-slate-200 font-mono font-medium">
                    {filteredAssets.length} 个
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-dark-bg-700/30 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">任务名称</span>
                  <span className="text-slate-200 font-medium">{taskName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">负责部门</span>
                  <span className="text-slate-200">{department}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">盘点范围</span>
                  <span className="text-slate-200">
                    {selectedSystem
                      ? systems.find((s) => s.id === selectedSystem)?.name
                      : '部门全部资产'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">截止日期</span>
                  <span className="text-slate-200">{deadline}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">负责人</span>
                  <span className="text-slate-200">
                    {selectedAssignees
                      .map((id) => users.find((u) => u.id === id)?.name)
                      .join('、')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">盘点资产数</span>
                  <span className="text-slate-200 font-mono">
                    {filteredAssets.length} 个
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-300/80">
                    创建后将通知相关负责人进行资产盘点，请确保信息准确。
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-dark-bg-700/50 flex justify-between flex-shrink-0">
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          <div className="flex gap-3">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                上一步
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed}>
                下一步
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                <CheckCircle className="w-4 h-4 mr-1" />
                创建任务
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function Inventory() {
  const {
    activeTab,
    setActiveTab,
    taskFilter,
    setTaskFilter,
    assetFilter,
    setAssetFilter,
    departmentFilter,
    setDepartmentFilter,
    getFilteredTasks,
    getFilteredAssets,
    getTaskStats,
    getAssetStats,
    getDepartmentList,
    updateAssetInventoryStatus,
  } = useInventoryStore();
  const { updateInventoryStatus, exportAssets, getFilteredAssets: getStoreFilteredAssets, filters, setFilters } = useAssetStore();
  const [showNewTask, setShowNewTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const taskStats = getTaskStats();
  const assetStats = getAssetStats();
  const departmentList = useMemo(() => getDepartmentList(), [getDepartmentList]);

  const filteredTasks = getFilteredTasks();

  const filteredAssets = useMemo(() => {
    let assets = getFilteredAssets();
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      assets = assets.filter((a) =>
        a.name.toLowerCase().includes(query) ||
        a.systemName.toLowerCase().includes(query)
      );
    }
    return assets.slice(0, 50);
  }, [getFilteredAssets, searchQuery]);

  const handleStatusChange = (assetId: string, status: InventoryStatus) => {
    updateInventoryStatus(assetId, status);
    updateAssetInventoryStatus(assetId, status);
  };

  const handleExport = () => {
    const csvContent = exportAssets();
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `资产盘点清单_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const taskTabs: { key: TaskStatus | 'all'; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'draft', label: '草稿' },
    { key: 'in_progress', label: '进行中' },
    { key: 'completed', label: '已完成' },
  ];

  const assetStatCards = [
    { label: '全部资产', key: 'all', value: assetStats.total, color: 'cyan' },
    { label: '已确认', key: 'confirmed', value: assetStats.confirmed, color: 'emerald' },
    { label: '待盘点', key: 'pending', value: assetStats.pending, color: 'amber' },
    { label: '待确认', key: 'unverified', value: assetStats.unverified, color: 'rose' },
    { label: '已废弃', key: 'deprecated', value: assetStats.deprecated, color: 'slate' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">盘点任务</h1>
          <p className="text-sm text-slate-500 mt-1">
            管理数据资产盘点任务，确认资产有效性
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1" />
            导出清单
          </Button>
          <Button onClick={() => setShowNewTask(true)}>
            <Plus className="w-4 h-4 mr-1" />
            新建盘点
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-dark-bg-700/50 pb-0">
        <button
          onClick={() => setActiveTab('tasks')}
          className={cn(
            'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
            activeTab === 'tasks'
              ? 'border-tech-cyan-400 text-tech-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          <ClipboardList className="w-4 h-4 inline mr-2" />
          盘点任务
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={cn(
            'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
            activeTab === 'assets'
              ? 'border-tech-cyan-400 text-tech-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          资产清单
        </button>
      </div>

      {activeTab === 'tasks' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-tech-cyan-500/10 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-tech-cyan-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-100 font-mono">
                    {taskStats.total}
                  </div>
                  <div className="text-xs text-slate-500">全部任务</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-100 font-mono">
                    {taskStats.inProgress}
                  </div>
                  <div className="text-xs text-slate-500">进行中</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-100 font-mono">
                    {taskStats.completed}
                  </div>
                  <div className="text-xs text-slate-500">已完成</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-100 font-mono">
                    {taskStats.draft}
                  </div>
                  <div className="text-xs text-slate-500">草稿</div>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-slate-500" />
              {taskTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setTaskFilter(tab.key)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg transition-colors',
                    taskFilter === tab.key
                      ? 'bg-tech-cyan-500/10 text-tech-cyan-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-dark-bg-700/50'
                  )}
                >
                  {tab.label}
                  <span className="ml-1.5 text-xs opacity-70">
                    ({tab.key === 'all' ? taskStats.total : taskStats[tab.key as Exclude<keyof typeof taskStats, 'total'>]})
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-500" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="bg-dark-bg-800 border border-dark-bg-600 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-tech-cyan-500/50"
              >
                <option value="">全部部门</option>
                {departmentList.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            ) : (
              <div className="col-span-full py-16 text-center">
                <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">暂无盘点任务</p>
                <p className="text-sm text-slate-500 mt-1">
                  点击右上角按钮创建新的盘点任务
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'assets' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {assetStatCards.map((item) => (
              <button
                key={item.key}
                onClick={() => setAssetFilter(item.key as InventoryStatus | 'all')}
                className={cn(
                  'p-4 rounded-xl border transition-all text-left',
                  assetFilter === item.key
                    ? 'border-tech-cyan-500/50 bg-tech-cyan-500/10'
                    : 'border-dark-bg-700/50 bg-dark-bg-800/40 hover:border-dark-bg-600'
                )}
              >
                <div
                  className={cn(
                    'text-xl font-bold font-mono',
                    item.color === 'cyan'
                      ? 'text-cyan-400'
                      : item.color === 'emerald'
                      ? 'text-emerald-400'
                      : item.color === 'amber'
                      ? 'text-amber-400'
                      : item.color === 'rose'
                      ? 'text-rose-400'
                      : 'text-slate-400'
                  )}
                >
                  {item.value}
                </div>
                <div className="text-xs text-slate-500 mt-1">{item.label}</div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <Building2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  if (e.target.value) {
                    setFilters({ ...filters, systems: [], themes: [] });
                  }
                }}
                className="flex-1 bg-dark-bg-800 border border-dark-bg-600 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-tech-cyan-500/50"
              >
                <option value="">全部部门</option>
                {departmentList.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索资产名称、系统..."
                className="w-full pl-10 pr-4 py-2 bg-dark-bg-800 border border-dark-bg-600 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-tech-cyan-500/50"
              />
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1" />
              导出清单
            </Button>
          </div>

          {departmentFilter && (
            <div className="p-3 bg-tech-cyan-500/10 border border-tech-cyan-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-tech-cyan-300">
                <Building2 className="w-4 h-4" />
                当前查看: <span className="font-medium">{departmentFilter}</span> 的资产清单
                <span className="text-tech-cyan-400/70">({filteredAssets.length} 个资产)</span>
              </div>
            </div>
          )}

          <Card className="overflow-hidden">
            <div className="divide-y divide-dark-bg-700/30">
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => (
                  <AssetInventoryItem
                    key={asset.id}
                    asset={asset}
                    onStatusChange={handleStatusChange}
                  />
                ))
              ) : (
                <div className="py-16 text-center">
                  <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">没有找到匹配的资产</p>
                  <p className="text-sm text-slate-500 mt-1">
                    尝试调整筛选条件或搜索关键词
                  </p>
                </div>
              )}
            </div>
          </Card>
        </>
      )}

      {showNewTask && <NewTaskModal onClose={() => setShowNewTask(false)} />}
    </div>
  );
}
