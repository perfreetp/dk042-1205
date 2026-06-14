import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Shield,
  GitBranch,
  Database,
  Clock,
  Eye,
  HardDrive,
  Calendar,
  RefreshCw,
  User,
  Building2,
  Tag,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  AlertTriangle,
  Flame,
  FileText,
} from 'lucide-react';
import { useAssetStore } from '@/store/useAssetStore';
import { usePermissionStore } from '@/store/usePermissionStore';
import { getFieldsByAssetId } from '@/data/mockData';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import HeatLevel from '@/components/ui/HeatLevel';
import {
  cn,
  formatDateFull,
  formatNumber,
  getQualityColor,
  getQualityLabel,
  getSensitivityColor,
  getSensitivityLabel,
  getInventoryColor,
  getInventoryLabel,
  getUpdateFrequencyLabel,
} from '@/utils';

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-dark-bg-700/50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div>
        <div className="text-xs text-slate-500 mb-0.5">{label}</div>
        <div className="text-sm text-slate-200 font-medium">{value}</div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-bg-700/30">
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xl font-bold text-slate-100 font-mono">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
}

function FieldRow({ field, isExpanded, onToggle }: {
  field: any;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className="border-b border-dark-bg-700/30 hover:bg-dark-bg-700/20 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
            <span className="font-mono text-sm text-tech-cyan-400 font-medium">
              {field.name}
            </span>
            {field.isSensitive && (
              <Badge variant="danger" size="sm">敏感</Badge>
            )}
          </div>
        </td>
        <td className="py-3 px-4 text-sm text-slate-400 font-mono">{field.type}</td>
        <td className="py-3 px-4 text-sm text-slate-400 max-w-xs truncate">{field.description}</td>
        <td className="py-3 px-4">
          {field.isNullable ? (
            <Badge variant="default" size="sm">可空</Badge>
          ) : (
            <Badge variant="warning" size="sm">非空</Badge>
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-dark-bg-800/50">
          <td colSpan={4} className="py-4 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
              <div>
                <div className="text-xs text-slate-500 mb-1">字段描述</div>
                <div className="text-sm text-slate-300">{field.description}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">示例值</div>
                <div className="text-sm font-mono text-tech-cyan-400 bg-dark-bg-900/50 px-3 py-2 rounded-md inline-block">
                  {field.sampleValue}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { assets, toggleFavorite } = useAssetStore();
  const { getRequestsByAsset } = usePermissionStore();
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const asset = assets.find((a) => a.id === id);
  const fields = asset ? getFieldsByAssetId(asset.id) : [];
  const permissionRequests = asset ? getRequestsByAsset(asset.id) : [];

  if (!asset) {
    return (
      <div className="py-20 text-center">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-200 mb-2">资产未找到</h2>
        <p className="text-slate-500 mb-6">您访问的数据资产不存在或已被删除</p>
        <Button onClick={() => navigate('/catalog')}>返回资产目录</Button>
      </div>
    );
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(asset.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg border border-dark-bg-600 text-slate-400 hover:bg-dark-bg-700 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-100">{asset.name}</h1>
            <Badge className={getQualityColor(asset.qualityStatus)}>
              {getQualityLabel(asset.qualityStatus)}质量
            </Badge>
            <Badge className={getSensitivityColor(asset.sensitivityLevel)}>
              {getSensitivityLabel(asset.sensitivityLevel)}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
            <span>ID: {asset.id}</span>
            <button
              onClick={handleCopyId}
              className="text-slate-500 hover:text-tech-cyan-400 transition-colors"
            >
              {copiedId ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => toggleFavorite(asset.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
              asset.isFavorite
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'border-dark-bg-600 text-slate-400 hover:border-amber-500/30 hover:text-amber-400'
            )}
          >
            <Star className={cn('w-4 h-4', asset.isFavorite && 'fill-current')} />
            <span className="text-sm">{asset.isFavorite ? '已收藏' : '收藏'}</span>
          </button>
          <Link
            to={`/lineage/${asset.id}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-tech-cyan-500/30 text-tech-cyan-400 hover:bg-tech-cyan-500/10 transition-colors"
          >
            <GitBranch className="w-4 h-4" />
            <span className="text-sm">查看血缘</span>
          </Link>
          <Link
            to={`/permissions/${asset.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-tech-cyan-500 text-white text-sm font-medium rounded-lg hover:bg-tech-cyan-600 transition-colors"
          >
            <Shield className="w-4 h-4" />
            申请权限
          </Link>
        </div>
      </div>

      {/* Description */}
      <Card className="p-5">
        <p className="text-slate-300 leading-relaxed">{asset.description}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {(asset.tags || []).map((tag) => (
            <Badge
              key={tag}
              variant="default"
              className="flex items-center gap-1"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Eye}
          label="浏览次数"
          value={formatNumber(asset.viewCount)}
          color="bg-tech-cyan-500/10 text-tech-cyan-400"
        />
        <StatCard
          icon={Database}
          label="数据量"
          value={formatNumber(asset.dataCount)}
          color="bg-emerald-500/10 text-emerald-400"
        />
        <StatCard
          icon={HardDrive}
          label="存储大小"
          value={asset.storageSize}
          color="bg-amber-500/10 text-amber-400"
        />
        <StatCard
          icon={Flame}
          label="热度等级"
          value={`${asset.heatLevel}级`}
          color="bg-rose-500/10 text-rose-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-5">基本信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoItem
              icon={Building2}
              label="所属系统"
              value={asset.systemName}
            />
            <InfoItem
              icon={Database}
              label="主题域"
              value={asset.themeName}
            />
            <InfoItem
              icon={User}
              label="负责人"
              value={
                <div className="flex items-center gap-2">
                  <img
                    src={asset.ownerAvatar}
                    alt={asset.ownerName}
                    className="w-5 h-5 rounded-full"
                  />
                  <span>{asset.ownerName}</span>
                  <Badge size="sm" variant="default">
                    {asset.department}
                  </Badge>
                </div>
              }
            />
            <InfoItem
              icon={RefreshCw}
              label="更新频率"
              value={getUpdateFrequencyLabel(asset.updateFrequency)}
            />
            <InfoItem
              icon={Calendar}
              label="创建时间"
              value={formatDateFull(asset.createdAt)}
            />
            <InfoItem
              icon={Clock}
              label="最近更新"
              value={formatDateFull(asset.lastUpdated)}
            />
          </div>
        </Card>

        {/* Status Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-5">状态信息</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-dark-bg-700/30">
              <span className="text-sm text-slate-400">质量状态</span>
              <Badge className={getQualityColor(asset.qualityStatus)}>
                {getQualityLabel(asset.qualityStatus)}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-dark-bg-700/30">
              <span className="text-sm text-slate-400">敏感等级</span>
              <Badge className={getSensitivityColor(asset.sensitivityLevel)}>
                {getSensitivityLabel(asset.sensitivityLevel)}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-dark-bg-700/30">
              <span className="text-sm text-slate-400">盘点状态</span>
              <Badge className={getInventoryColor(asset.inventoryStatus)}>
                {getInventoryLabel(asset.inventoryStatus)}
              </Badge>
            </div>
            <div className="p-3 rounded-lg bg-dark-bg-700/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">热度指数</span>
                <span className="text-sm font-medium text-slate-200">
                  {asset.heatLevel} / 5
                </span>
              </div>
              <HeatLevel level={asset.heatLevel} />
            </div>
          </div>
        </Card>
      </div>

      {/* Fields */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-dark-bg-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">字段信息</h2>
            <Badge variant="default">{fields.length} 个字段</Badge>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-bg-700/50 bg-dark-bg-800/30">
                <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  字段名
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  描述
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  约束
                </th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <FieldRow
                  key={field.id}
                  field={field}
                  isExpanded={expandedField === field.id}
                  onToggle={() =>
                    setExpandedField(expandedField === field.id ? null : field.id)
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Permission Request History */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-dark-bg-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-tech-cyan-400" />
              权限申请记录
            </h2>
            <div className="flex items-center gap-3">
              <Badge variant="default">{permissionRequests.length} 条记录</Badge>
              <Link
                to={`/permissions/${asset.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-tech-cyan-400 bg-tech-cyan-500/10 border border-tech-cyan-500/30 rounded-lg hover:bg-tech-cyan-500/20 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                申请权限
              </Link>
            </div>
          </div>
        </div>
        {permissionRequests.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">暂无权限申请记录</p>
            <p className="text-sm text-slate-500 mt-1">点击上方"申请权限"发起申请</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-bg-700/30">
            {permissionRequests.map((req) => (
              <div key={req.id} className="p-4 hover:bg-dark-bg-700/20 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Badge
                      className={cn(
                        req.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : req.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : req.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-tech-cyan-500/10 text-tech-cyan-400 border-tech-cyan-500/30'
                      )}
                    >
                      {req.status === 'approved'
                        ? '已通过'
                        : req.status === 'rejected'
                        ? '已拒绝'
                        : req.status === 'pending'
                        ? '待审批'
                        : '审批中'}
                    </Badge>
                    <span className="text-sm text-slate-300">
                      {req.permissionType === 'read' ? '只读' : req.permissionType === 'write' ? '读写' : '管理'}权限
                    </span>
                    {req.duration && (
                      <span className="text-xs text-slate-500">有效期 {req.duration}</span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">
                    {req.createdAt.slice(0, 16)}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-1">
                  <span className="text-slate-500">申请理由：</span>
                  {req.reason}
                </p>
                <div className="text-xs text-slate-500">
                  申请人：{req.applicantName}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
