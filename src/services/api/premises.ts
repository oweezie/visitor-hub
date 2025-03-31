
import api from "@/lib/axios";

interface Premise {
  id: number;
  name: string;
  address: string;
  qr_code?: string;
  qr_code_image?: string;
  qr_code_url?: string;
  created_at: string;
  updated_at: string;
}

interface CreatePremiseData {
  name: string;
  address: string;
}

export const premisesApi = {
  // Get all premises
  getAllPremises: (): Promise<Premise[]> => {
    return api.get('/auth/premises/');
  },
  
  // Get premise by ID
  getPremiseById: (id: string | number): Promise<Premise> => {
    return api.get(`/auth/premises/${id}/`);
  },
  
  // Create a new premise
  createPremise: (data: CreatePremiseData): Promise<Premise> => {
    return api.post('/auth/premises/', data);
  },
  
  // Update a premise
  updatePremise: (id: string | number, data: Partial<CreatePremiseData>): Promise<Premise> => {
    return api.put(`/auth/premises/${id}/`, data);
  },
  
  // Delete a premise
  deletePremise: (id: string | number): Promise<void> => {
    return api.delete(`/auth/premises/${id}/`);
  },
  
  // Get QR code URL for a premise
  getPremiseQrCode: (id: string | number): Promise<{ qr_code_url: string }> => {
    return api.get(`/auth/premises/${id}/qr_code/`);
  },
  
  // Download QR code image as Blob
  // Authentication is handled by the axios instance which includes auth headers
  downloadPremiseQrCode: (id: string | number): Promise<Blob> => {
    return api.get(`/auth/premises/${id}/download_qr_code/`, { 
      responseType: 'blob',
      headers: {
        'Accept': 'image/png, image/jpeg'
      }
    });
  }
};
