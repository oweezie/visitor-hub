
import api from "@/lib/axios";
import { Premise } from "@/types/Premise";

// API response type that matches backend structure
interface PremiseApiResponse {
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

// Helper function to convert API response to our Premise type
const mapApiResponseToPremise = (response: PremiseApiResponse): Premise => ({
  id: String(response.id), // Convert number to string to match our Premise type
  name: response.name,
  address: response.address,
  qr_code: response.qr_code,
  qr_code_url: response.qr_code_url
});

export const premisesApi = {
  // Get all premises
  getAllPremises: async (): Promise<Premise[]> => {
    const response = await api.get<PremiseApiResponse[]>('/auth/premises/');
    return (response as PremiseApiResponse[]).map(mapApiResponseToPremise);
  },
  
  // Get premise by ID
  getPremiseById: async (id: string | number): Promise<Premise> => {
    const response = await api.get<PremiseApiResponse>(`/auth/premises/${id}/`);
    return mapApiResponseToPremise(response as PremiseApiResponse);
  },
  
  // Create a new premise
  createPremise: async (data: CreatePremiseData): Promise<Premise> => {
    const response = await api.post<PremiseApiResponse>('/auth/premises/', data);
    return mapApiResponseToPremise(response as PremiseApiResponse);
  },
  
  // Update a premise
  updatePremise: async (id: string | number, data: Partial<CreatePremiseData>): Promise<Premise> => {
    const response = await api.put<PremiseApiResponse>(`/auth/premises/${id}/`, data);
    return mapApiResponseToPremise(response as PremiseApiResponse);
  },
  
  // Delete a premise
  deletePremise: (id: string | number): Promise<void> => {
    return api.delete(`/auth/premises/${id}/`);
  },
  
  // Get QR code URL for a premise
  getPremiseQrCode: async (id: string | number): Promise<{ qr_code_url: string }> => {
    return api.get(`/auth/premises/${id}/qr_code/`);
  },
  
  // Download QR code image as Blob
  downloadPremiseQrCode: (id: string | number): Promise<Blob> => {
    return api.get(`/auth/premises/${id}/download_qr_code/`, { 
      responseType: 'blob',
      headers: {
        'Accept': 'image/png, image/jpeg'
      }
    });
  }
};
