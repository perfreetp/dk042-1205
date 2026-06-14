import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InventoryTask, TaskStatus, InventoryStatus, DataAsset } from '@/types';
import { inventoryTasks as initialTasks } from '@/data/mockData';
import { currentUser } from '@/data/systems';
import { assets as initialAssets } from '@/data/assets';
import { useAssetStore } from './useAssetStore';

interface InventoryState {
  tasks: InventoryTask[];
  activeTab: 'tasks' | 'assets';
  taskFilter: TaskStatus | 'all';
  assetFilter: InventoryStatus | 'all';
  departmentFilter: string;
  searchQuery: string;
  activeTaskId: string | null;
  setActiveTab: (tab: 'tasks' | 'assets') => void;
  setTaskFilter: (filter: TaskStatus | 'all') => void;
  setAssetFilter: (filter: InventoryStatus | 'all') => void;
  setDepartmentFilter: (dept: string) => void;
  setSearchQuery: (query: string) => void;
  setActiveTaskId: (taskId: string | null) => void;
  addTask: (data: {
    name: string;
    description: string;
    department: string;
    systemId?: string;
    deadline: string;
    assignees: string[];
    assetIds: string[];
  }) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateAssetInventoryStatus: (assetId: string, status: InventoryStatus, taskId?: string) => void;
  recalcTaskStats: (taskId: string) => void;
  getFilteredTasks: () => InventoryTask[];
  getFilteredAssets: () => DataAsset[];
  getTaskStats: () => {
    total: number;
    draft: number;
    inProgress: number;
    completed: number;
  };
  getAssetStats: () => {
    total: number;
    confirmed: number;
    pending: number;
    deprecated: number;
    unverified: number;
  };
  getDepartmentList: () => string[];
  exportInventoryAssets: () => string;
}

