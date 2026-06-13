export type QualityStatus = 'excellent' | 'good' | 'warning' | 'poor';
export type SensitivityLevel = 'public' | 'internal' | 'confidential' | 'restricted';
export type UpdateFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
export type InventoryStatus = 'confirmed' | 'pending' | 'deprecated' | 'unverified';
export type UserRole = 'admin' | 'analyst' | 'owner';
export type PermissionType = 'read' | 'write' | 'admin';
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'processing';
export type TaskStatus = 'draft' | 'in_progress' | 'completed';
export type NodeType = 'table' | 'view' | 'api' | 'report';

export interface DataAsset {
  id: string;
  name: string;
  description: string;
  systemId: string;
  systemName: string;
  themeId: string;
  themeName: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  department: string;
  qualityStatus: QualityStatus;
  sensitivityLevel: SensitivityLevel;
  heatLevel: number;
  viewCount: number;
  dataCount: number;
  storageSize: string;
  updateFrequency: UpdateFrequency;
  lastUpdated: string;
  createdAt: string;
  tags: string[];
  isFavorite: boolean;
  inventoryStatus: InventoryStatus;
}

export interface Field {
  id: string;
  name: string;
  description: string;
  type: string;
  isSensitive: boolean;
  isNullable: boolean;
  sampleValue: string;
}

export interface LineageNode {
  id: string;
  name: string;
  type: NodeType;
  system: string;
  level: number;
}

export interface LineageEdge {
  source: string;
  target: string;
  type: 'input' | 'output' | 'transform';
}

export interface LineageData {
  nodes: LineageNode[];
  edges: LineageEdge[];
}

export interface ApprovalRecord {
  approver: string;
  action: 'approve' | 'reject' | 'transfer';
  comment: string;
  time: string;
}

export interface PermissionRequest {
  id: string;
  assetId: string;
  assetName: string;
  applicantId: string;
  applicantName: string;
  reason: string;
  permissionType: PermissionType;
  duration: string;
  status: RequestStatus;
  currentApprover: string;
  approvers: string[];
  createdAt: string;
  updatedAt: string;
  approvalHistory: ApprovalRecord[];
}

export interface InventoryTask {
  id: string;
  name: string;
  description: string;
  department: string;
  systemId?: string;
  creatorId: string;
  creatorName: string;
  status: TaskStatus;
  totalAssets: number;
  confirmedAssets: number;
  pendingAssets: number;
  deprecatedAssets: number;
  createdAt: string;
  deadline: string;
  assignees: string[];
}

export interface System {
  id: string;
  name: string;
  description: string;
  assetCount: number;
  department: string;
  color: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  assetCount: number;
  icon: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  department: string;
  role: UserRole;
}

export interface AssetFilters {
  systems: string[];
  themes: string[];
  qualityStatuses: QualityStatus[];
  sensitivityLevels: SensitivityLevel[];
  owners: string[];
  tags: string[];
  searchQuery: string;
}

export type SortField = 'name' | 'heat' | 'updated' | 'created';
export type SortOrder = 'asc' | 'desc';
