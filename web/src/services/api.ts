import { Form, FormDefinition, FormResponse, FormSubmission } from '../types/form';

// Use the backend URL based on current window location
const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:5000/api`;

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

  async getForms(): Promise<Form[]> {
    return this.request<Form[]>('/forms');
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
}

export const apiService = new ApiService();