import { Form, FormDefinition, FormResponse, FormSubmission } from '../types/form';

const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
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