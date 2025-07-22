// Form field types
export type FieldType = 'text' | 'textarea' | 'email' | 'password' | 'number' | 'date' | 'time' | 'select' | 'radio' | 'checkbox' | 'file';

// Multi-language text interface
export interface MultiLanguageText {
  en: string;
  ar: string;
}

// Multi-language form field
export interface FormField {
  id: string;
  type: FieldType;
  label: MultiLanguageText;
  placeholder: MultiLanguageText;
  required: boolean;
  options: MultiLanguageText[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// Multi-language form interface
export interface Form {
  id: number;
  title: MultiLanguageText;
  description?: MultiLanguageText;
  fields: FormField[];
  submitButtonText?: MultiLanguageText;
  heroImageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Form definition for creating/updating (can be single language during creation)
export interface FormDefinition {
  title: string | MultiLanguageText;
  description?: string | MultiLanguageText;
  fields: FormField[];
  submitButtonText?: string | MultiLanguageText;
  heroImageUrl?: string;
}

export interface FormResponse {
  id: number;
  formId: number;
  phoneNumber: string;
  responseData: Record<string, any>;
  language: 'en' | 'ar'; // Track which language was used for submission
  submittedAt: string;
}

export interface FormSubmission {
  formId: number;
  phoneNumber: string;
  responseData: Record<string, any>;
  language: 'en' | 'ar';
}