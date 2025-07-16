import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../presentation/components/ui/core/Button';
import { apiService } from '../services/api';
import { FormField, FieldType, FormDefinition } from '../types/form';

const FIELD_TYPES: { value: FieldType; label: string; description: string }[] = [
  { value: 'text', label: 'Text', description: 'Single line text input' },
  { value: 'textarea', label: 'Textarea', description: 'Multi-line text input' },
  { value: 'email', label: 'Email', description: 'Email address input' },
  { value: 'password', label: 'Password', description: 'Password input' },
  { value: 'number', label: 'Number', description: 'Numeric input' },
  { value: 'date', label: 'Date', description: 'Date picker' },
  { value: 'time', label: 'Time', description: 'Time picker' },
  { value: 'select', label: 'Select', description: 'Dropdown selection' },
  { value: 'radio', label: 'Radio', description: 'Single choice from options' },
  { value: 'checkbox', label: 'Checkbox', description: 'Multiple choices' },
  { value: 'file', label: 'File', description: 'File upload' }
];

export const FormBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { formId } = useParams<{ formId: string }>();
  const isEditing = !!formId;
  
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [submitButtonText, setSubmitButtonText] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [fields, setFields] = useState<FormField[]>([]);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && formId) {
      loadForm(parseInt(formId));
    }
  }, [formId, isEditing]);

  const loadForm = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const form = await apiService.getForm(id);
      setFormTitle(form.title);
      setFormDescription(form.description || '');
      setSubmitButtonText(form.submitButtonText || '');
      setHeroImageUrl(form.heroImageUrl || '');
      setFields(form.fields);
    } catch (err) {
      setError('Failed to load form');
      console.error('Error loading form:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFieldId = () => {
    return `field_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  };

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: generateFieldId(),
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      placeholder: '',
      required: false,
      options: ['select', 'radio', 'checkbox'].includes(type) ? ['Option 1', 'Option 2'] : undefined
    };
    setFields([...fields, newField]);
    setEditingField(newField);
  };

  const updateField = (updatedField: FormField) => {
    setFields(fields.map(field => field.id === updatedField.id ? updatedField : field));
    setEditingField(null);
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId));
    if (editingField?.id === fieldId) {
      setEditingField(null);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setIsUploadingImage(true);
    setError(null);

    try {
      // For now, create a local URL until we implement server upload
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setHeroImageUrl(e.target.result as string);
          setHeroImageFile(file);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const index = fields.findIndex(field => field.id === fieldId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const newFields = [...fields];
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setFields(newFields);
  };

  const saveForm = async () => {
    if (!formTitle.trim()) {
      setError('Form title is required');
      return;
    }

    if (fields.length === 0) {
      setError('At least one field is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const formData: FormDefinition = {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        fields,
        submitButtonText: submitButtonText.trim() || undefined,
        heroImageUrl: heroImageUrl.trim() || undefined
      };

      if (isEditing && formId) {
        await apiService.updateForm(parseInt(formId), formData);
      } else {
        await apiService.createForm(formData);
      }
      
      navigate('/');
    } catch (err) {
      setError(`Failed to ${isEditing ? 'update' : 'create'} form. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFieldEditor = (field: FormField) => (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Field Label *
          </label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => setEditingField({ ...field, label: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Enter field label"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Placeholder Text
          </label>
          <input
            type="text"
            value={field.placeholder || ''}
            onChange={(e) => setEditingField({ ...field, placeholder: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Enter placeholder text"
          />
        </div>
      </div>

      {(['select', 'radio', 'checkbox'].includes(field.type)) && (
        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Options
          </label>
          <div className="space-y-2">
            {(field.options || []).map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(field.options || [])];
                    newOptions[index] = e.target.value;
                    setEditingField({ ...field, options: newOptions });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder={`Option ${index + 1}`}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newOptions = field.options?.filter((_, i) => i !== index);
                    setEditingField({ ...field, options: newOptions });
                  }}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newOptions = [...(field.options || []), ''];
                setEditingField({ ...field, options: newOptions });
              }}
              className="border-gray-300 text-gray-700"
            >
              Add Option
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center">
        <input
          type="checkbox"
          id={`required-${field.id}`}
          checked={field.required}
          onChange={(e) => setEditingField({ ...field, required: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor={`required-${field.id}`} className="ml-3 text-sm font-medium text-gray-700">
          Required field
        </label>
      </div>

      <div className="mt-6 flex gap-3">
        <Button
          onClick={() => updateField(field)}
          className="bg-blue-600 hover:bg-blue-700 text-white border-0"
        >
          Save Changes
        </Button>
        <Button
          variant="outline"
          onClick={() => setEditingField(null)}
          className="border-gray-300 text-gray-700"
        >
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {isEditing ? 'Edit Form' : 'Create New Form'}
          </h1>
          <p className="text-gray-600 text-lg">
            {isEditing ? 'Update your form with new fields and settings' : 'Build your custom form with various field types'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Configuration */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Form Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Form Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Form Title *
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter form title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-24 resize-y"
                    placeholder="Tell users what this form is for"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Submit Button Text
                  </label>
                  <input
                    type="text"
                    value={submitButtonText}
                    onChange={(e) => setSubmitButtonText(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Submit (default)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Hero Banner Image
                  </label>
                  <div className="space-y-3">
                    {/* File Upload */}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        disabled={isUploadingImage}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Upload an image file (max 5MB). Recommended size: 1200x675px (16:9 aspect ratio)
                      </p>
                    </div>

                    {/* URL Input */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-2 text-gray-500">or enter URL</span>
                      </div>
                    </div>

                    <input
                      type="url"
                      value={heroImageUrl}
                      onChange={(e) => setHeroImageUrl(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="https://example.com/banner.jpg"
                      disabled={isUploadingImage}
                    />
                  </div>

                  {isUploadingImage && (
                    <div className="mt-3 text-sm text-blue-600">
                      Uploading image...
                    </div>
                  )}

                  {heroImageUrl && !isUploadingImage && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-700 mb-2">Preview:</p>
                      <div className="relative">
                        <img 
                          src={heroImageUrl} 
                          alt="Hero banner preview" 
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <button
                          onClick={() => {
                            setHeroImageUrl('');
                            setHeroImageFile(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fields Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Form Fields</h2>
                <span className="text-sm text-gray-500">{fields.length} field{fields.length !== 1 ? 's' : ''}</span>
              </div>

              {fields.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No fields added yet</p>
                  <p className="text-sm text-gray-400">Add fields from the panel on the right</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{field.label}</h3>
                          <p className="text-sm text-gray-500">
                            {field.type} • {field.required ? 'Required' : 'Optional'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveField(field.id, 'up')}
                            disabled={index === 0}
                            className="border-gray-300 text-gray-700"
                          >
                            ↑
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveField(field.id, 'down')}
                            disabled={index === fields.length - 1}
                            className="border-gray-300 text-gray-700"
                          >
                            ↓
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingField(field)}
                            className="border-gray-300 text-gray-700"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeField(field.id)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {editingField && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Field</h3>
                  {renderFieldEditor(editingField)}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={saveForm}
                  loading={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-8"
                >
                  {isEditing ? 'Update Form' : 'Save Form'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="border-gray-300 text-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>

          {/* Field Types Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Fields</h3>
              
              <div className="grid gap-2">
                {FIELD_TYPES.map((fieldType) => (
                  <Button
                    key={fieldType.value}
                    variant="outline"
                    onClick={() => addField(fieldType.value)}
                    className="justify-start text-left p-3 h-auto border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium">{fieldType.label}</div>
                      <div className="text-xs text-gray-500">{fieldType.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Preview</h3>
              <p className="text-sm text-blue-700 mb-4">
                All forms automatically include a phone number field for agent contact.
              </p>
              <Button
                onClick={() => window.open('/form/preview', '_blank')}
                variant="outline"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                Preview Form
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};