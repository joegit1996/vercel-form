import React, { useState } from 'react';
import { Plus, Save, Eye, Trash2, GripVertical, Sparkles, Settings, Search, Type, Hash, Calendar, Clock, CheckSquare, Circle, ChevronDown, Upload, Lock, Mail, FileText } from 'lucide-react';
import { FormField, FieldType, FormDefinition } from '../types/form';
import { apiService } from '../services/api';

const FIELD_TYPES = [
  {
    category: 'Text Fields',
    fields: [
      { value: 'text' as FieldType, label: 'Text', description: 'Single line text input', icon: Type, color: 'text-blue-600' },
      { value: 'textarea' as FieldType, label: 'Textarea', description: 'Multi-line text input', icon: FileText, color: 'text-blue-600' },
      { value: 'password' as FieldType, label: 'Password', description: 'Password input field', icon: Lock, color: 'text-red-600' },
      { value: 'email' as FieldType, label: 'Email', description: 'Email address field', icon: Mail, color: 'text-green-600' },
    ]
  },
  {
    category: 'Number & Date',
    fields: [
      { value: 'number' as FieldType, label: 'Number', description: 'Numeric input field', icon: Hash, color: 'text-purple-600' },
      { value: 'date' as FieldType, label: 'Date', description: 'Date picker', icon: Calendar, color: 'text-orange-600' },
      { value: 'time' as FieldType, label: 'Time', description: 'Time picker', icon: Clock, color: 'text-orange-600' },
    ]
  },
  {
    category: 'Selection Fields',
    fields: [
      { value: 'checkbox' as FieldType, label: 'Checkbox', description: 'Multiple choice checkboxes', icon: CheckSquare, color: 'text-indigo-600' },
      { value: 'radio' as FieldType, label: 'Radio', description: 'Single choice radio buttons', icon: Circle, color: 'text-indigo-600' },
      { value: 'select' as FieldType, label: 'Select', description: 'Dropdown selection', icon: ChevronDown, color: 'text-indigo-600' },
    ]
  },
  {
    category: 'Special Fields',
    fields: [
      { value: 'file' as FieldType, label: 'File Upload', description: 'File upload field', icon: Upload, color: 'text-gray-600' },
    ]
  }
];

