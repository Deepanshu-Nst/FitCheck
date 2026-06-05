const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data.message || `Request failed with status ${response.status}`;
      throw new ApiError(message, response.status, data.errors);
    }

    return data;
  }

  get<T>(endpoint: string, token?: string) {
    return this.request<T>(endpoint, { method: 'GET' }, token);
  }

  post<T>(endpoint: string, body: unknown, token?: string) {
    return this.request<T>(
      endpoint,
      { method: 'POST', body: JSON.stringify(body) },
      token
    );
  }

  put<T>(endpoint: string, body: unknown, token?: string) {
    return this.request<T>(
      endpoint,
      { method: 'PUT', body: JSON.stringify(body) },
      token
    );
  }

  patch<T>(endpoint: string, body: unknown, token?: string) {
    return this.request<T>(
      endpoint,
      { method: 'PATCH', body: JSON.stringify(body) },
      token
    );
  }

  /** Multipart form upload (for image + metadata) */
  async upload<T>(endpoint: string, formData: FormData, token?: string): Promise<T> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new ApiError(data.message || 'Upload failed', response.status, data.errors);
    }

    return data;
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
