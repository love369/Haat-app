
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

export interface ApiRequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
}

class ApiService {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  setAuthorizationToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  removeAuthorizationToken() {
    delete this.defaultHeaders['Authorization'];
  }

  private async request<T>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      params = {},
      data,
      timeout = 100000,
    } = config;

    // Build URL with query parameters
    const url = new URL(`${this.baseURL}${endpoint}`);
    Object.keys(params).forEach(key => 
      params[key] !== undefined && params[key] !== null && 
      url.searchParams.append(key, params[key])
    );

    // Prepare request configuration
    const requestHeaders = { ...this.defaultHeaders, ...headers };
    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (data && method !== 'GET' && method !== 'HEAD') {
      requestConfig.body = JSON.stringify(data);
    }

    // Create timeout abort controller
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), timeout);
    requestConfig.signal = abortController.signal;

    try {
     
      const response = await fetch(url.toString(), requestConfig);
      console.log("responseresponse:::",response)
      clearTimeout(timeoutId);

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw {
          message: response.statusText || 'Request failed',
          status: response.status,
          data: responseData,
        };
      }

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw { message: 'Request timeout' };
      }
      
      throw error;
    }
  }

  // Convenience methods
  get<T>(endpoint: string, params?: Record<string, any>, config?: Omit<ApiRequestConfig, 'params' | 'method' | 'data'>) {
    return this.request<T>(endpoint, { ...config, method: 'GET', params });
  }

  post<T>(endpoint: string, data?: any, config?: Omit<ApiRequestConfig, 'data' | 'method'>) {
    return this.request<T>(endpoint, { ...config, method: 'POST', data });
  }

  put<T>(endpoint: string, data?: any, config?: Omit<ApiRequestConfig, 'data' | 'method'>) {
    return this.request<T>(endpoint, { ...config, method: 'PUT', data });
  }

  delete<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>) {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// Create a singleton instance with your API base URL
export const apiService = new ApiService('https://user-new-app-staging.internal.haat.delivery');