import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PermissionRequest,
  RequestStatus,
  PermissionType,
  ApprovalRecord,
} from '@/types';
import { permissionRequests as initialRequests } from '@/data/mockData';
import { currentUser, users } from '@/data/systems';

interface PermissionState {
  requests: PermissionRequest[];
  activeTab: RequestStatus | 'all';
  setActiveTab: (tab: RequestStatus | 'all') => void;
  addRequest: (data: {
    assetId: string;
    assetName: string;
    reason: string;
    permissionType: PermissionType;
    duration: string;
  }) => void;
  approveRequest: (id: string, comment?: string) => void;
  rejectRequest: (id: string, comment: string) => void;
  getFilteredRequests: () => PermissionRequest[];
  getRequestsByAsset: (assetId: string) => PermissionRequest[];
  getRequestsByUser: (userId: string) => PermissionRequest[];
  getStats: () => {
    total: number;
    pending: number;
    processing: number;
    approved: number;
    rejected: number;
  };
}

function generateId(): string {
  return `pr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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

function getApproversForAsset(): string[] {
  const dataAdmin = users.find((u) => u.department === '数据部' && u.role === 'admin');
  return dataAdmin ? [dataAdmin.name, currentUser.name] : [currentUser.name];
}

export const usePermissionStore = create<PermissionState>()(
  persist(
    (set, get) => ({
      requests: initialRequests,
      activeTab: 'all',

      setActiveTab: (tab) => set({ activeTab: tab }),

      addRequest: (data) => {
        const approvers = getApproversForAsset();
        const newRequest: PermissionRequest = {
          id: generateId(),
          assetId: data.assetId,
          assetName: data.assetName,
          applicantId: currentUser.id,
          applicantName: currentUser.name,
          reason: data.reason,
          permissionType: data.permissionType,
          duration: data.duration,
          status: 'pending',
          currentApprover: approvers[0] || '',
          approvers,
          createdAt: getNow(),
          updatedAt: getNow(),
          approvalHistory: [],
        };
        set((state) => ({
          requests: [newRequest, ...state.requests],
        }));
      },

      approveRequest: (id, comment = '同意') => {
        set((state) => ({
          requests: state.requests.map((req) => {
            if (req.id !== id) return req;

            const history: ApprovalRecord = {
              approver: currentUser.name,
              action: 'approve',
              comment,
              time: getNow(),
            };

            const currentStep = req.approvalHistory.length;
            const nextStep = currentStep + 1;

            let newStatus: RequestStatus = req.status;
            let newCurrentApprover = req.currentApprover;

            if (nextStep >= req.approvers.length) {
              newStatus = 'approved';
              newCurrentApprover = '';
            } else {
              newStatus = 'processing';
              newCurrentApprover = req.approvers[nextStep];
            }

            return {
              ...req,
              status: newStatus,
              currentApprover: newCurrentApprover,
              updatedAt: getNow(),
              approvalHistory: [...req.approvalHistory, history],
            };
          }),
        }));
      },

      rejectRequest: (id, comment) => {
        set((state) => ({
          requests: state.requests.map((req) => {
            if (req.id !== id) return req;

            const history: ApprovalRecord = {
              approver: currentUser.name,
              action: 'reject',
              comment,
              time: getNow(),
            };

            return {
              ...req,
              status: 'rejected',
              currentApprover: '',
              updatedAt: getNow(),
              approvalHistory: [...req.approvalHistory, history],
            };
          }),
        }));
      },

      getFilteredRequests: () => {
        const { requests, activeTab } = get();
        if (activeTab === 'all') return requests;
        return requests.filter((r) => r.status === activeTab);
      },

      getRequestsByAsset: (assetId) => {
        return get().requests.filter((r) => r.assetId === assetId);
      },

      getRequestsByUser: (userId) => {
        return get().requests.filter((r) => r.applicantId === userId);
      },

      getStats: () => {
        const { requests } = get();
        return {
          total: requests.length,
          pending: requests.filter((r) => r.status === 'pending').length,
          processing: requests.filter((r) => r.status === 'processing').length,
          approved: requests.filter((r) => r.status === 'approved').length,
          rejected: requests.filter((r) => r.status === 'rejected').length,
        };
      },
    }),
    {
      name: 'data-asset-permissions',
    }
  )
);
