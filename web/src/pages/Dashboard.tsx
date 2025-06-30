import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, ExternalLink, Calendar, FileText, MessageSquare, Copy, Check } from 'lucide-react';
import { Button } from '../presentation/components/ui/core/Button/Button';
import { apiService } from '../services/api';
import { Form, FormResponse } from '../types/form';

export const Dashboard: React.FC = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [copiedFormId, setCopiedFormId] = useState<number | null>(null);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      const data = await apiService.getForms();
      setForms(data);
    } catch (err) {
      setError('Failed to load forms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadResponses = async (form: Form) => {
    try {
      setLoadingResponses(true);
      const data = await apiService.getFormResponses(form.id);
      setResponses(data);
      setSelectedForm(form);
    } catch (err) {
      console.error('Failed to load responses:', err);
    } finally {
      setLoadingResponses(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPublicUrl = (formId: number) => {
    return `${window.location.origin}/form/${formId}`;
  };

  const copyToClipboard = (formId: number) => {
    const url = getPublicUrl(formId);
    navigator.clipboard.writeText(url);
    setCopiedFormId(formId);
    setTimeout(() => setCopiedFormId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading forms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={loadForms} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Form Dashboard</h1>
          <p className="text-gray-600 text-lg">Manage your forms and view responses</p>
        </div>

        {/* Create New Form Button */}
        <div className="text-center mb-12">
          <Link to="/form-builder">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium border-0"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Form
            </Button>
          </Link>
        </div>

        {forms.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
              <FileText className="mx-auto h-16 w-16 text-gray-300 mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No forms yet</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first form.</p>
              <Link to="/form-builder">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium border-0"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Form
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Forms List */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Forms</h2>
              <div className="space-y-6">
                {forms.map((form) => (
                  <div
                    key={form.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{form.title}</h3>
                      {form.description && (
                        <p className="text-gray-600 leading-relaxed">{form.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(form.createdAt)}
                        </span>
                        <span>{form.fields.length} fields</span>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        form.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {form.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Public URL:</p>
                      <p className="text-sm font-mono text-gray-700 break-all">{getPublicUrl(form.id)}</p>
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(form.id)}
                        className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        {copiedFormId === form.id ? (
                          <Check className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        {copiedFormId === form.id ? 'Copied!' : 'Copy Link'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadResponses(form)}
                        className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Responses
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Responses Panel */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Form Responses</h2>
              
              {!selectedForm ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <MessageSquare className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-600">
                    Select a form to view its responses
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {selectedForm.title}
                    </h3>
                    <p className="text-gray-600">
                      {responses.length} response{responses.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {loadingResponses ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading responses...</p>
                      </div>
                    ) : responses.length === 0 ? (
                      <div className="p-8 text-center">
                        <p className="text-gray-600">No responses yet</p>
                      </div>
                    ) : (
                      responses.map((response) => (
                        <div key={response.id} className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <span className="font-semibold text-gray-900">
                              {response.phoneNumber}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(response.submittedAt)}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {Object.entries(response.responseData).map(([fieldId, value]) => {
                              const field = selectedForm.fields.find(f => f.id === fieldId);
                              return (
                                <div key={fieldId} className="text-sm">
                                  <span className="font-medium text-gray-700">
                                    {field?.label || fieldId}:
                                  </span>
                                  <span className="ml-2 text-gray-600">
                                    {Array.isArray(value) ? value.join(', ') : String(value)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};