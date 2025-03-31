
import axios from "axios";
import { toast } from "@/hooks/use-toast";

// Create axios instance with base URL
const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors and token refreshing
api.interceptors.response.use(
  (response) => response.data, // Return just the data part of the response
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh the token
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          // If no refresh token, redirect to login
          window.location.href = "/login";
          return Promise.reject(error);
        }
        
        const response = await axios.post("/api/v1/auth/refresh/", {
          refresh_token: refreshToken
        });
        
        // Store the new tokens
        const { access_token } = response.data;
        localStorage.setItem("access_token", access_token);
        
        // Retry the original request with new token
        originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    
    // For other errors, show toast notification
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         "An unexpected error occurred";
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive"
    });
    
    return Promise.reject(error);
  }
);

export default api;
