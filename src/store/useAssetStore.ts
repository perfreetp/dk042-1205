import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DataAsset, AssetFilters, SortField, SortOrder, InventoryStatus } from '@/types';
import { assets as initialAssets } from '@/data/assets';

interface AssetState {
  assets: DataAsset[];
  filters: AssetFilters;
  departments: string[];
  sortField: SortField;
  sortOrder: SortOrder;
  viewMode: 'card' | 'list';
  currentPage: number;
  pageSize: number;
  _hasHydrated: boolean;
  toggleFavorite: (id: string) => void;
  setFilters: (filters: Partial<AssetFilters>) => void;
  resetFilters: () => void;
  setSort: (field: SortField, order: SortOrder) => void;
  setViewMode: (mode: 'card' | 'list') => void;
  setCurrentPage: (page: number) => void;
  setDepartments: (departments: string[]) => void;
  updateInventoryStatus: (assetId: string, status: InventoryStatus) => void;
  getFilteredAssets: () => DataAsset[];
  getFavoriteAssets: () => DataAsset[];
  getHotAssets: () => DataAsset[];
  getRecentlyUpdated: () => DataAsset[];
  getAssetById: (id: string) => DataAsset | undefined;
  getOwnerList: () => { id: string; name: string; avatar: string; department: string }[];
  getDepartmentList: () => string[];
  getActiveFilterCount: () => number;
  exportAssets: () => string;
}

const defaultFilters: AssetFilters = {
  systems: [],
  themes: [],
  qualityStatuses: [],
  sensitivityLevels: [],
  owners: [],
  tags: [],
  searchQuery: '',
};

export const useAssetStore = create<AssetState>()(
  persist(
    (set, get) => ({
      assets: initialAssets,
      filters: defaultFilters,
      departments: [],
      sortField: 'heat',
      sortOrder: 'desc',
      viewMode: 'card',
      currentPage: 1,
      pageSize: 12,
      _hasHydrated: false,

      toggleFavorite: (id: string) =>
        set((state) => ({
          assets: state.assets.map((a) =>
            a.id === id ? { ...a, isFavorite: !a.isFavorite } : a
          ),
        })),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          currentPage: 1,
        })),

      resetFilters: () =>
        set({
          filters: defaultFilters,
        currentPage: 1,
        departments: [],
      }),

      setSort: (field, order) => set({ sortField: field, sortOrder: order }),

      setViewMode: (mode) => set({ viewMode: mode }),

      setCurrentPage: (page) => set({ currentPage: page }),

      setDepartments: (departments) =>
        set({ departments, currentPage: 1 }),

      updateInventoryStatus: (assetId, status) =>
        set((state) => ({
          assets: state.assets.map((a) =>
            a.id === assetId ? { ...a, inventoryStatus: status } : a
          ),
        })),

      getFilteredAssets: () => {
        const { assets, filters, departments, sortField, sortOrder } = get();
        let filtered = [...assets];

        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filtered = filtered.filter(
            (a) =>
              a.name.toLowerCase().includes(query) ||
              a.description.toLowerCase().includes(query) ||
              a.systemName.toLowerCase().includes(query) ||
              (a.tags || []).some((t) => t.toLowerCase().includes(query))
          );
        }

        if (filters.systems.length > 0) {
          filtered = filtered.filter((a) => filters.systems.includes(a.systemId));
        }

        if (filters.themes.length > 0) {
          filtered = filtered.filter((a) => filters.themes.includes(a.themeId));
        }

        if (filters.qualityStatuses.length > 0) {
          filtered = filtered.filter((a) => filters.qualityStatuses.includes(a.qualityStatus));
        }

        if (filters.sensitivityLevels.length > 0) {
          filtered = filtered.filter((a) => filters.sensitivityLevels.includes(a.sensitivityLevel));
        }

        if (filters.owners.length > 0) {
          filtered = filtered.filter((a) => filters.owners.includes(a.ownerId));
        }

        if (filters.tags.length > 0) {
          filtered = filtered.filter((a) => filters.tags.some((t) => (a.tags || []).includes(t)));
        }

        if (departments.length > 0) {
          filtered = filtered.filter((a) => departments.includes(a.department));
        }

        filtered.sort((a, b) => {
          let comparison = 0;
          switch (sortField) {
            case 'name':
              comparison = a.name.localeCompare(b.name);
              break;
            case 'heat':
              comparison = a.heatLevel - b.heatLevel;
              break;
            case 'updated':
              comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
              break;
            case 'created':
              comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
              break;
          }
          return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
      },

      getFavoriteAssets: () => {
        return get().assets.filter((a) => a.isFavorite);
      },

      getHotAssets: () => {
        return [...get().assets].sort((a, b) => b.heatLevel - a.heatLevel).slice(0, 10);
      },

      getRecentlyUpdated: () => {
        return [...get().assets]
          .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
          .slice(0, 10);
      },

      getAssetById: (id) => {
        return get().assets.find((a) => a.id === id);
      },

      getOwnerList: () => {
        const ownerMap = new Map<string, { id: string; name: string; avatar: string; department: string }>();
        get().assets.forEach((a) => {
          if (!ownerMap.has(a.ownerId)) {
            ownerMap.set(a.ownerId, {
              id: a.ownerId,
              name: a.ownerName,
              avatar: a.ownerAvatar,
              department: a.department,
            });
          }
        });
        return Array.from(ownerMap.values());
      },

      getDepartmentList: () => {
        const depts = new Set<string>();
        get().assets.forEach((a) => depts.add(a.department));
        return Array.from(depts).sort();
      },

      getActiveFilterCount: () => {
        const { filters, departments } = get();
        return (
          filters.systems.length +
          filters.themes.length +
          filters.qualityStatuses.length +
          filters.sensitivityLevels.length +
          filters.owners.length +
          filters.tags.length +
          departments.length +
          (filters.searchQuery ? 1 : 0)
        );
      },

      exportAssets: () => {
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
          '热度等级',
          '数据量',
          '存储大小',
          '更新频率',
          '最后更新',
          '创建时间',
          '标签',
          '是否收藏',
          '盘点状态',
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
          String(a.heatLevel),
          String(a.dataCount),
          a.storageSize,
          a.updateFrequency,
          a.lastUpdated,
          a.createdAt,
          (a.tags || []).join(';'),
          a.isFavorite ? '是' : '否',
          a.inventoryStatus,
        ]);
        const csvContent = [
          headers.join(','),
          ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
        ].join('\n');
        return csvContent;
      },
    }),
    {
      name: 'data-asset-assets-v2',
      partialize: (state) => ({
        assets: state.assets.map((a) => ({
          id: a.id,
          isFavorite: a.isFavorite,
          inventoryStatus: a.inventoryStatus,
        })),
      }),
      onRehydrateStorage: () => (state, partialState) => {
        if (!state) return;
        const typedPartial = partialState as {
          assets?: Array<{ id: string; isFavorite: boolean; inventoryStatus: string }>;
        } | undefined;
        const storedAssets = typedPartial?.assets || [];
        const storedMap = new Map(storedAssets.map((a) => [a.id, a]));
        state.assets = initialAssets.map((a) => {
          const stored = storedMap.get(a.id);
          return stored
            ? { ...a, isFavorite: stored.isFavorite, inventoryStatus: stored.inventoryStatus as any }
            : a;
        });
        state._hasHydrated = true;
      },
    }
  )
);
