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
  setActiveTab: (tab: 'tasks' | 'assets') => void;
  setTaskFilter: (filter: TaskStatus | 'all') => void;
  setAssetFilter: (filter: InventoryStatus | 'all') => void;
  setDepartmentFilter: (dept: string) => void;
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
      tasks: initialTasks,
      activeTab: 'tasks',
      taskFilter: 'all',
      assetFilter: 'all',
      departmentFilter: '',

      setActiveTab: (tab) => set({ activeTab: tab }),
      setTaskFilter: (filter) => set({ taskFilter: filter }),
      setAssetFilter: (filter) => set({ assetFilter: filter }),
      setDepartmentFilter: (dept) => set({ departmentFilter: dept }),

      addTask: (data) => {
        const totalAssets = data.assetIds.length;
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
          confirmedAssets: 0,
          pendingAssets: totalAssets,
          deprecatedAssets: 0,
          createdAt: getNow(),
          deadline: data.deadline,
          assignees: data.assignees,
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
        const { tasks } = get();
        const task = tasks.find((t) => t.id === taskId);
        const assetStore = useAssetStore.getState();
        const currentAsset = assetStore.assets.find((a) => a.id === assetId);

        if (task && currentAsset) {
          set((state) => ({
            tasks: state.tasks.map((t) => {
              if (t.id !== taskId) return t;
              const prevStatus = currentAsset.inventoryStatus;
              let confirmed = t.confirmedAssets;
              let pending = t.pendingAssets;
              let deprecated = t.deprecatedAssets;

              if (prevStatus === 'confirmed') confirmed--;
              else if (prevStatus === 'pending') pending--;
              else if (prevStatus === 'deprecated') deprecated--;
              else if (prevStatus === 'unverified') pending--;

              if (status === 'confirmed') confirmed++;
              else if (status === 'pending') pending++;
              else if (status === 'deprecated') deprecated++;
              else if (status === 'unverified') pending++;

              return {
                ...t,
                confirmedAssets: confirmed,
                pendingAssets: pending,
                deprecatedAssets: deprecated,
              };
            }),
          }));
        }
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
        const { assetFilter, departmentFilter } = get();
        const assetStore = useAssetStore.getState();
        let filtered = [...assetStore.assets];
        if (assetFilter !== 'all') {
          filtered = filtered.filter((a) => a.inventoryStatus === assetFilter);
        }
        if (departmentFilter) {
          filtered = filtered.filter((a) => a.department === departmentFilter);
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
        const { getFilteredAssets } = get();
        const assets = getFilteredAssets();
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
    }),
    {
      name: 'data-asset-inventory',
      partialize: (state) => ({
        tasks: state.tasks,
      }),
    }
  )
);