function generateId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getNow(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      tasks: initialTasks.map((t) => ({
        ...t,
        assetIds: t.assetIds || [],
        updatedAt: t.updatedAt || t.createdAt,
      })),
      activeTab: 'tasks',
      taskFilter: 'all',
      assetFilter: 'all',
      departmentFilter: '',
      searchQuery: '',
      activeTaskId: null,

      setActiveTab: (tab) => set({ activeTab: tab }),
      setTaskFilter: (filter) => set({ taskFilter: filter }),
      setAssetFilter: (filter) => set({ assetFilter: filter }),
      setDepartmentFilter: (dept) => set({ departmentFilter: dept }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setActiveTaskId: (taskId) => set({ activeTaskId: taskId }),

      addTask: (data) => {
        const totalAssets = data.assetIds.length;
        const assetStore = useAssetStore.getState();
        let confirmed = 0;
        let pending = 0;
        let deprecated = 0;
        data.assetIds.forEach((aid) => {
          const a = assetStore.assets.find((x) => x.id === aid);
          if (a) {
            if (a.inventoryStatus === 'confirmed') confirmed++;
            else if (a.inventoryStatus === 'deprecated') deprecated++;
            else pending++;
          }
        });

        const newTask: InventoryTask = {
          id: generateId(),
          name: data.name,
          description: data.description,
          department: data.department,
          systemId: data.systemId,
          creatorId: currentUser.id,
          creatorName: currentUser.name,
          status: 'in_progress',
          totalAssets,
          confirmedAssets: confirmed,
          pendingAssets: pending,
          deprecatedAssets: deprecated,
          createdAt: getNow(),
          updatedAt: getNow(),
          deadline: data.deadline,
          assignees: data.assignees,
          assetIds: data.assetIds,
        };
        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }));
      },

      updateTaskStatus: (taskId, status) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, status, updatedAt: getNow() } : t
          ),
        }));
      },

      updateAssetInventoryStatus: (assetId, status, taskId) => {
        const assetStore = useAssetStore.getState();
        assetStore.updateInventoryStatus(assetId, status);

        if (taskId) {
          get().recalcTaskStats(taskId);
        } else {
          const { tasks } = get();
          tasks.forEach((t) => {
            if (t.assetIds.includes(assetId)) {
              get().recalcTaskStats(t.id);
            }
          });
        }
      },

      recalcTaskStats: (taskId) => {
        const assetStore = useAssetStore.getState();
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== taskId) return t;
            const taskAssets = t.assetIds
              .map((aid) => assetStore.assets.find((a) => a.id === aid))
              .filter(Boolean) as DataAsset[];
            return {
              ...t,
              totalAssets: taskAssets.length,
              confirmedAssets: taskAssets.filter((a) => a.inventoryStatus === 'confirmed').length,
              pendingAssets: taskAssets.filter((a) => a.inventoryStatus === 'pending' || a.inventoryStatus === 'unverified').length,
              deprecatedAssets: taskAssets.filter((a) => a.inventoryStatus === 'deprecated').length,
              updatedAt: getNow(),
            };
          }),
        }));
      },

      getFilteredTasks: () => {
        const { tasks, taskFilter, departmentFilter } = get();
        let filtered = [...tasks];
        if (taskFilter !== 'all') {
          filtered = filtered.filter((t) => t.status === taskFilter);
        }
        if (departmentFilter) {
          filtered = filtered.filter((t) => t.department === departmentFilter);
        }
        return filtered;
      },

      getFilteredAssets: () => {
        const { assetFilter, departmentFilter, searchQuery, activeTaskId } = get();
        const assetStore = useAssetStore.getState();
        let filtered: DataAsset[];

        if (activeTaskId) {
          const task = get().tasks.find((t) => t.id === activeTaskId);
          if (task) {
            filtered = task.assetIds
              .map((aid) => assetStore.assets.find((a) => a.id === aid))
              .filter(Boolean) as DataAsset[];
          } else {
            filtered = [...assetStore.assets];
          }
        } else {
          filtered = [...assetStore.assets];
        }

        if (assetFilter !== 'all') {
          filtered = filtered.filter((a) => a.inventoryStatus === assetFilter);
        }
        if (departmentFilter) {
          filtered = filtered.filter((a) => a.department === departmentFilter);
        }
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (a) =>
              a.name.toLowerCase().includes(query) ||
              a.systemName.toLowerCase().includes(query)
          );
        }
        return filtered;
      },

      getTaskStats: () => {
        const { tasks } = get();
        return {
          total: tasks.length,
          draft: tasks.filter((t) => t.status === 'draft').length,
          inProgress: tasks.filter((t) => t.status === 'in_progress').length,
          completed: tasks.filter((t) => t.status === 'completed').length,
        };
      },

      getAssetStats: () => {
        const assets = get().getFilteredAssets();
        return {
          total: assets.length,
          confirmed: assets.filter((a) => a.inventoryStatus === 'confirmed').length,
          pending: assets.filter((a) => a.inventoryStatus === 'pending').length,
          deprecated: assets.filter((a) => a.inventoryStatus === 'deprecated').length,
          unverified: assets.filter((a) => a.inventoryStatus === 'unverified').length,
        };
      },

      getDepartmentList: () => {
        const assetStore = useAssetStore.getState();
        const depts = new Set<string>();
        assetStore.assets.forEach((a) => depts.add(a.department));
        return Array.from(depts).sort();
      },

      exportInventoryAssets: () => {
        const assets = get().getFilteredAssets();
        const headers = [
          'ID',
          '资产名称',
          '所属系统',
          '所属主题',
          '负责人',
          '部门',
          '质量状态',
          '敏感等级',
          '盘点状态',
          '标签',
        ];
        const rows = assets.map((a) => [
          a.id,
          a.name,
          a.systemName,
          a.themeName,
          a.ownerName,
          a.department,
          a.qualityStatus,
          a.sensitivityLevel,
          a.inventoryStatus,
          (a.tags || []).join(';'),
        ]);
        const csvContent = [
          headers.join(','),
          ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
        ].join('\n');
        return csvContent;
      },
    }),
    {
      name: 'data-asset-inventory-v2',
      partialize: (state) => ({
        tasks: state.tasks,
      }),
    }
  )
);
