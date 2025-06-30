import React, { useState } from 'react';
import { Plus, Save, Eye, Trash2, GripVertical } from 'lucide-react';
import { FormField, FieldType, FormDefinition } from '../types/form';
import { apiService } from '../services/api';
import { Button } from '../presentation/components/ui/core/Button';
import { Card } from '../presentation/components/ui/data-display/Card';

const FIELD_TYPES: { value: FieldType; label: string; description: string }[] = [
  { value: 'text', label: 'Text', description: 'Single line text input' },
  { value: 'textarea', label: 'Textarea', description: 'Multi-line text input' },
  { value: 'password', label: 'Password', description: 'Password input field' },
  { value: 'email', label: 'Email', description: 'Email address field' },
  { value: 'number', label: 'Number', description: 'Numeric input field' },
  { value: 'date', label: 'Date', description: 'Date picker' },
  { value: 'time', label: 'Time', description: 'Time picker' },
  { value: 'checkbox', label: 'Checkbox', description: 'Multiple choice checkboxes' },
  { value: 'radio', label: 'Radio', description: 'Single choice radio buttons' },
  { value: 'select', label: 'Select', description: 'Dropdown selection' },
  { value: 'file', label: 'File Upload', description: 'File upload field' },
];

export const FormBuilder: React.FC = () => {
  const [form, setForm] = useState<FormDefinition>({
    title: '',
    description: '',
    fields: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [savedFormId, setSavedFormId] = useState<number | null>(null);

  const generateFieldId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: generateFieldId(),
      type,
      label: `${FIELD_TYPES.find(ft => ft.value === type)?.label} Field`,
      placeholder: '',
      required: false,
      options: ['radio', 'select', 'checkbox'].includes(type) ? ['Option 1'] : undefined,
    };

    setForm(prev => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
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
      const currentIndex = prev.fields.findIndex(field => field.id === fieldId);
      if (currentIndex === -1) return prev;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= prev.fields.length) return prev;

      const newFields = [...prev.fields];
      [newFields[currentIndex], newFields[newIndex]] = [newFields[newIndex], newFields[currentIndex]];

      return { ...prev, fields: newFields };
    });
  };

  const addOption = (fieldId: string) => {
    updateField(fieldId, {
      options: [...(form.fields.find(f => f.id === fieldId)?.options || []), 'New Option'],
    });
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = form.fields.find(f => f.id === fieldId);
    if (!field?.options) return;

    const newOptions = [...field.options];
    newOptions[optionIndex] = value;
    updateField(fieldId, { options: newOptions });
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = form.fields.find(f => f.id === fieldId);
    if (!field?.options) return;

    const newOptions = field.options.filter((_, index) => index !== optionIndex);
    updateField(fieldId, { options: newOptions });
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
      alert(`Form saved successfully! Form ID: ${savedForm.id}`);
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Error saving form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const previewForm = () => {
    if (!savedFormId) {
      alert('Please save the form first to preview it');
      return;
    }
    window.open(`/form/${savedFormId}`, '_blank');
  };

  const renderFieldEditor = (field: FormField) => (
    <Card key={field.id} className="p-4 mb-4 border-l-4 border-l-blue-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
          <span className="font-medium text-sm text-blue-600 uppercase">
            {FIELD_TYPES.find(ft => ft.value === field.type)?.label}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => moveField(field.id, 'up')}
            disabled={form.fields.findIndex(f => f.id === field.id) === 0}
          >
            ↑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => moveField(field.id, 'down')}
            disabled={form.fields.findIndex(f => f.id === field.id) === form.fields.length - 1}
          >
            ↓
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeField(field.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Field Label *</label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => updateField(field.id, { label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter field label"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Placeholder</label>
          <input
            type="text"
            value={field.placeholder || ''}
            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter placeholder text"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => updateField(field.id, { required: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium">Required field</span>
        </label>
      </div>

      {field.options && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Options</label>
          {field.options.map((option, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(field.id, index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Option text"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeOption(field.id, index)}
                disabled={field.options!.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => addOption(field.id)}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Option
          </Button>
        </div>
      )}
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Form Builder</h1>
        <p className="text-gray-600">Create dynamic forms with various field types</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Settings */}
        <div className="lg:col-span-2">
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Form Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Form Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter form title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={form.description || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter form description (optional)"
                />
              </div>
            </div>
          </Card>

          {/* Form Fields */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Form Fields</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> A phone number field will be automatically added to all forms and is required for all submissions.
              </p>
            </div>
            {form.fields.length === 0 ? (
              <Card className="p-8 text-center text-gray-500">
                <p className="mb-4">No fields added yet</p>
                <p className="text-sm">Select field types from the sidebar to get started</p>
              </Card>
            ) : (
              <div>
                {form.fields.map(renderFieldEditor)}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={saveForm}
              loading={isLoading}
              leftIcon={<Save className="h-4 w-4" />}
              disabled={!form.title.trim()}
            >
              Save Form
            </Button>
            <Button
              variant="outline"
              onClick={previewForm}
              leftIcon={<Eye className="h-4 w-4" />}
              disabled={!savedFormId}
            >
              Preview Form
            </Button>
          </div>
        </div>

        {/* Field Types Sidebar */}
        <div>
          <Card className="p-4 sticky top-6">
            <h3 className="text-lg font-semibold mb-4">Add Fields</h3>
            <div className="space-y-2">
              {FIELD_TYPES.map((fieldType) => (
                <Button
                  key={fieldType.value}
                  variant="ghost"
                  size="sm"
                  onClick={() => addField(fieldType.value)}
                  className="w-full justify-start text-left p-3 h-auto"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Plus className="h-4 w-4" />
                      <span className="font-medium">{fieldType.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{fieldType.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};