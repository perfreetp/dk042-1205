import type { DataAsset } from '@/types';
import { systems, themes, users } from './systems';

const assetNames = [
  '用户基础信息表', '用户行为日志', '用户注册汇总', '用户画像宽表', '用户等级表',
  '订单主表', '订单明细表', '订单状态流转', '支付流水表', '退款记录表',
  '商品基础信息', '商品SKU表', '商品类目表', '商品库存表', '商品价格表',
  '日活用户统计', '月活用户统计', '用户留存分析', '用户转化漏斗', '渠道效果分析',
  '营收日报表', '成本分析表', '利润核算表', '财务对账表', '资金流水表',
  '活动配置表', '优惠券主表', '优惠券领取记录', '活动效果分析', '人群标签表',
  '供应商信息表', '采购订单表', '入库记录表', '出库记录表', '库存预警表',
  '客服工单表', '工单处理记录', '客服绩效表', '客户满意度', '投诉记录表',
  '接口调用日志', '系统访问日志', '错误日志表', '性能监控数据', '系统配置表',
];

const departments = ['数据部', '交易线', '电商业务', '支付线', '营销线', '供应链', '技术中台', '客户服务'];
const tags = ['核心', '高频', '近源', '加工', '汇总', '明细', '宽表', '维度表', '事实表', '实时', 'T+1', '离线'];

function randomPick<T>(arr: T[], count?: number): T | T[] {
  if (count === undefined) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomDate(daysAgo: number): string {
  const now = new Date();
  const past = new Date(now.getTime() - Math.random() * daysAgo * 24 * 60 * 60 * 1000);
  return past.toISOString();
}

function formatNumber(num: number): string {
  if (num >= 100000000) return (num / 100000000).toFixed(2) + ' 亿';
  if (num >= 10000) return (num / 10000).toFixed(1) + ' 万';
  return num.toLocaleString();
}

function generateStorageSize(dataCount: number): string {
  const sizePerRecord = 0.5 + Math.random() * 2;
  const totalKB = dataCount * sizePerRecord;
  if (totalKB >= 1024 * 1024) return (totalKB / 1024 / 1024).toFixed(2) + ' GB';
  if (totalKB >= 1024) return (totalKB / 1024).toFixed(1) + ' MB';
  return totalKB.toFixed(0) + ' KB';
}

const qualityStatuses: DataAsset['qualityStatus'][] = ['excellent', 'good', 'warning', 'poor'];
const sensitivityLevels: DataAsset['sensitivityLevel'][] = ['public', 'internal', 'confidential', 'restricted'];
const updateFrequencies: DataAsset['updateFrequency'][] = ['realtime', 'hourly', 'daily', 'weekly', 'monthly'];
const inventoryStatuses: DataAsset['inventoryStatus'][] = ['confirmed', 'pending', 'deprecated', 'unverified'];

export const assets: DataAsset[] = assetNames.map((name, index) => {
  const sysIndex = index % systems.length;
  const themeIndex = index % themes.length;
  const ownerIndex = index % users.length;
  const dataCount = Math.floor(1000 + Math.random() * 50000000);

  return {
    id: `asset-${String(index + 1).padStart(3, '0')}`,
    name,
    description: `${name}，包含${name}的核心数据字段，支持${themes[themeIndex].name}相关分析场景。`,
    systemId: systems[sysIndex].id,
    systemName: systems[sysIndex].name,
    themeId: themes[themeIndex].id,
    themeName: themes[themeIndex].name,
    ownerId: users[ownerIndex].id,
    ownerName: users[ownerIndex].name,
    ownerAvatar: users[ownerIndex].avatar,
    department: departments[index % departments.length],
    qualityStatus: qualityStatuses[Math.floor(Math.random() * 4)],
    sensitivityLevel: sensitivityLevels[Math.floor(Math.random() * 4)],
    heatLevel: Math.floor(Math.random() * 5) + 1,
    viewCount: Math.floor(Math.random() * 50000),
    dataCount,
    storageSize: generateStorageSize(dataCount),
    updateFrequency: updateFrequencies[Math.floor(Math.random() * 5)],
    lastUpdated: randomDate(30),
    createdAt: randomDate(365),
    tags: randomPick(tags, 2 + Math.floor(Math.random() * 3)) as string[],
    isFavorite: Math.random() > 0.7,
    inventoryStatus: inventoryStatuses[Math.floor(Math.random() * 4)],
  };
});

export function getAssetById(id: string): DataAsset | undefined {
  return assets.find(a => a.id === id);
}

export function getFavorites(): DataAsset[] {
  return assets.filter(a => a.isFavorite);
}

export function searchAssets(query: string): DataAsset[] {
  const lowerQuery = query.toLowerCase();
  return assets.filter(a =>
    a.name.toLowerCase().includes(lowerQuery) ||
    a.description.toLowerCase().includes(lowerQuery) ||
    a.systemName.toLowerCase().includes(lowerQuery) ||
    a.tags.some(t => t.toLowerCase().includes(lowerQuery))
  );
}

export { formatNumber };
