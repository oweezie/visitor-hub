
import api from "@/lib/axios";

export interface Visitor {
  id: number;
  first_name: string;
  second_name: string;
  phone_number: string;
  person_visiting: string;
  room_number: string;
  reason: string;
  premise: number;
  id_photo?: string | File;
  ip_address?: string;
  status?: 'pending' | 'signed_in' | 'rejected' | 'signed_out';
  submitted_at?: string;
  sign_in_time?: string;
  sign_out_time?: string;
  rejected_at?: string;
}

interface VisitorSignInData {
  premise: number;
  first_name: string;
  second_name: string;
  phone_number: string;
  person_visiting: string;
  room_number: string;
  reason: string;
  id_photo?: File | string;
}

interface VisitorSignOutData {
  premise: number;
  sign_out_time?: string;
}

interface ApproveVisitorData {
  sign_in_time?: string;
}

interface RejectVisitorData {
  rejected_at?: string;
}

export const visitorsApi = {
  // Get all visitors (admin only)
  getAllVisitors: (params?: { status?: string; premise_id?: number }): Promise<Visitor[]> => {
    return api.get('/visitors/', { params });
  },
  
  // Sign in a visitor (public)
  visitorSignIn: (data: VisitorSignInData): Promise<Visitor> => {
    // Use FormData to handle file upload
    const formData = new FormData();
    
    // Append all the data to the FormData object
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    
    return api.post('/visitors/signin/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Approve a visitor (admin only)
  approveVisitor: (visitorId: number, data: ApproveVisitorData = {}): Promise<Visitor> => {
    return api.post(`/visitors/${visitorId}/approve/`, data);
  },
  
  // Reject a visitor (admin only)
  rejectVisitor: (visitorId: number, data: RejectVisitorData = {}): Promise<Visitor> => {
    return api.post(`/visitors/${visitorId}/reject/`, data);
  },
  
  // Sign out a visitor (public, identified by IP)
  visitorSignOut: (data: VisitorSignOutData): Promise<Visitor> => {
    return api.post('/visitors/signout/', data);
  },
  
  // Get a specific visitor (admin only)
  getVisitorById: (visitorId: number): Promise<Visitor> => {
    return api.get(`/visitors/${visitorId}/`);
  }
};
