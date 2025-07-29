import React from 'react';
import { MultiLanguageText } from '../../types/form';
import { DualLanguageField } from './DualLanguageField';

interface MultiLanguageOptionsProps {
  options: MultiLanguageText[];
  onChange: (options: MultiLanguageText[]) => void;
  label?: string;
  required?: boolean;
}

export const MultiLanguageOptions: React.FC<MultiLanguageOptionsProps> = ({
  options,
  onChange,
  label = 'Options',
  required = false,
}) => {
  const handleOptionChange = (index: number, value: MultiLanguageText) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onChange(newOptions);
  };

  const addOption = () => {
    onChange([...options, { en: '', ar: '' }]);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    onChange(newOptions);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {options.map((option, idx) => (
        <div key={idx} className="flex items-start space-x-2">
          <div className="flex-1">
            <DualLanguageField
              label={`Option ${idx + 1}`}
              value={option}
              onChange={(val) => handleOptionChange(idx, val as MultiLanguageText)}
            />
          </div>
          <button
            type="button"
            onClick={() => removeOption(idx)}
            className="mt-8 ml-2 px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
            aria-label="Remove option"
            disabled={options.length <= 1}
          >
            &times;
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addOption}
        className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
      >
        + Add Option
      </button>
    </div>
  );
}; 