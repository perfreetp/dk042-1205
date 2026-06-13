import { create } from 'zustand';
import type { DataAsset, AssetFilters, SortField, SortOrder } from '@/types';
import { assets as initialAssets } from '@/data/assets';

interface AssetState {
  assets: DataAsset[];
  filters: AssetFilters;
  sortField: SortField;
  sortOrder: SortOrder;
  viewMode: 'card' | 'list';
  currentPage: number;
  pageSize: number;
  toggleFavorite: (id: string) => void;
  setFilters: (filters: Partial<AssetFilters>) => void;
  resetFilters: () => void;
  setSort: (field: SortField, order: SortOrder) => void;
  setViewMode: (mode: 'card' | 'list') => void;
  setCurrentPage: (page: number) => void;
  getFilteredAssets: () => DataAsset[];
  getFavoriteAssets: () => DataAsset[];
  getHotAssets: () => DataAsset[];
  getRecentlyUpdated: () => DataAsset[];
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

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: initialAssets,
  filters: defaultFilters,
  sortField: 'heat',
  sortOrder: 'desc',
  viewMode: 'card',
  currentPage: 1,
  pageSize: 12,

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
    }),

  setSort: (field, order) => set({ sortField: field, sortOrder: order }),

  setViewMode: (mode) => set({ viewMode: mode }),

  setCurrentPage: (page) => set({ currentPage: page }),

  getFilteredAssets: () => {
    const { assets, filters, sortField, sortOrder } = get();
    let filtered = [...assets];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query) ||
          a.systemName.toLowerCase().includes(query) ||
          a.tags.some((t) => t.toLowerCase().includes(query))
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
}));
