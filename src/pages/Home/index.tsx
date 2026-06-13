import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Database,
  Layers,
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  Clock,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { useAssetStore } from '@/store/useAssetStore';
import { systems } from '@/data/systems';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import HeatLevel from '@/components/ui/HeatLevel';
import FavoriteButton from '@/components/ui/FavoriteButton';
import SystemPieChart from '@/components/charts/SystemPieChart';
import BarChart from '@/components/charts/BarChart';
import {
  cn,
  formatNumber,
  formatDate,
  getQualityColor,
  getQualityLabel,
  getSensitivityColor,
  getSensitivityLabel,
} from '@/utils';
import type { DataAsset } from '@/types';

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  delay = 0,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  trend?: string;
  delay?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : 0;

  useEffect(() => {
    if (typeof value === 'number') {
      const duration = 1500 + delay * 200;
      const steps = 30;
      const increment = numericValue / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setDisplayValue(numericValue);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [numericValue, delay, value]);

  return (
    <Card
      className={cn(
        'p-5 relative overflow-hidden animate-slide-up opacity-0',
        `stagger-${delay + 1}`
      )}
      glow
    >
      <div
        className={cn(
          'absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10',
          color
        )}
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center',
              color.replace('text-', 'bg-').replace('400', '500/10')
            )}
          >
            <Icon className={cn('w-5 h-5', color.replace('text-', 'text-'))} />
          </div>
          {trend && (
            <Badge variant="success" size="sm">
              <TrendingUp className="w-3 h-3 mr-1" />
              {trend}
            </Badge>
          )}
        </div>
        <div className="text-3xl font-bold text-slate-100 mb-1 font-mono tracking-tight">
          {typeof value === 'number' ? formatNumber(displayValue) : value}
        </div>
        <div className="text-sm text-slate-400">{title}</div>
      </div>
    </Card>
  );
}

function HotAssetItem({ asset, rank }: { asset: DataAsset; rank: number }) {
  const { toggleFavorite } = useAssetStore();

  return (
    <Link
      to={`/asset/${asset.id}`}
      className="flex items-center gap-4 p-3 rounded-lg hover:bg-dark-bg-700/30 transition-colors group"
    >
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0',
          rank <= 3
            ? 'bg-gradient-to-br from-amber-400 to-rose-500 text-white'
            : 'bg-dark-bg-700 text-slate-400'
        )}
      >
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-200 truncate group-hover:text-tech-cyan-400 transition-colors">
          {asset.name}
        </div>
        <div className="text-xs text-slate-500 truncate">{asset.systemName}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <HeatLevel level={asset.heatLevel} />
        <FavoriteButton
          isFavorite={asset.isFavorite}
          onClick={() => toggleFavorite(asset.id)}
          size="sm"
        />
      </div>
    </Link>
  );
}

function RecentUpdateItem({ asset }: { asset: DataAsset }) {
  return (
    <Link
      to={`/asset/${asset.id}`}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-bg-700/30 transition-colors group"
    >
      <div className="relative">
        <div className="w-2 h-2 rounded-full bg-tech-cyan-400 animate-pulse" />
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-px h-8 bg-dark-bg-700" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-200 truncate group-hover:text-tech-cyan-400 transition-colors">
          {asset.name}
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>{asset.systemName}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(asset.lastUpdated)}
          </span>
        </div>
      </div>
      <Badge className={getQualityColor(asset.qualityStatus)} size="sm">
        {getQualityLabel(asset.qualityStatus)}
      </Badge>
    </Link>
  );
}

