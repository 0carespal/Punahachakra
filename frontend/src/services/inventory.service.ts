import { api } from './api';

export interface InventoryItem {
  id: string;
  kabadiwala_id: string;
  material_id: string;
  material: string;
  category: string;
  quantity: number;
  price_range_min: number;
  price_range_max: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryCreatePayload {
  material_name: string;
  category?: string;
  quantity: number;
  price_range_min: number;
  price_range_max: number;
}

export interface InventoryFilterParams {
  material?: string;
  category?: string;
  min_quantity?: number;
  max_quantity?: number;
  min_price?: number;
  max_price?: number;
  page?: number;
  page_size?: number;
}

export const inventoryService = {
  createInventory: async (payload: InventoryCreatePayload): Promise<InventoryItem> => {
    const res = await api.post('/inventory', payload);
    return res.data?.data || res.data;
  },

  getMyInventory: async (params?: InventoryFilterParams) => {
    const res = await api.get('/inventory/me', { params });
    return res.data; // PaginatedResponse: { items, total, page, page_size, total_pages }
  },

  listInventories: async (params?: InventoryFilterParams) => {
    const res = await api.get('/inventory', { params });
    return res.data;
  },

  getInventory: async (inventoryId: string): Promise<InventoryItem> => {
    const res = await api.get(`/inventory/${inventoryId}`);
    return res.data?.data || res.data;
  },

  updateInventory: async (inventoryId: string, payload: Partial<InventoryCreatePayload>): Promise<InventoryItem> => {
    const res = await api.put(`/inventory/${inventoryId}`, payload);
    return res.data?.data || res.data;
  },

  deleteInventory: async (inventoryId: string) => {
    const res = await api.delete(`/inventory/${inventoryId}`);
    return res.data?.data || res.data;
  },
};
