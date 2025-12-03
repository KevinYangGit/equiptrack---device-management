import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface AutocompleteInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  suggestions: string[];
  label: string;
  onValueChange: (value: string) => void;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ 
  suggestions, 
  label, 
  value, 
  onValueChange,
  className = '',
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputVal = typeof value === 'string' ? value : '';

  // Filter suggestions based on input, but if input is empty show top suggestions
  const filteredSuggestions = inputVal 
    ? suggestions.filter(s => s.toLowerCase().includes(inputVal.toLowerCase()) && s !== inputVal)
    : suggestions;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (suggestion: string) => {
    onValueChange(suggestion);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          {...props}
          value={inputVal}
          onChange={(e) => {
            onValueChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={`w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all ${className}`}
          autoComplete="off"
        />
        {suggestions.length > 0 && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            tabIndex={-1}
          >
            <ChevronDown size={16} />
          </button>
        )}
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto py-1 animate-in fade-in zoom-in-95 duration-100">
          {filteredSuggestions.map((suggestion) => (
            <li
              key={suggestion}
              onClick={() => handleSelect(suggestion)}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 cursor-pointer flex justify-between items-center group"
            >
              <span>{suggestion}</span>
              {/* Optional: Visual indicator for frequent items if needed */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};