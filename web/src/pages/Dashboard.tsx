import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Users, Calendar, ExternalLink, Copy, Check } from 'lucide-react';
import { Form, FormResponse } from '../types/form';
import { apiService } from '../services/api';
import { Button } from '../presentation/components/ui/core/Button';
import { Card } from '../presentation/components/ui/data-display/Card';

export const Dashboard: React.FC = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);
  const [copiedFormId, setCopiedFormId] = useState<number | null>(null);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setIsLoading(true);
      const formsData = await apiService.getForms();
      setForms(formsData);
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadResponses = async (form: Form) => {
    try {
      setIsLoadingResponses(true);
      setSelectedForm(form);
      const responsesData = await apiService.getFormResponses(form.id);
      setResponses(responsesData);
    } catch (error) {
      console.error('Error loading responses:', error);
    } finally {
      setIsLoadingResponses(false);
    }
  };

  const copyFormUrl = (formId: number) => {
    const url = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(url);
    setCopiedFormId(formId);
    setTimeout(() => setCopiedFormId(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Form Dashboard</h1>
          <p className="text-gray-600">Manage your forms and view responses</p>
        </div>
        <Link to="/builder">
          <Button leftIcon={<Plus className="h-4 w-4" />}>
            Create New Form
          </Button>
        </Link>
      </div>

      {forms.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No forms yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first dynamic form. You can add various field types and collect responses easily.
            </p>
            <Link to="/builder">
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                Create Your First Form
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Forms List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Forms ({forms.length})</h2>
            <div className="space-y-4">
              {forms.map((form) => (
                <Card key={form.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">{form.title}</h3>
                      {form.description && (
                        <p className="text-gray-600 text-sm mb-2">{form.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(form.createdAt)}
                        </span>
                        <span>{form.fields.length} fields</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => loadResponses(form)}
                      leftIcon={<Users className="h-4 w-4" />}
                    >
                      View Responses
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/form/${form.id}`, '_blank')}
                      leftIcon={<ExternalLink className="h-4 w-4" />}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyFormUrl(form.id)}
                      leftIcon={copiedFormId === form.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    >
                      {copiedFormId === form.id ? 'Copied!' : 'Copy Link'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Responses Panel */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {selectedForm ? `Responses for "${selectedForm.title}"` : 'Select a form to view responses'}
            </h2>
            
            {selectedForm ? (
              <Card className="p-4">
                {isLoadingResponses ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading responses...</p>
                  </div>
                ) : responses.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h3>
                    <p className="text-gray-600 mb-4">Share your form link to start collecting responses</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyFormUrl(selectedForm.id)}
                      leftIcon={<Copy className="h-4 w-4" />}
                    >
                      Copy Form Link
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>{responses.length}</strong> response{responses.length !== 1 ? 's' : ''} collected
                      </p>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {responses.map((response) => (
                        <div key={response.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-medium text-gray-900">Phone: {response.phoneNumber}</p>
                              <p className="text-sm text-gray-600">{formatDate(response.submittedAt)}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {Object.entries(response.responseData).map(([fieldId, value]) => {
                              const field = selectedForm.fields.find(f => f.id === fieldId);
                              if (!field) return null;
                              
                              return (
                                <div key={fieldId} className="text-sm">
                                  <span className="font-medium text-gray-700">{field.label}:</span>
                                  <span className="ml-2 text-gray-900">
                                    {Array.isArray(value) ? value.join(', ') : String(value)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="p-8 text-center text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Click "View Responses" on any form to see submitted data</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};