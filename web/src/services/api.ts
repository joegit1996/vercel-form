import { Form, FormDefinition, FormResponse, FormSubmission } from '../types/form';

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Use environment variable for API URL in production, fallback to proxy for development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      console.log('Making API request to:', url);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API response data:', data);
      return data;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  }

  // Form management
  async createForm(formData: FormDefinition): Promise<Form> {
    return this.request<Form>('/forms', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }

  async getForms(page: number = 1, pageSize: number = 5): Promise<PaginatedResponse<Form>> {
    return this.request<PaginatedResponse<Form>>(`/forms?page=${page}&pageSize=${pageSize}`);
  }

  async getForm(id: number): Promise<Form> {
    return this.request<Form>(`/forms/${id}`);
  }

  // Form submissions
  async submitForm(submission: FormSubmission): Promise<FormResponse> {
    return this.request<FormResponse>('/submit', {
      method: 'POST',
      body: JSON.stringify(submission),
    });
  }

  async getFormResponses(formId: number): Promise<FormResponse[]> {
    return this.request<FormResponse[]>(`/forms/${formId}/responses`);
  }

  async updateForm(formId: number, formData: FormDefinition): Promise<Form> {
    return this.request<Form>(`/forms/${formId}`, {
      method: 'PUT',
      body: JSON.stringify(formData)
    });
  }

  async deleteForm(formId: number): Promise<void> {
    await this.request<void>(`/forms/${formId}`, {
      method: 'DELETE'
    });
  }
}

export const apiService = new ApiService();