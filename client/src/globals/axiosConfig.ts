import axios from 'axios';

// Define the error response type
interface ErrorResponse {
  data: any;
  status: number;
}

// Base configuration
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/weavebox/api/v1', // Your backend API URL
  timeout: 10000, // Request timeout in milliseconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage if it exists
    const token = localStorage.getItem('auth_token');
    
    // If token exists, add it to the headers
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🚀 REQUEST: [${config.method?.toUpperCase()}] ${config.url}`, config);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ RESPONSE:', response.status, response.data);
    return response;
  },
  (error) => {
    // Extract response and status
    const response = error.response as ErrorResponse | undefined;
    const status = response?.status;

    // Handle different error statuses
    switch (status) {
      case 400:
        console.error('❌ Bad Request:', response?.data);
        // You could trigger a notification or store error in state management
        break;
      case 401:
        console.error('❌ Unauthorized:', response?.data);
        // Token expired or not valid - you could redirect to login
        localStorage.removeItem('auth_token');
        // Example redirect: window.location.href = '/login';
        break;
      case 403:
        console.error('❌ Forbidden:', response?.data);
        // User doesn't have permission
        break;
      case 404:
        console.error('❌ Not Found:', response?.data);
        // Resource not found
        break;
      case 500:
      case 502:
      case 503:
        console.error('❌ Server Error:', response?.data);
        // Server-side error
        break;
      default:
        // Network errors, timeout, etc.
        if (!response) {
          console.error('❌ Network Error: No response from server');
        } else {
          console.error(`❌ Error ${status}:`, response.data);
        }
        break;
    }

    return Promise.reject(error);
  }
);

// Helper methods for making requests
const API = {
  // GET request
  get: async <T>(url: string, params?: object): Promise<T> => {
    const response = await apiClient.get<T>(url, { params });
    return response.data;
  },
  
  // POST request
  post: async <T>(url: string, data: object): Promise<T> => {
    const response = await apiClient.post<T>(url, data);
    return response.data;
  },
  
  // PUT request
  put: async <T>(url: string, data: object): Promise<T> => {
    const response = await apiClient.put<T>(url, data);
    return response.data;
  },
  
  // DELETE request
  delete: async <T>(url: string): Promise<T> => {
    const response = await apiClient.delete<T>(url);
    return response.data;
  },
  
  // PATCH request
  patch: async <T>(url: string, data: object): Promise<T> => {
    const response = await apiClient.patch<T>(url, data);
    return response.data;
  }
};

export default API; 