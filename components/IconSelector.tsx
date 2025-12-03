import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';

interface IconSelectorProps {
  selectedIcon: string;
  selectedColor: string;
  onIconChange: (icon: string, color: string) => void;
}

// 常用图标列表
const COMMON_ICONS = [
  { name: 'Laptop', color: 'text-blue-600' },
  { name: 'Smartphone', color: 'text-purple-600' },
  { name: 'Tablet', color: 'text-indigo-600' },
  { name: 'Camera', color: 'text-rose-600' },
  { name: 'Headphones', color: 'text-pink-600' },
  { name: 'Keyboard', color: 'text-amber-600' },
  { name: 'Monitor', color: 'text-blue-500' },
  { name: 'Printer', color: 'text-gray-600' },
  { name: 'Server', color: 'text-slate-600' },
  { name: 'HardDrive', color: 'text-gray-700' },
  { name: 'Mouse', color: 'text-gray-500' },
  { name: 'Speaker', color: 'text-green-600' },
  { name: 'Gamepad2', color: 'text-purple-500' },
  { name: 'Watch', color: 'text-cyan-600' },
  { name: 'Tv', color: 'text-red-600' },
  { name: 'Radio', color: 'text-orange-600' },
  { name: 'Box', color: 'text-gray-600' },
  { name: 'Package', color: 'text-gray-600' },
];

// 颜色选项
const COLOR_OPTIONS = [
  { value: 'text-blue-600', label: '蓝色', color: '#2563eb' },
  { value: 'text-purple-600', label: '紫色', color: '#9333ea' },
  { value: 'text-rose-600', label: '玫瑰色', color: '#e11d48' },
  { value: 'text-pink-600', label: '粉色', color: '#db2777' },
  { value: 'text-amber-600', label: '琥珀色', color: '#d97706' },
  { value: 'text-indigo-600', label: '靛蓝色', color: '#4f46e5' },
  { value: 'text-green-600', label: '绿色', color: '#16a34a' },
  { value: 'text-gray-600', label: '灰色', color: '#4b5563' },
];

export const IconSelector: React.FC<IconSelectorProps> = ({
  selectedIcon,
  selectedColor,
  onIconChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.Box;
  };

  const SelectedIcon = getIconComponent(selectedIcon);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        选择图标
      </label>
      
      {/* 当前选择的图标预览 */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          <SelectedIcon size={24} className={selectedColor} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{selectedIcon}</p>
          <p className="text-xs text-gray-500">当前选择的图标</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {isOpen ? '收起' : '选择图标'}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4">
          {/* 图标选择网格 */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">常用图标</p>
            <div className="grid grid-cols-6 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
              {COMMON_ICONS.map(({ name, color }) => {
                const IconComponent = getIconComponent(name);
                const isSelected = selectedIcon === name && selectedColor === color;
                return (
                  <button
                    key={`${name}-${color}`}
                    type="button"
                    onClick={() => onIconChange(name, color)}
                    className={`p-2 rounded-lg border-2 transition-all hover:scale-110 ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    title={name}
                  >
                    <IconComponent size={20} className={color} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 颜色选择 */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">图标颜色</p>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map(({ value, label, color }) => {
                const isSelected = selectedColor === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onIconChange(selectedIcon, value)}
                    className={`px-3 py-1.5 rounded-lg border-2 text-sm transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

