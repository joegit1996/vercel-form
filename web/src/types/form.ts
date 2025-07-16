// Form field types
export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'password' 
  | 'email' 
  | 'number' 
  | 'date' 
  | 'time' 
  | 'checkbox' 
  | 'radio' 
  | 'select' 
  | 'file';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For radio, select, checkbox
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface Form {
  id: number;
  title: string;
  description?: string;
  fields: FormField[];
  submitButtonText?: string;
  heroImageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FormResponse {
  id: number;
  formId: number;
  phoneNumber: string;
  responseData: Record<string, any>;
  submittedAt: string;
}

export interface FormDefinition {
  title: string;
  description?: string;
  fields: FormField[];
  submitButtonText?: string;
  heroImageUrl?: string;
}

export interface FormSubmission {
  formId: number;
  phoneNumber: string;
  responseData: Record<string, any>;
}