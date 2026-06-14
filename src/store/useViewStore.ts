import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SavedView, AssetFilters, SortField, SortOrder } from '@/types';

interface ViewState {
  views: SavedView[];
  addView: (name: string, filters: AssetFilters, departments: string[], sortField: SortField, sortOrder: SortOrder) => void;
  removeView: (id: string) => void;
  getViewById: (id: string) => SavedView | undefined;
}

export const useViewStore = create<ViewState>()(
  persist(
    (set, get) => ({
      views: [],

      addView: (name, filters, departments, sortField, sortOrder) => {
        const newView: SavedView = {
          id: `view-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name,
          filters: { ...filters },
          departments: [...departments],
          sortField,
          sortOrder,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        set((state) => ({
          views: [newView, ...state.views],
        }));
      },

      removeView: (id) => {
        set((state) => ({
          views: state.views.filter((v) => v.id !== id),
        }));
      },

      getViewById: (id) => {
        return get().views.find((v) => v.id === id);
      },
    }),
    {
      name: 'data-asset-views',
    }
  )
);
