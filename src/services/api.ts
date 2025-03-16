import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { sslPinning } from 'react-native-ssl-pinning';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string = 'https://your-api-endpoint.com';
  
  constructor() {
    // Create axios instance with default config
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    
    // Configure request interceptor for certificate pinning
    this.api.interceptors.request.use(async (config) => {
      // Implement certificate pinning
      try {
        const modifiedConfig = { ...config };
        
        // If request is to our domain, apply SSL pinning
        if (config.url?.startsWith(this.baseURL)) {
          const sslResponse = await sslPinning.fetch(
            config.url,
            {
              method: config.method?.toUpperCase() || 'GET',
              headers: config.headers as Record<string, string>,
              body: config.data ? JSON.stringify(config.data) : undefined,
              timeoutInterval: config.timeout,
              // The hash values should be obtained from your backend certificates
              sslPinning: {
                certs: ['sha256/YOUR_CERT_HASH_1', 'sha256/YOUR_CERT_HASH_2']
              }
            }
          );
          
          // Handle response here or return modified config
          return modifiedConfig;
        }
        
        return modifiedConfig;
      } catch (error) {
        console.error('SSL Pinning Error:', error);
        throw new Error('Security error: Certificate validation failed');
      }
    });
  }
  
  // Set auth token for all requests
  setAuthToken(token: string): void {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  // Clear auth token
  clearAuthToken(): void {
    delete this.api.defaults.headers.common['Authorization'];
  }
  
  // API methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }
  
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }
  
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }
  
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }
}

export default new ApiService(); 