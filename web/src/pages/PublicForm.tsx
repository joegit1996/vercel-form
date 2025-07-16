import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { Form, FormField, FormSubmission } from '../types/form';
import { Button } from '../presentation/components/ui/core/Button';

export const PublicForm: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (formId) {
      loadForm(parseInt(formId));
    }
  }, [formId]);

  const loadForm = async (id: number) => {
    try {
      setIsLoading(true);
      const formData = await apiService.getForm(id);
      setForm(formData);
    } catch (err) {
      setError('Form not found or unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      return false;
    }

    if (!form) return false;

    for (const field of form.fields) {
      if (field.required && (!formData[field.id] || formData[field.id] === '')) {
        setError(`${field.label} is required`);
        return false;
      }
    }

    setError(null);
    return true;
  };

  const submitForm = async () => {
    if (!validateForm() || !form) return;

    try {
      setIsSubmitting(true);
      const submission: FormSubmission = {
        formId: form.id,
        phoneNumber: phoneNumber.trim(),
        responseData: formData
      };

      await apiService.submitForm(submission);
      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const baseClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-500";
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
        return (
          <input
            type={field.type}
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={baseClasses}
            required={field.required}
          />
        );
        
      case 'textarea':
        return (
          <textarea
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`${baseClasses} min-h-24 resize-y`}
            required={field.required}
            rows={4}
          />
        );
        
      case 'number':
        return (
          <input
            type="number"
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={baseClasses}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );
        
      case 'date':
        return (
          <input
            type="date"
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseClasses}
            required={field.required}
          />
        );
        
      case 'time':
        return (
          <input
            type="time"
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseClasses}
            required={field.required}
          />
        );
        
      case 'select':
        return (
          <select
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseClasses}
            required={field.required}
          >
            <option value="">{field.placeholder || 'Select an option'}</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
        
      case 'radio':
        return (
          <div className="space-y-3">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={formData[field.id] === option}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  required={field.required}
                />
                <span className="ml-3 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="space-y-3">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="checkbox"
                  value={option}
                  checked={(formData[field.id] || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = formData[field.id] || [];
                    if (e.target.checked) {
                      handleFieldChange(field.id, [...currentValues, option]);
                    } else {
                      handleFieldChange(field.id, currentValues.filter((v: string) => v !== option));
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
        
      case 'file':
        return (
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              handleFieldChange(field.id, file?.name || '');
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            required={field.required}
          />
        );
        
      default:
        return (
          <input
            type="text"
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={baseClasses}
            required={field.required}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-lg mx-auto px-6">
        {isLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading form...</p>
          </div>
        )}

        {error && (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-12 text-center">
            <div className="h-8 w-8 mx-auto mb-4 text-red-600 flex items-center justify-center">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {isSubmitted && !error && (
          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-12 text-center">
            <div className="h-12 w-12 mx-auto mb-6 text-green-600 flex items-center justify-center">
              <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Thank you!</h2>
            <p className="text-gray-600 mb-8">Your form has been submitted successfully.</p>
            
            {/* 4Sale Branding */}
            <div className="text-center mt-8 pt-6 border-t border-gray-100">
              <img 
                src="/4sale-logo.png" 
                alt="4Sale" 
                className="h-20 mx-auto mb-3"
              />
              <p className="text-sm text-gray-500">Powered by 4Sale</p>
            </div>
          </div>
        )}

        {form && !isSubmitted && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">{form.title}</h1>
              {form.description && (
                <p className="text-gray-600 leading-relaxed">{form.description}</p>
              )}
            </div>

            {/* Phone Number Field - Always Required */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-500"
                placeholder="+1 (555) 123-4567"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Required for our agent to contact you</p>
            </div>

            {/* Dynamic Form Fields */}
            {form.fields.map((field) => (
              <div key={field.id} className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}

            <div className="pt-4">
              <Button
                onClick={submitForm}
                loading={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium border-0 transition-colors"
                size="lg"
              >
                {form.submitButtonText || 'Submit'}
              </Button>
            </div>

            {/* 4Sale Branding */}
            <div className="text-center mt-8 pt-6 border-t border-gray-100">
              <img 
                src="/4sale-logo.png" 
                alt="4Sale" 
                className="h-20 mx-auto mb-3"
              />
              <p className="text-sm text-gray-500">Powered by 4Sale</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};