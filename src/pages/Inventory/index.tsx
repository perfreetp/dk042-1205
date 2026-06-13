import { useState } from 'react';
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
  MoreHorizontal,
  Users,
  Calendar,
  Building2,
  XCircle,
  FileText,
  Eye,
  Check,
  X,
  HelpCircle,
} from 'lucide-react';
import { inventoryTasks } from '@/data/mockData';
import { assets } from '@/data/assets';
import { systems } from '@/data/systems';
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
} from '@/utils';
import type { InventoryTask, TaskStatus, InventoryStatus } from '@/types';

type TabType = 'tasks' | 'assets';

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
  const progress = (value / max) * circumference;
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
          {Math.round((value / max) * 100)}%
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
        </div>
        <Button variant="ghost" size="sm">
          查看详情
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
}

function AssetInventoryItem({ asset }: { asset: typeof assets[0] }) {
  const [status, setStatus] = useState<InventoryStatus>(asset.inventoryStatus);

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
          {asset.systemName} · {asset.themeName}
        </div>
      </div>

      <Badge className={cn('hidden sm:inline-flex', getInventoryColor(asset.sensitivityLevel))}>
        {asset.sensitivityLevel === 'restricted'
          ? '受限'
          : asset.sensitivityLevel === 'confidential'
          ? '机密'
          : asset.sensitivityLevel === 'internal'
          ? '内部'
          : '公开'}
      </Badge>

      <Badge className={cn('hidden md:inline-flex', getInventoryColor(status))}>
        {getInventoryLabel(status)}
      </Badge>

      <div className="flex items-center gap-1">
        {statusActions.map((action) => (
          <button
            key={action.value}
            onClick={() => setStatus(action.value as InventoryStatus)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              status === action.value
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

  const departments = [
    '数据部',
    '交易线',
    '电商业务',
    '支付线',
    '营销线',
    '供应链',
    '技术中台',
    '客户服务',
  ];

  const canProceed = step === 1 ? taskName.trim() && department : step === 2 ? deadline : true;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg overflow-hidden">
        <div className="p-5 border-b border-dark-bg-700/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">新建盘点任务</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="px-5 py-4 border-b border-dark-bg-700/50">
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

        <div className="p-5 max-h-96 overflow-y-auto">
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
                      onClick={() => setDepartment(dept)}
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
                      onChange={() => setSelectedSystem(systems[0].id)}
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
                  <div className="space-y-2 max-h-48 overflow-y-auto">
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
                  截止日期 <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-bg-800 border border-dark-bg-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-tech-cyan-500/50"
                />
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
                  <span className="text-slate-500">预计资产数</span>
                  <span className="text-slate-200 font-mono">
                    {selectedSystem
                      ? systems.find((s) => s.id === selectedSystem)?.assetCount
                      : Math.floor(Math.random() * 50 + 30)}
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

        <div className="p-5 border-t border-dark-bg-700/50 flex justify-between">
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
              <Button onClick={onClose}>
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
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [showNewTask, setShowNewTask] = useState(false);
  const [inventoryFilter, setInventoryFilter] = useState<InventoryStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks =
    filterStatus === 'all'
      ? inventoryTasks
      : inventoryTasks.filter((t) => t.status === filterStatus);

  const filteredAssets = assets.filter((asset) => {
    if (inventoryFilter !== 'all' && asset.inventoryStatus !== inventoryFilter) return false;
    if (searchQuery && !asset.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).slice(0, 20);

  const statusCounts = {
    all: inventoryTasks.length,
    draft: inventoryTasks.filter((t) => t.status === 'draft').length,
    in_progress: inventoryTasks.filter((t) => t.status === 'in_progress').length,
    completed: inventoryTasks.filter((t) => t.status === 'completed').length,
  };

  const assetStatusCounts = {
    all: assets.length,
    confirmed: assets.filter((a) => a.inventoryStatus === 'confirmed').length,
    pending: assets.filter((a) => a.inventoryStatus === 'pending').length,
    deprecated: assets.filter((a) => a.inventoryStatus === 'deprecated').length,
    unverified: assets.filter((a) => a.inventoryStatus === 'unverified').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">盘点任务</h1>
          <p className="text-sm text-slate-500 mt-1">
            管理数据资产盘点任务，确认资产有效性
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-1" />
            导出清单
          </Button>
          <Button onClick={() => setShowNewTask(true)}>
            <Plus className="w-4 h-4 mr-1" />
            新建盘点
          </Button>
        </div>
      </div>

      {/* Tabs */}
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
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-tech-cyan-500/10 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-tech-cyan-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-100 font-mono">
                    {statusCounts.all}
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
                    {statusCounts.in_progress}
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
                    {statusCounts.completed}
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
                    {statusCounts.draft}
                  </div>
                  <div className="text-xs text-slate-500">草稿</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Filter */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              {(['all', 'draft', 'in_progress', 'completed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg transition-colors',
                    filterStatus === status
                      ? 'bg-tech-cyan-500/10 text-tech-cyan-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-dark-bg-700/50'
                  )}
                >
                  {status === 'all'
                    ? '全部'
                    : status === 'draft'
                    ? '草稿'
                    : status === 'in_progress'
                    ? '进行中'
                    : '已完成'}
                  <span className="ml-1.5 text-xs opacity-70">
                    ({statusCounts[status]})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Task Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </>
      )}

      {activeTab === 'assets' && (
        <>
          {/* Asset Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: '全部资产', value: assetStatusCounts.all, color: 'cyan' },
              { label: '已确认', value: assetStatusCounts.confirmed, color: 'emerald' },
              { label: '待盘点', value: assetStatusCounts.pending, color: 'amber' },
              { label: '待确认', value: assetStatusCounts.unverified, color: 'rose' },
              { label: '已废弃', value: assetStatusCounts.deprecated, color: 'slate' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() =>
                  setInventoryFilter(
                    item.label === '全部资产'
                      ? 'all'
                      : (item.label === '已确认'
                      ? 'confirmed'
                      : item.label === '待盘点'
                      ? 'pending'
                      : item.label === '待确认'
                      ? 'unverified'
                      : 'deprecated') as InventoryStatus
                  )
                }
                className={cn(
                  'p-4 rounded-xl border transition-all text-left',
                  inventoryFilter ===
                    (item.label === '全部资产'
                      ? 'all'
                      : item.label === '已确认'
                      ? 'confirmed'
                      : item.label === '待盘点'
                      ? 'pending'
                      : item.label === '待确认'
                      ? 'unverified'
                      : 'deprecated')
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

          {/* Search */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索资产名称..."
                className="w-full pl-10 pr-4 py-2 bg-dark-bg-800 border border-dark-bg-600 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-tech-cyan-500/50"
              />
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-1" />
              导出清单
            </Button>
          </div>

          {/* Asset List */}
          <Card className="overflow-hidden">
            <div className="divide-y divide-dark-bg-700/30">
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => (
                  <AssetInventoryItem key={asset.id} asset={asset} />
                ))
              ) : (
                <div className="py-16 text-center">
                  <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">没有找到匹配的资产</p>
                </div>
              )}
            </div>
          </Card>
        </>
      )}

      {/* New Task Modal */}
      {showNewTask && <NewTaskModal onClose={() => setShowNewTask(false)} />}
    </div>
  );
}
