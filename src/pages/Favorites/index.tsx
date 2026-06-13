import { Link } from 'react-router-dom';
import { Star, Database, Eye, Clock } from 'lucide-react';
import { useAssetStore } from '@/store/useAssetStore';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import HeatLevel from '@/components/ui/HeatLevel';
import FavoriteButton from '@/components/ui/FavoriteButton';
import {
  formatDate,
  getQualityColor,
  getQualityLabel,
  getSensitivityColor,
  getSensitivityLabel,
  formatNumber,
} from '@/utils';

export default function Favorites() {
  const { getFavoriteAssets, toggleFavorite } = useAssetStore();
  const favorites = getFavoriteAssets();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
          我的收藏
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          您收藏的所有数据资产，共 {favorites.length} 个
        </p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {favorites.map((asset) => (
            <Card key={asset.id} hover className="p-4 flex flex-col h-full">
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
          ))}
        </div>
      ) : (
        <Card className="py-16 text-center">
          <Star className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">暂无收藏的资产</p>
          <p className="text-sm text-slate-500 mt-2">
            浏览资产目录，将常用的数据资产添加到收藏
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-tech-cyan-500 text-white text-sm font-medium rounded-lg hover:bg-tech-cyan-600 transition-colors"
          >
            去浏览资产
          </Link>
        </Card>
      )}
    </div>
  );
}
