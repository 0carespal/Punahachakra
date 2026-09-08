import { api } from './api';

export interface RequirementItem {
  id: string;
  company_id: string;
  company_name: string;
  material_id: string;
  material: string;
  category: string;
  quantity_required: number;
  budget_min: number;
  budget_max: number;
  description?: string;
  location: string;
  status: 'ACTIVE' | 'MATCHED' | 'NEGOTIATING' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

export interface RequirementCreatePayload {
  material_name: string;
  category?: string;
  quantity_required: number;
  budget_min: number;
  budget_max: number;
  description?: string;
  location?: string;
}

export interface RequirementFilterParams {
  material?: string;
  category?: string;
  location?: string;
  min_quantity?: number;
  max_quantity?: number;
  min_budget?: number;
  max_budget?: number;
  page?: number;
  page_size?: number;
}

export const requirementService = {
  createRequirement: async (payload: RequirementCreatePayload): Promise<RequirementItem> => {
    const res = await api.post('/requirements', payload);
    return res.data?.data || res.data;
  },

  getMyRequirements: async (params?: RequirementFilterParams) => {
    const res = await api.get('/requirements/me', { params });
    return res.data; // PaginatedResponse
  },

  listRequirements: async (params?: RequirementFilterParams) => {
    const res = await api.get('/requirements', { params });
    return res.data;
  },

  getRequirement: async (requirementId: string): Promise<RequirementItem> => {
    const res = await api.get(`/requirements/${requirementId}`);
    return res.data?.data || res.data;
  },

  updateRequirement: async (requirementId: string, payload: Partial<RequirementCreatePayload>): Promise<RequirementItem> => {
    const res = await api.put(`/requirements/${requirementId}`, payload);
    return res.data?.data || res.data;
  },

  deleteRequirement: async (requirementId: string) => {
    const res = await api.delete(`/requirements/${requirementId}`);
    return res.data?.data || res.data;
  },
};
