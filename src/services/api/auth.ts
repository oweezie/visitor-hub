
import api from "@/lib/axios";

interface SignupData {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  premise_name: string;
  premise_address?: string;
  first_name?: string;
  last_name?: string;
}

interface SigninData {
  username: string;
  password: string;
}

interface AuthResponse {
  refresh: string;
  access: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

interface RefreshTokenData {
  refresh_token: string;
}

interface RefreshTokenResponse {
  access_token: string;
}

export const authApi = {
  signup: (data: SignupData): Promise<AuthResponse> => {
    return api.post('/auth/signup/', data);
  },
  
  signin: (data: SigninData): Promise<AuthResponse> => {
    return api.post('/auth/signin/', data);
  },
  
  refreshToken: (data: RefreshTokenData): Promise<RefreshTokenResponse> => {
    return api.post('/auth/refresh/', data);
  },
  
  logout: (data: RefreshTokenData): Promise<void> => {
    return api.post('/auth/logout/', data);
  }
};
