import { api } from './api';

export interface OfferHistoryItem {
  id: string;
  negotiation_id: string;
  sender_id: string;
  sender_email?: string;
  sender_role?: string;
  offered_price: number;
  offered_quantity?: number;
  message?: string;
  timestamp: string;
}

export interface NegotiationItem {
  id: string;
  requirement_id: string;
  inventory_id?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTER_OFFERED' | 'COMPLETED';
  company_name: string;
  kabadiwala_name: string;
  material_name: string;
  category: string;
  quantity_required: number;
  budget_min: number;
  budget_max: number;
  latest_offered_price?: number;
  latest_offered_quantity?: number;
  offers_history: OfferHistoryItem[];
  created_at: string;
  updated_at: string;
}

export interface InitiateNegotiationPayload {
  requirement_id: string;
  inventory_id?: string;
  offered_price: number;
  offered_quantity?: number;
  message?: string;
}

export interface SendOfferPayload {
  offered_price: number;
  offered_quantity?: number;
  message?: string;
}

export const negotiationService = {
  initiateNegotiation: async (payload: InitiateNegotiationPayload): Promise<NegotiationItem> => {
    const res = await api.post('/negotiations', payload);
    return res.data?.data || res.data;
  },

  listMyNegotiations: async (params?: { status?: string; requirement_id?: string; page?: number; page_size?: number }) => {
    const res = await api.get('/negotiations/me', { params });
    return res.data; // PaginatedResponse
  },

  getNegotiation: async (negotiationId: string): Promise<NegotiationItem> => {
    const res = await api.get(`/negotiations/${negotiationId}`);
    return res.data?.data || res.data;
  },

  sendOffer: async (negotiationId: string, payload: SendOfferPayload): Promise<NegotiationItem> => {
    const res = await api.post(`/negotiations/${negotiationId}/offer`, payload);
    return res.data?.data || res.data;
  },

  acceptOffer: async (negotiationId: string): Promise<NegotiationItem> => {
    const res = await api.post(`/negotiations/${negotiationId}/accept`);
    return res.data?.data || res.data;
  },

  rejectOffer: async (negotiationId: string, reason?: string): Promise<NegotiationItem> => {
    const res = await api.post(`/negotiations/${negotiationId}/reject`, null, {
      params: { reason },
    });
    return res.data?.data || res.data;
  },

  completeNegotiation: async (negotiationId: string): Promise<NegotiationItem> => {
    const res = await api.post(`/negotiations/${negotiationId}/complete`);
    return res.data?.data || res.data;
  },
};