export default function Home() {
  const { assets, getHotAssets, getRecentlyUpdated, toggleFavorite } = useAssetStore();
  const hotAssets = getHotAssets();
  const recentAssets = getRecentlyUpdated();

  const systemData = systems.slice(0, 6).map((s) => ({
    name: s.name,
    value: s.assetCount,
    color: s.color,
  }));

  const themeData = [
    { name: '用户主题', value: 78 },
    { name: '交易主题', value: 95 },
    { name: '商品主题', value: 56 },
    { name: '流量主题', value: 42 },
    { name: '财务主题', value: 34 },
    { name: '运营主题', value: 48 },
  ];

  const highSensitiveCount = assets.filter((a) => a.sensitivityLevel === 'restricted' || a.sensitivityLevel === 'confidential').length;
  const pendingInventoryCount = assets.filter((a) => a.inventoryStatus === 'pending' || a.inventoryStatus === 'unverified').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">
            数据资产地图
            <span className="ml-3 text-base font-normal text-slate-400">
              全景洞察数据资产
            </span>
          </h1>
          <p className="text-sm text-slate-500">
            实时掌握数据资产分布、质量与使用情况
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-tech-cyan-400 bg-tech-cyan-500/10 border border-tech-cyan-500/30 rounded-lg hover:bg-tech-cyan-500/20 transition-colors"
          >
            <Database className="w-4 h-4" />
            浏览全部资产
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="数据资产总数"
          value={assets.length}
          icon={Database}
          color="text-tech-cyan-400"
          trend="+12 本周"
          delay={0}
        />
        <StatCard
          title="业务系统"
          value={systems.length}
          icon={Layers}
          color="text-emerald-400"
          delay={1}
        />
        <StatCard
          title="待盘点资产"
          value={pendingInventoryCount}
          icon={AlertTriangle}
          color="text-amber-400"
          delay={2}
        />
        <StatCard
          title="高敏数据资产"
          value={highSensitiveCount}
          icon={ShieldAlert}
          color="text-rose-400"
          delay={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100">系统资产分布</h2>
            <Link
              to="/catalog"
              className="text-sm text-tech-cyan-400 hover:text-tech-cyan-300 flex items-center gap-1"
            >
              查看详情
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <SystemPieChart data={systemData} />
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100">主题域分布</h2>
          </div>
          <BarChart data={themeData} height={280} color="#06b6d4" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              热门资产排行
            </h2>
            <Link
              to="/catalog?sort=heat"
              className="text-sm text-tech-cyan-400 hover:text-tech-cyan-300 flex items-center gap-1"
            >
              更多
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-1 max-h-[360px] overflow-y-auto">
            {hotAssets.slice(0, 8).map((asset, index) => (
              <HotAssetItem key={asset.id} asset={asset} rank={index + 1} />
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-tech-cyan-400" />
              最近更新
            </h2>
            <Link
              to="/catalog?sort=updated"
              className="text-sm text-tech-cyan-400 hover:text-tech-cyan-300 flex items-center gap-1"
            >
              更多
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-1 max-h-[360px] overflow-y-auto">
            {recentAssets.slice(0, 8).map((asset) => (
              <RecentUpdateItem key={asset.id} asset={asset} />
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-100">快速入口</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { name: '用户中心', icon: Database, color: 'from-cyan-500 to-blue-500', count: 45 },
            { name: '订单系统', icon: Database, color: 'from-emerald-500 to-teal-500', count: 68 },
            { name: '商品中心', icon: Database, color: 'from-amber-500 to-orange-500', count: 36 },
            { name: '支付系统', icon: Database, color: 'from-rose-500 to-pink-500', count: 28 },
            { name: '数据仓库', icon: Database, color: 'from-violet-500 to-purple-500', count: 89 },
            { name: '客服系统', icon: Database, color: 'from-pink-500 to-rose-500', count: 24 },
            { name: '营销平台', icon: Database, color: 'from-orange-500 to-amber-500', count: 33 },
            { name: '供应链', icon: Database, color: 'from-teal-500 to-emerald-500', count: 52 },
          ].map((item, index) => (
            <Link
              key={item.name}
              to={`/catalog?system=${index + 1}`}
              className="flex flex-col items-center gap-3 p-4 rounded-xl border border-dark-bg-700/50 hover:border-tech-cyan-500/30 hover:bg-dark-bg-800/50 transition-all group"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
              >
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-slate-200 group-hover:text-tech-cyan-400 transition-colors">
                  {item.name}
                </div>
                <div className="text-xs text-slate-500">{item.count} 个资产</div>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
