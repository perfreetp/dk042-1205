import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  if (days < 365) return `${Math.floor(days / 30)}个月前`;
  return `${Math.floor(days / 365)}年前`;
}

export function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function formatNumber(num: number): string {
  if (num >= 100000000) return (num / 100000000).toFixed(2) + '亿';
  if (num >= 10000) return (num / 10000).toFixed(1) + '万';
  return num.toLocaleString();
}

export function getQualityColor(status: string): string {
  const colors: Record<string, string> = {
    excellent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    good: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    poor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  };
  return colors[status] || colors.good;
}

export function getQualityLabel(status: string): string {
  const labels: Record<string, string> = {
    excellent: '优秀',
    good: '良好',
    warning: '警告',
    poor: '较差',
  };
  return labels[status] || status;
}

export function getSensitivityColor(level: string): string {
  const colors: Record<string, string> = {
    public: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
    internal: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    confidential: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    restricted: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  };
  return colors[level] || colors.public;
}

export function getSensitivityLabel(level: string): string {
  const labels: Record<string, string> = {
    public: '公开',
    internal: '内部',
    confidential: '机密',
    restricted: '受限',
  };
  return labels[level] || level;
}

export function getInventoryColor(status: string): string {
  const colors: Record<string, string> = {
    confirmed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    pending: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    deprecated: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
    unverified: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  };
  return colors[status] || colors.unverified;
}

export function getInventoryLabel(status: string): string {
  const labels: Record<string, string> = {
    confirmed: '已确认',
    pending: '待盘点',
    deprecated: '已废弃',
    unverified: '待确认',
  };
  return labels[status] || status;
}

export function getRequestStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    processing: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    approved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    rejected: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  };
  return colors[status] || colors.pending;
}

export function getRequestStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '待审批',
    processing: '审批中',
    approved: '已通过',
    rejected: '已拒绝',
  };
  return labels[status] || status;
}

export function getTaskStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
    in_progress: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    completed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  };
  return colors[status] || colors.draft;
}

export function getTaskStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: '草稿',
    in_progress: '进行中',
    completed: '已完成',
  };
  return labels[status] || status;
}

export function getUpdateFrequencyLabel(freq: string): string {
  const labels: Record<string, string> = {
    realtime: '实时',
    hourly: '每小时',
    daily: '每日',
    weekly: '每周',
    monthly: '每月',
  };
  return labels[freq] || freq;
}
