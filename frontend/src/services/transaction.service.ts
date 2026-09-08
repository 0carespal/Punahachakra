import { api } from './api';

export interface OrderItem {
  id: string;
  listing_id: string;
  bid_id: string;
  seller_id: string;
  buyer_id: string;
  total_price: number;
  status: 'PENDING' | 'ACCEPTED' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

export interface RankedKabadiwala {
  kabadiwala_id: string;
  user_id: string;
  full_name: string;
  location: string;
  average_rating: number;
  visibility_score: number;
  material_match_score: number;
  distance_km: number;
  distance_score: number;
  rating_score: number;
  inventories: {
    material_name: string;
    category: string;
    quantity: number;
    price_range_min: number;
    price_range_max: number;
  }[];
}

export interface SellerSearchParams {
  material?: string;
  category?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  page?: number;
  page_size?: number;
}

export const transactionService = {
  getMyOrders: async (page = 1, pageSize = 20) => {
    const res = await api.get('/orders/my-orders', {
      params: { page, page_size: pageSize },
    });
    return res.data?.data || res.data;
  },

  getOrder: async (orderId: string): Promise<OrderItem> => {
    const res = await api.get(`/orders/${orderId}`);
    return res.data?.data || res.data;
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<OrderItem> => {
    const res = await api.patch(`/orders/${orderId}/status`, { status });
    return res.data?.data || res.data;
  },

  searchKabadiwalas: async (params?: SellerSearchParams) => {
    const res = await api.get('/search/kabadiwalas', { params });
    return res.data; // PaginatedResponse<RankedKabadiwalaResponse>
  },
};
