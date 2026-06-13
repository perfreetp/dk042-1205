import type { System, Theme, User } from '@/types';

export const systems: System[] = [
  { id: 'sys-001', name: '用户中心系统', description: '统一用户管理、身份认证、权限控制', assetCount: 45, department: '技术中台', color: '#06b6d4' },
  { id: 'sys-002', name: '订单管理系统', description: '订单创建、支付、履约、售后全流程', assetCount: 68, department: '交易线', color: '#10b981' },
  { id: 'sys-003', name: '商品中心', description: '商品信息、SKU管理、类目体系', assetCount: 36, department: '电商业务', color: '#f59e0b' },
  { id: 'sys-004', name: '支付系统', description: '支付渠道、资金结算、对账清分', assetCount: 28, department: '支付线', color: '#f43f5e' },
  { id: 'sys-005', name: '数据仓库', description: '数仓分层、数据集市、指标体系', assetCount: 89, department: '数据部', color: '#8b5cf6' },
  { id: 'sys-006', name: '客服系统', description: '工单管理、智能客服、服务质检', assetCount: 24, department: '客户服务', color: '#ec4899' },
  { id: 'sys-007', name: '营销平台', description: '优惠券、活动配置、人群运营', assetCount: 33, department: '营销线', color: '#f97316' },
  { id: 'sys-008', name: '供应链系统', description: '采购、库存、物流、供应商管理', assetCount: 52, department: '供应链', color: '#14b8a6' },
];

export const themes: Theme[] = [
  { id: 'thm-001', name: '用户主题', description: '用户画像、行为、成长体系', assetCount: 78, icon: 'Users' },
  { id: 'thm-002', name: '交易主题', description: '订单、支付、转化漏斗分析', assetCount: 95, icon: 'ShoppingCart' },
  { id: 'thm-003', name: '商品主题', description: '商品、类目、库存分析', assetCount: 56, icon: 'Package' },
  { id: 'thm-004', name: '流量主题', description: '访问、浏览、渠道分析', assetCount: 42, icon: 'TrendingUp' },
  { id: 'thm-005', name: '财务主题', description: '收入、成本、利润分析', assetCount: 34, icon: 'DollarSign' },
  { id: 'thm-006', name: '运营主题', description: '活动、营销、增长分析', assetCount: 48, icon: 'Megaphone' },
];

export const users: User[] = [
  { id: 'u-001', name: '张明', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangming', department: '数据部', role: 'admin' },
  { id: 'u-002', name: '李雪', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lixue', department: '数据部', role: 'analyst' },
  { id: 'u-003', name: '王浩', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wanghao', department: '交易线', role: 'owner' },
  { id: 'u-004', name: '陈静', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chenjing', department: '电商业务', role: 'owner' },
  { id: 'u-005', name: '赵强', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoqiang', department: '支付线', role: 'owner' },
  { id: 'u-006', name: '孙丽', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunli', department: '营销线', role: 'analyst' },
  { id: 'u-007', name: '周涛', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhoutao', department: '技术中台', role: 'owner' },
  { id: 'u-008', name: '吴敏', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wumin', department: '客户服务', role: 'analyst' },
];

export const currentUser: User = users[0];
