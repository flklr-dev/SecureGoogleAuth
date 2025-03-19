import axios, { AxiosInstance } from 'axios';

class Api {
  private instance: AxiosInstance;

  constructor() {
    // Create Axios instance with secure defaults
    this.instance = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    
    // Add request interceptor for logging (in development only)
    if (__DEV__) {
      this.instance.interceptors.request.use(
        config => {
          console.log('Request:', config.method, config.url);
          return config;
        },
        error => {
          console.error('Request error:', error);
          return Promise.reject(error);
        }
      );
    }
  }

  // Set auth token for Firebase or other services if needed
  setAuthToken(token: string | null): void {
    if (token) {
      this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.instance.defaults.headers.common['Authorization'];
    }
  }

  // If you later decide to add an API, these methods will be ready
  async get<T>(endpoint: string, params = {}): Promise<T> {
    const response = await this.instance.get<T>(endpoint, { params });
    return response.data;
  }

  async post<T>(endpoint: string, data = {}): Promise<T> {
    const response = await this.instance.post<T>(endpoint, data);
    return response.data;
  }
}

// Singleton instance
const api = new Api();
export default api; 