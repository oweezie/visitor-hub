
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
      
      console.log('Premises API response:', response);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response.map(mapApiResponseToPremise);
      }
      
      // If response is an object with a data property that is an array
      if (response && Array.isArray(response.data)) {
        return response.data.map(mapApiResponseToPremise);
      }
      
      // If response is a direct object containing the premises array
      if (response && Array.isArray(response.premises)) {
        return response.premises.map(mapApiResponseToPremise);
      }
      
      // Return empty array as fallback
      console.error('Unexpected response format:', response);
      return [];
    } catch (error) {
      console.error('Error in getAllPremises:', error);
      throw error; // Rethrow to handle in the component
    }
  },
  
  // Get premise by ID
  getPremiseById: async (id: string | number): Promise<Premise> => {
    try {
      const response = await api.get<PremiseApiResponse>(`/auth/premises/${id}/`);
      
      // Handle response being either the data itself or containing a data property
      const premiseData = response.data || response;
      return mapApiResponseToPremise(premiseData);
    } catch (error) {
      console.error(`Error getting premise with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new premise
  createPremise: async (data: CreatePremiseData): Promise<Premise> => {
    try {
      const response = await api.post<PremiseApiResponse>('/auth/premises/', data);
      const premiseData = response.data || response;
      return mapApiResponseToPremise(premiseData);
    } catch (error) {
      console.error('Error creating premise:', error);
      throw error;
    }
  },
  
  // Update a premise
  updatePremise: async (id: string | number, data: Partial<CreatePremiseData>): Promise<Premise> => {
    try {
      const response = await api.put<PremiseApiResponse>(`/auth/premises/${id}/`, data);
      const premiseData = response.data || response;
      return mapApiResponseToPremise(premiseData);
    } catch (error) {
      console.error(`Error updating premise with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a premise
  deletePremise: (id: string | number): Promise<void> => {
    return api.delete(`/auth/premises/${id}/`);
  },
  
  // Get QR code URL for a premise
  getPremiseQrCode: async (id: string | number): Promise<{ qr_code_url: string }> => {
    try {
      const response = await api.get(`/auth/premises/${id}/qr_code/`);
      console.log("QR code raw response:", response);
      
      // Handle different response formats
      if (response && response.qr_code_url) {
        return { qr_code_url: response.qr_code_url };
      }
      
      // Handle case where response has a data property
      if (response && response.data && response.data.qr_code_url) {
        return { qr_code_url: response.data.qr_code_url };
      }
      
      // If the QR code is in the response directly as an object property
      if (typeof response === 'object' && response !== null) {
        // Loop through all properties to find one that might be the QR code URL
        for (const key of Object.keys(response)) {
          if (
            (key.includes('qr') || key.includes('url') || key.includes('image')) && 
            typeof response[key] === 'string' && 
            response[key].length > 0
          ) {
            return { qr_code_url: response[key] };
          }
        }
      }
      
      throw new Error("QR code URL not found in response");
    } catch (error) {
      console.error(`Error getting QR code for premise with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Download QR code image as Blob
  downloadPremiseQrCode: async (id: string | number): Promise<Blob> => {
    try {
      const response = await api.get(`/auth/premises/${id}/download_qr_code/`, { 
        responseType: 'blob',
        headers: {
          'Accept': 'image/png, image/jpeg'
        }
      });
      
      // Handle case where the response is already a Blob
      if (response instanceof Blob) {
        return response;
      }
      
      // Handle case where response has a data property that is a Blob
      if (response && response.data instanceof Blob) {
        return response.data;
      }
      
      throw new Error("QR code image not found in response");
    } catch (error) {
      console.error(`Error downloading QR code for premise with ID ${id}:`, error);
      throw error;
    }
  }
};
