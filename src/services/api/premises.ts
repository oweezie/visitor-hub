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
  capacity?: number;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
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
  qr_code_url: response.qr_code_url,
  created_at: response.created_at,
  updated_at: response.updated_at,
  capacity: response.capacity,
  contact_person: response.contact_person,
  contact_email: response.contact_email,
  contact_phone: response.contact_phone
});

export const premisesApi = {
  // Get all premises
  getAllPremises: async (): Promise<Premise[]> => {
    try {
      // The axios interceptor already returns response.data
      const response = await api.get<PremiseApiResponse[]>('/auth/premises/');
      
      // Add console log to debug the response
      console.log('Premises API response:', response);
      
      // Check if response is an array before mapping
      if (Array.isArray(response)) {
        return response.map(mapApiResponseToPremise);
      }
      
      // If not an array but has a data property (fallback)
      if (response && Array.isArray(response.data)) {
        return response.data.map(mapApiResponseToPremise);
      }
      
      // Return empty array as fallback
      console.error('Unexpected response format:', response);
      return [];
    } catch (error) {
      console.error('Error in getAllPremises:', error);
      return [];
    }
  },
  
  // Get premise by ID
  getPremiseById: async (id: string | number): Promise<Premise> => {
    const response = await api.get<PremiseApiResponse>(`/auth/premises/${id}/`);
    return mapApiResponseToPremise(response.data);
  },
  
  // Create a new premise
  createPremise: async (data: CreatePremiseData): Promise<Premise> => {
    const response = await api.post<PremiseApiResponse>('/auth/premises/', data);
    return mapApiResponseToPremise(response.data);
  },
  
  // Update a premise
  updatePremise: async (id: string | number, data: Partial<CreatePremiseData>): Promise<Premise> => {
    const response = await api.put<PremiseApiResponse>(`/auth/premises/${id}/`, data);
    return mapApiResponseToPremise(response.data);
  },
  
  // Delete a premise
  deletePremise: (id: string | number): Promise<void> => {
    return api.delete(`/auth/premises/${id}/`);
  },
  
  // Get QR code URL for a premise
  getPremiseQrCode: async (id: string | number): Promise<{ qr_code_url: string }> => {
    const response = await api.get(`/auth/premises/${id}/qr_code/`);
    return response;
  },
  
  // Download QR code image as Blob - Modified to handle content type correctly
  downloadPremiseQrCode: async (id: string | number): Promise<Blob> => {
    // Use axios directly instead of the intercepted api instance to get the full response
    const response = await api.get(`/auth/premises/${id}/download_qr_code/`, {
      responseType: 'blob',
      // Don't specify the Accept header to let the server determine the content type
      transformResponse: [(data) => data], // Prevent default JSON transformation
      headers: {
        // The 406 error suggests the server doesn't accept the specific media types
        // So we're using a more generic Accept header
        'Accept': '*/*'
      }
    });
    return response;
  },

  // Get dynamic QR code for a premise
  getDynamicQrCode: async (id: string | number): Promise<Blob> => {
    return api.get(`/auth/premises/${id}/dynamic-qr-code/`, {
      responseType: 'blob',
      headers: {
        'Accept': '*/*', // Accept any content type
      },
    });
  },
};
