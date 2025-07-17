import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../presentation/components/ui/core/Button';
import { apiService } from '../services/api';
import { Form, FormResponse } from '../types/form';

export const ResponsesPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (formId) {
      loadFormAndResponses();
    }
  }, [formId]);

  const loadFormAndResponses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = await apiService.getForm(parseInt(formId!));
      const responsesData = await apiService.getFormResponses(parseInt(formId!));
      
      setForm(formData);
      setResponses(responsesData);
    } catch (err) {
      setError('Failed to load form responses');
      console.error('Error loading form and responses:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!form || responses.length === 0) return;

    // Create CSV headers
    const headers = ['Response ID', 'Phone Number', 'Submitted At'];
    form.fields.forEach(field => {
      headers.push(field.label);
    });

    // Create CSV rows
    const csvRows = [headers.join(',')];
    
    responses.forEach(response => {
      const row = [
        response.id.toString(),
        `"${response.phoneNumber}"`,
        `"${new Date(response.submittedAt).toLocaleString()}"`
      ];
      
      form.fields.forEach(field => {
        const value = response.responseData[field.id] || '';
        const cellValue = Array.isArray(value) ? value.join('; ') : String(value);
        row.push(`"${cellValue.replace(/"/g, '""')}"`);
      });
      
      csvRows.push(row.join(','));
    });

    // Download CSV
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${form.title.replace(/[^a-zA-Z0-9]/g, '_')}_responses.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading responses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Responses</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadFormAndResponses} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Form Not Found</h2>
          <p className="text-gray-600 mb-4">The form you're looking for doesn't exist.</p>
          <Link to="/">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-2 inline-block">
                  ← Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
                {form.description && (
                  <p className="text-gray-600 mt-1">{form.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Responses</p>
                  <p className="text-2xl font-bold text-blue-600">{responses.length}</p>
                </div>
                {responses.length > 0 && (
                  <Button
                    onClick={exportToCSV}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="8" y1="13" x2="16" y2="13"/>
                      <line x1="8" y1="17" x2="16" y2="17"/>
                    </svg>
                    Export CSV
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Responses */}
        {responses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 6h-2l-1-2H6L5 6H3c-.55 0-1 .45-1 1s.45 1 1 1h1v11c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8h1c.55 0 1-.45 1-1s-.45-1-1-1z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Responses Yet</h3>
            <p className="text-gray-600 mb-4">
              This form hasn't received any responses yet. Share the form link to start collecting responses.
            </p>
            <Button
              onClick={() => window.open(`/form/${form.id}`, '_blank')}
              variant="outline"
              className="border-gray-300 text-gray-700"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Preview Form
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {responses.map((response, index) => (
              <div key={response.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Response ID: {response.id}</p>
                        <p className="font-medium text-gray-900">Phone: {response.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Submitted</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(response.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {form.fields.map((field) => {
                      const value = response.responseData[field.id];
                      const displayValue = Array.isArray(value) ? value.join(', ') : String(value || 'Not answered');
                      
                      return (
                        <div key={field.id} className="border-l-4 border-blue-200 pl-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          <div className="text-sm text-gray-900 bg-gray-50 rounded-md p-3 min-h-[2.5rem] flex items-center">
                            {field.type === 'textarea' ? (
                              <p className="whitespace-pre-wrap">{displayValue}</p>
                            ) : (
                              <p className="truncate">{displayValue}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};