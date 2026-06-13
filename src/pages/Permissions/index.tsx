import { useState } from 'react';
import {
  Shield,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  Calendar,
  AlertCircle,
  ArrowRight,
  Search,
} from 'lucide-react';
import { permissionRequests } from '@/data/mockData';
import { assets } from '@/data/assets';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  cn,
  formatDateFull,
  getRequestStatusColor,
  getRequestStatusLabel,
  getSensitivityColor,
  getSensitivityLabel,
} from '@/utils';
import type { PermissionRequest, RequestStatus, PermissionType } from '@/types';

interface TabProps {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
}

function Tab({ active, label, count, onClick }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
        active
          ? 'border-tech-cyan-400 text-tech-cyan-400'
          : 'border-transparent text-slate-400 hover:text-slate-200'
      )}
    >
      {label}
      {count !== undefined && (
        <span
          className={cn(
            'ml-2 px-2 py-0.5 text-xs rounded-full',
            active
              ? 'bg-tech-cyan-500/20 text-tech-cyan-300'
              : 'bg-dark-bg-700 text-slate-500'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function TimelineStep({
  title,
  subtitle,
  status,
  isLast = false,
}: {
  title: string;
  subtitle: string;
  status: 'done' | 'current' | 'pending' | 'rejected';
  isLast?: boolean;
}) {
  const statusStyles = {
    done: 'bg-emerald-500 text-white',
    current: 'bg-tech-cyan-500 text-white animate-pulse',
    pending: 'bg-dark-bg-600 text-slate-400',
    rejected: 'bg-rose-500 text-white',
  };

  const lineStyles = {
    done: 'bg-emerald-500/50',
    current: 'bg-dark-bg-600',
    pending: 'bg-dark-bg-700',
    rejected: 'bg-rose-500/50',
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10',
            statusStyles[status]
          )}
        >
          {status === 'done' ? (
            <CheckCircle className="w-4 h-4" />
          ) : status === 'rejected' ? (
            <XCircle className="w-4 h-4" />
          ) : status === 'current' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span className="text-xs font-medium">·</span>
          )}
        </div>
        {!isLast && (
          <div className={cn('w-0.5 flex-1 mt-1', lineStyles[status])} />
        )}
      </div>
      <div className="flex-1 pb-6">
        <div className="text-sm font-medium text-slate-200">{title}</div>
        <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>
      </div>
    </div>
  );
}

function RequestCard({ request }: { request: PermissionRequest }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusIcons = {
    pending: Clock,
    processing: Loader2,
    approved: CheckCircle,
    rejected: XCircle,
  };

  const StatusIcon = statusIcons[request.status];

  return (
    <Card className="overflow-hidden">
      <div
        className="p-5 cursor-pointer hover:bg-dark-bg-700/20 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                getRequestStatusColor(request.status).replace('text-', 'bg-').replace('400', '500/10')
              )}
            >
              <StatusIcon
                className={cn(
                  'w-5 h-5',
                  request.status === 'processing' && 'animate-spin'
                )}
                style={{ color: 'inherit' }}
              />
            </div>
            <div>
              <h3 className="font-medium text-slate-200 group-hover:text-tech-cyan-400 transition-colors">
                {request.assetName}
              </h3>
              <div className="text-sm text-slate-500 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {request.applicantName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDateFull(request.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge className={getRequestStatusColor(request.status)}>
              {getRequestStatusLabel(request.status)}
            </Badge>
            <Badge variant="default">{request.permissionType === 'read' ? '读权限' : request.permissionType === 'write' ? '写权限' : '管理员'}</Badge>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-500" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-dark-bg-700/50 p-5 bg-dark-bg-800/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                申请详情
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">申请原因</span>
                  <span className="text-slate-300 text-right flex-1 ml-4">{request.reason}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">权限类型</span>
                  <span className="text-slate-300">
                    {request.permissionType === 'read' ? '读取权限' : request.permissionType === 'write' ? '读写权限' : '管理权限'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">使用期限</span>
                  <span className="text-slate-300">{request.duration}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">申请时间</span>
                  <span className="text-slate-300">{formatDateFull(request.createdAt)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                审批进度
              </h4>
              <div className="space-y-0">
                {request.approvers.map((approver, index) => {
                  const historyItem = request.approvalHistory.find(
                    (h) => h.approver === approver
                  );
                  let status: 'done' | 'current' | 'pending' = 'pending';
                  let subtitle = '待审批';

                  if (historyItem) {
                    status = historyItem.action === 'approve' ? 'done' : 'done';
                    subtitle = `${historyItem.action === 'approve' ? '已通过' : '已拒绝'} · ${formatDateFull(historyItem.time)}`;
                  } else if (request.currentApprover === approver) {
                    status = 'current';
                    subtitle = '审批中';
                  }

                  return (
                    <TimelineStep
                      key={approver}
                      title={`${approver} 审批`}
                      subtitle={subtitle}
                      status={status}
                      isLast={index === request.approvers.length - 1}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {request.status === 'pending' && (
            <div className="mt-4 pt-4 border-t border-dark-bg-700/50 flex justify-end gap-3">
              <Button variant="outline">撤回申请</Button>
              <Button variant="secondary">联系审批人</Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function NewRequestForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState('');
  const [permissionType, setPermissionType] = useState<PermissionType>('read');
  const [duration, setDuration] = useState('3个月');
  const [reason, setReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssets = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.systemName.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 8);

  const selectedAssetData = assets.find((a) => a.id === selectedAsset);

  const canProceed = step === 1 ? selectedAsset : step === 2 ? reason.trim().length > 0 : true;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-5 border-b border-dark-bg-700/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">申请数据权限</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Progress steps */}
        <div className="px-5 py-4 border-b border-dark-bg-700/50">
          <div className="flex items-center gap-2">
            {['选择资产', '填写信息', '确认提交'].map((label, index) => {
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

        <div className="flex-1 overflow-y-auto p-5">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  搜索数据资产
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="输入资产名称或系统名称..."
                    className="w-full pl-10 pr-4 py-2.5 bg-dark-bg-800 border border-dark-bg-600 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-tech-cyan-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset.id)}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-all',
                      selectedAsset === asset.id
                        ? 'border-tech-cyan-500/50 bg-tech-cyan-500/10'
                        : 'border-dark-bg-600 hover:border-dark-bg-500 bg-dark-bg-800/30'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-200 text-sm">
                          {asset.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {asset.systemName}
                        </div>
                      </div>
                      <Badge
                        size="sm"
                        className={
                          getSensitivityColor(asset.sensitivityLevel)
                        }
                      >
                        {getSensitivityLabel(asset.sensitivityLevel)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="p-4 rounded-lg bg-dark-bg-700/30 border border-dark-bg-600/50">
                <div className="text-xs text-slate-500 mb-1">已选资产</div>
                <div className="font-medium text-slate-200">
                  {selectedAssetData?.name}
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  {selectedAssetData?.systemName}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  权限类型
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'read', label: '读权限', desc: '只读访问' },
                    { value: 'write', label: '写权限', desc: '读写操作' },
                    { value: 'admin', label: '管理', desc: '完全控制' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPermissionType(opt.value as PermissionType)}
                      className={cn(
                        'p-3 rounded-lg border text-left transition-all',
                        permissionType === opt.value
                          ? 'border-tech-cyan-500/50 bg-tech-cyan-500/10'
                          : 'border-dark-bg-600 hover:border-dark-bg-500 bg-dark-bg-800/30'
                      )}
                    >
                      <div className="text-sm font-medium text-slate-200">
                        {opt.label}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  使用期限
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['1个月', '3个月', '6个月', '长期'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={cn(
                        'py-2 text-sm rounded-lg border transition-all',
                        duration === d
                          ? 'border-tech-cyan-500/50 bg-tech-cyan-500/10 text-tech-cyan-400'
                          : 'border-dark-bg-600 text-slate-400 hover:border-dark-bg-500'
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  申请原因 <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="请详细描述数据使用目的和场景..."
                  rows={4}
                  className="w-full px-4 py-3 bg-dark-bg-800 border border-dark-bg-600 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-tech-cyan-500/50 resize-none"
                />
                <div className="text-xs text-slate-500 mt-1 text-right">
                  {reason.length} / 500
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-emerald-400">申请须知</div>
                    <div className="text-sm text-emerald-300/70 mt-1">
                      请确保您的数据使用符合公司数据安全规范，不得将数据用于申请范围以外的用途。
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm py-2 border-b border-dark-bg-700/50">
                  <span className="text-slate-500">申请资产</span>
                  <span className="text-slate-200 font-medium">
                    {selectedAssetData?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-dark-bg-700/50">
                  <span className="text-slate-500">权限类型</span>
                  <span className="text-slate-200">
                    {permissionType === 'read'
                      ? '读取权限'
                      : permissionType === 'write'
                      ? '读写权限'
                      : '管理权限'}
                  </span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-dark-bg-700/50">
                  <span className="text-slate-500">使用期限</span>
                  <span className="text-slate-200">{duration}</span>
                </div>
                <div className="flex justify-between text-sm py-2">
                  <span className="text-slate-500">审批流程</span>
                  <span className="text-slate-200">2 级审批</span>
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
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={onClose}>
                <CheckCircle className="w-4 h-4 mr-1" />
                提交申请
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function Permissions() {
  const [activeTab, setActiveTab] = useState<'all' | RequestStatus>('all');
  const [showNewRequest, setShowNewRequest] = useState(false);

  const filteredRequests =
    activeTab === 'all'
      ? permissionRequests
      : permissionRequests.filter((r) => r.status === activeTab);

  const statusCounts = {
    all: permissionRequests.length,
    pending: permissionRequests.filter((r) => r.status === 'pending').length,
    processing: permissionRequests.filter((r) => r.status === 'processing').length,
    approved: permissionRequests.filter((r) => r.status === 'approved').length,
    rejected: permissionRequests.filter((r) => r.status === 'rejected').length,
  };

  const tabs: { key: 'all' | RequestStatus; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待审批' },
    { key: 'processing', label: '审批中' },
    { key: 'approved', label: '已通过' },
    { key: 'rejected', label: '已拒绝' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">权限申请</h1>
          <p className="text-sm text-slate-500 mt-1">
            管理您的数据访问权限申请，追踪审批进度
          </p>
        </div>
        <Button onClick={() => setShowNewRequest(true)}>
          <Plus className="w-4 h-4 mr-1" />
          新建申请
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {statusCounts.all}
          </div>
          <div className="text-sm text-slate-500">申请总数</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {statusCounts.pending + statusCounts.processing}
          </div>
          <div className="text-sm text-slate-500">进行中</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {statusCounts.approved}
          </div>
          <div className="text-sm text-slate-500">已通过</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-rose-400 font-mono">
            {statusCounts.rejected}
          </div>
          <div className="text-sm text-slate-500">已拒绝</div>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="overflow-hidden">
        <div className="border-b border-dark-bg-700/50 px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <Tab
                key={tab.key}
                active={activeTab === tab.key}
                label={tab.label}
                count={statusCounts[tab.key]}
                onClick={() => setActiveTab(tab.key)}
              />
            ))}
          </div>
        </div>

        <div className="p-4 space-y-3">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))
          ) : (
            <div className="py-16 text-center">
              <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">暂无相关申请记录</p>
              <p className="text-sm text-slate-500 mt-1">
                点击右上角按钮创建新的权限申请
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* New Request Modal */}
      {showNewRequest && <NewRequestForm onClose={() => setShowNewRequest(false)} />}
    </div>
  );
}
