import { APIRequestContext } from '@playwright/test';

export class ApiClient {
  private baseURL: string;

  constructor(private request: APIRequestContext, baseURL?: string) {
    this.baseURL = baseURL || 'http://localhost:3000';
  }

  private getFullUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseURL}${normalizedEndpoint}`;
  }

  async requestRaw<T = any>(method: string, endpoint: string, data?: any): Promise<{status: number, body: T, isJson: boolean}> {
    const url = this.getFullUrl(endpoint);
    console.log(`${method} ${url}`);
    
    const response = await this.request.fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      data: data ? JSON.stringify(data) : undefined,
    });
    
    const text = await response.text();
    let body: any = text;
    let isJson = false;
    
    try {
      body = JSON.parse(text);
      isJson = true;
    } catch {

    }
    
    return {
      status: response.status(),
      body: body as T,
      isJson
    };
  }

  async get<T = any>(endpoint: string): Promise<T> {
    const result = await this.requestRaw<T>('GET', endpoint);
    
    if (result.status >= 400) {
      console.error(`GET ${endpoint} failed:`, result.body);
      throw new Error(`HTTP ${result.status}: ${JSON.stringify(result.body)}`);
    }
    
    return result.body;
  }

  async post<T = any>(endpoint: string, data: any): Promise<T> {
    const result = await this.requestRaw<T>('POST', endpoint, data);
    
    if (result.status >= 400) {
      console.error(`POST ${endpoint} failed:`, result.body);
      throw new Error(`HTTP ${result.status}: ${JSON.stringify(result.body)}`);
    }
    
    return result.body;
  }

  async put<T = any>(endpoint: string, data: any): Promise<T> {
    const result = await this.requestRaw<T>('PUT', endpoint, data);
    
    if (result.status >= 400) {
      console.error(`PUT ${endpoint} failed:`, result.body);
      throw new Error(`HTTP ${result.status}: ${JSON.stringify(result.body)}`);
    }
    
    return result.body;
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    const result = await this.requestRaw<T>('DELETE', endpoint);
    
    if (result.status >= 400) {
      console.error(`DELETE ${endpoint} failed:`, result.body);
      throw new Error(`HTTP ${result.status}: ${JSON.stringify(result.body)}`);
    }
    
    return result.body;
  }
}