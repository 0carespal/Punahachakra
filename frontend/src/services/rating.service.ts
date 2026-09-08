import { api } from './api';

export interface RatingItem {
  id: string;
  company_id: string;
  company_name: string;
  kabadiwala_id: string;
  kabadiwala_name: string;
  transaction_id?: string;
  stars: number;
  review?: string;
  created_at: string;
  updated_at: string;
}

export interface RatingCreatePayload {
  kabadiwala_id: string;
  transaction_id?: string;
  stars: number;
  review?: string;
}

export const ratingService = {
  createRating: async (payload: RatingCreatePayload): Promise<RatingItem> => {
    const res = await api.post('/ratings', payload);
    return res.data?.data || res.data;
  },

  listKabadiwalaRatings: async (kabadiwalaId: string, page = 1, pageSize = 20) => {
    const res = await api.get(`/ratings/kabadiwala/${kabadiwalaId}`, {
      params: { page, page_size: pageSize },
    });
    return res.data;
  },

  listMyRatings: async (page = 1, pageSize = 20) => {
    const res = await api.get('/ratings/me', {
      params: { page, page_size: pageSize },
    });
    return res.data;
  },

  getRating: async (ratingId: string): Promise<RatingItem> => {
    const res = await api.get(`/ratings/${ratingId}`);
    return res.data?.data || res.data;
  },

  updateRating: async (ratingId: string, payload: { stars?: number; review?: string }): Promise<RatingItem> => {
    const res = await api.put(`/ratings/${ratingId}`, payload);
    return res.data?.data || res.data;
  },

  deleteRating: async (ratingId: string) => {
    const res = await api.delete(`/ratings/${ratingId}`);
    return res.data?.data || res.data;
  },
};