export const FormBuilder: React.FC = () => {
  const [form, setForm] = useState<FormDefinition>({
    title: '',
    description: '',
    fields: [],
    submitButtonText: 'Submit',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [savedFormId, setSavedFormId] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showFieldSelector, setShowFieldSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const generateFieldId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const getAllFields = () => FIELD_TYPES.flatMap(category => category.fields);

  const getFilteredFields = () => {
    const allFields = getAllFields();
    if (!searchTerm) return allFields;
    return allFields.filter(field => 
      field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const addField = (type: FieldType) => {
    const fieldDefinition = getAllFields().find(field => field.value === type);
    const newField: FormField = {
      id: generateFieldId(),
      type,
      label: `${fieldDefinition?.label} Field`,
      placeholder: '',
      required: false,
      options: ['radio', 'select', 'checkbox'].includes(type) ? ['Option 1'] : undefined,
    };

    setForm(prev => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
    setShowFieldSelector(false);
    setSearchTerm('');
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    }));
  };

  const removeField = (fieldId: string) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId),
    }));
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    setForm(prev => {
      const fields = [...prev.fields];
      const currentIndex = fields.findIndex(field => field.id === fieldId);
      
      if (currentIndex === -1) return prev;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (newIndex < 0 || newIndex >= fields.length) return prev;
      
      [fields[currentIndex], fields[newIndex]] = [fields[newIndex], fields[currentIndex]];
      
      return { ...prev, fields };
    });
  };

  const saveForm = async () => {
    if (!form.title.trim()) {
      alert('Please enter a form title');
      return;
    }

    setIsLoading(true);
    try {
      const savedForm = await apiService.createForm(form);
      setSavedFormId(savedForm.id);
      alert('Form saved successfully!');
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Error saving form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addOption = (fieldId: string) => {
    const field = form.fields.find(f => f.id === fieldId);
    if (field && field.options) {
      updateField(fieldId, {
        options: [...field.options, `Option ${field.options.length + 1}`]
      });
    }
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = form.fields.find(f => f.id === fieldId);
    if (field && field.options) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateField(fieldId, { options: newOptions });
    }
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = form.fields.find(f => f.id === fieldId);
    if (field && field.options && field.options.length > 1) {
      const newOptions = field.options.filter((_, index) => index !== optionIndex);
      updateField(fieldId, { options: newOptions });
    }
  };

  const renderFieldEditor = (field: FormField) => (
    <div key={field.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
            <span className="text-sm">{FIELD_TYPES.find(ft => ft.value === field.type)?.icon}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{FIELD_TYPES.find(ft => ft.value === field.type)?.label} Field</h3>
            <p className="text-sm text-gray-500">{FIELD_TYPES.find(ft => ft.value === field.type)?.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => moveField(field.id, 'up')}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Move up"
          >
            <GripVertical size={16} />
          </button>
          <button
            onClick={() => removeField(field.id)}
            className="p-1 text-red-400 hover:text-red-600 transition-colors"
            title="Remove field"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter field label"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Placeholder</label>
            <input
              type="text"
              value={field.placeholder || ''}
              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter placeholder text"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`required-${field.id}`}
            checked={field.required}
            onChange={(e) => updateField(field.id, { required: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor={`required-${field.id}`} className="text-sm text-gray-700">
            Required field
          </label>
        </div>

        {field.options && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Options</label>
              <button
                onClick={() => addOption(field.id)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                <Plus size={14} />
                Add Option
              </button>
            </div>
            <div className="space-y-2">
              {field.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(field.id, index, e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    onClick={() => removeOption(field.id, index)}
                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                    disabled={field.options!.length <= 1}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-2xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Form Preview</h1>
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Editor
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{form.title}</h2>
              {form.description && (
                <p className="text-gray-600">{form.description}</p>
              )}
            </div>

            <div className="space-y-6">
              {/* Phone number field (always first) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                />
              </div>

              {form.fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      disabled
                    />
                  ) : field.type === 'select' ? (
                    <select 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled
                    >
                      <option value="">Choose an option</option>
                      {field.options?.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : field.type === 'radio' ? (
                    <div className="space-y-2">
                      {field.options?.map((option, index) => (
                        <label key={index} className="flex items-center gap-2">
                          <input type="radio" name={field.id} value={option} disabled />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : field.type === 'checkbox' ? (
                    <div className="space-y-2">
                      {field.options?.map((option, index) => (
                        <label key={index} className="flex items-center gap-2">
                          <input type="checkbox" value={option} disabled />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled
                    />
                  )}
                </div>
              ))}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                disabled
              >
                {form.submitButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
                  <p className="text-sm text-gray-600">Create beautiful, functional forms</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye size={16} />
                Preview
              </button>
              <button
                onClick={saveForm}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {isLoading ? 'Saving...' : 'Save Form'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Field Types Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Field Types</h2>
              <div className="space-y-2">
                {FIELD_TYPES.map((fieldType) => (
                  <button
                    key={fieldType.value}
                    onClick={() => addField(fieldType.value)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{fieldType.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900 group-hover:text-blue-700">
                          {fieldType.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {fieldType.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Form Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Form Settings</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Form Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter form title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Submit Button Text</label>
                  <input
                    type="text"
                    value={form.submitButtonText}
                    onChange={(e) => setForm(prev => ({ ...prev, submitButtonText: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Submit"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Optional description for your form"
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {form.fields.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No fields yet</h3>
                  <p className="text-gray-600 mb-6">Start building your form by adding fields from the sidebar</p>
                  <button
                    onClick={() => addField('text')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add First Field
                  </button>
                </div>
              ) : (
                <>
                  {/* Phone Number Field (Always First) */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm">📱</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-900">Phone Number Field</h3>
                        <p className="text-sm text-green-700">Required field - automatically included in all forms</p>
                      </div>
                    </div>
                  </div>

                  {form.fields.map(renderFieldEditor)}
                </>
              )}
            </div>

            {savedFormId && (
              <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="font-semibold text-green-900 mb-2">Form Saved Successfully! 🎉</h3>
                <p className="text-green-700 mb-4">Your form is now available at:</p>
                <div className="bg-white border border-green-200 rounded-lg p-3">
                  <code className="text-sm text-green-800">
                    {window.location.origin}/form/{savedFormId}
                  </code>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};