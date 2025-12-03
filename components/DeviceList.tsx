import React, { useState } from 'react';
import { Device, DeviceStatus } from '../types';
import { Laptop, Smartphone, Camera, Box, Clock, CheckCircle2, AlertCircle, Trash2, Headphones, Keyboard, Tablet, Monitor, Printer, Server, HardDrive, Mouse, Speaker, Gamepad2, Watch, Tv, Radio, Package } from 'lucide-react';
import { Button } from './Button';

interface DeviceListProps {
  devices: Device[];
  onBorrow: (deviceId: string) => void;
  onReturn: (deviceId: string) => void;
  onDelete: (deviceId: string) => void;
  deviceTypeMap?: Record<string, { icon: string; color: string }>;
}

export const DeviceList: React.FC<DeviceListProps> = ({ devices, onBorrow, onReturn, onDelete, deviceTypeMap }) => {
  const [filter, setFilter] = useState<'all' | DeviceStatus>('all');

  const filteredDevices = devices.filter(d => filter === 'all' || d.status === filter);

  // 辅助函数：根据名称获取图标组件
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      Laptop, Smartphone, Camera, Headphones, Keyboard, Box,
      Tablet, Monitor, Printer, Server, HardDrive, Mouse,
      Speaker, Gamepad2, Watch, Tv, Radio, Package,
    };
    return iconMap[iconName] || Box;
  };

  const getIcon = (type: string) => {
    // 优先使用映射表
    if (deviceTypeMap && deviceTypeMap[type]) {
      const { icon, color } = deviceTypeMap[type];
      const IconComponent = getIconComponent(icon);
      return <IconComponent size={24} className={color} />;
    }
    
    // 向后兼容：使用关键词匹配
    const t = type.toLowerCase();
    if (t.includes('laptop') || t.includes('mac')) return <Laptop size={24} className="text-blue-600" />;
    if (t.includes('phone') || t.includes('mobile') || t.includes('android') || t.includes('ios')) return <Smartphone size={24} className="text-purple-600" />;
    if (t.includes('camera')) return <Camera size={24} className="text-rose-600" />;
    if (t.includes('audio') || t.includes('mic')) return <Headphones size={24} className="text-pink-600" />;
    if (t.includes('accessory')) return <Keyboard size={24} className="text-amber-600" />;
    return <Box size={24} className="text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Filters: Added p-1 to prevent hover scale clipping */}
      <div className="flex items-center gap-2 p-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap shadow-sm hover:scale-105 active:scale-95 ${
            filter === 'all' ? 'bg-gray-800 text-white' : 'bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-600 hover:bg-white'
          }`}
        >
          All Devices
        </button>
        <button
          onClick={() => setFilter('available')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap shadow-sm hover:scale-105 active:scale-95 ${
            filter === 'available' ? 'bg-green-600 text-white' : 'bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-600 hover:bg-green-50 hover:text-green-700'
          }`}
        >
          Available
        </button>
        <button
          onClick={() => setFilter('borrowed')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap shadow-sm hover:scale-105 active:scale-95 ${
            filter === 'borrowed' ? 'bg-amber-600 text-white' : 'bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-600 hover:bg-amber-50 hover:text-amber-700'
          }`}
        >
          Borrowed
        </button>
      </div>

      {filteredDevices.length === 0 ? (
        <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-xl border border-dashed border-gray-200 shadow-sm animate-fade-in-up">
          <Box className="mx-auto mb-4 text-gray-300" size={48} />
          <p className="text-gray-500 text-lg">No devices found matching your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDevices.map((device) => (
            <div 
              key={device.id} 
              className={`group bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden border shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] flex flex-col animate-fade-in-up ${
                device.status === 'borrowed' ? 'border-amber-200/60' : 'border-gray-200/60'
              }`}
            >
              <div className="p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {device.image ? (
                        <div className="w-12 h-12 shrink-0 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shadow-sm">
                            <img src={device.image} alt={device.name} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className={`p-3 rounded-lg shrink-0 shadow-inner ${device.status === 'borrowed' ? 'bg-amber-100' : 'bg-gray-100'}`}>
                            {getIcon(device.type)}
                        </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 leading-tight truncate" title={device.name}>{device.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">{device.type}</p>
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shrink-0 ml-2 shadow-sm ${
                    device.status === 'available' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {device.status === 'available' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    <span className="capitalize">{device.status}</span>
                  </div>
                </div>

                {device.status === 'borrowed' && (
                  <div className="mb-4 p-3 bg-amber-50/50 rounded-lg text-sm border border-amber-100/50">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Borrowed By</span>
                      <span className="font-semibold text-gray-900">{device.borrower}</span>
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <Clock size={12} />
                        <span>
                            {new Date(device.lastUpdated).toLocaleString(undefined, {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-auto pt-4 border-t border-gray-50">
                  {device.status === 'available' ? (
                    <Button 
                      variant="primary" 
                      className="flex-1 shadow-sm hover:shadow-md transition-all active:scale-95"
                      onClick={() => onBorrow(device.id)}
                    >
                      Borrow
                    </Button>
                  ) : (
                    <Button 
                      variant="secondary" 
                      className="flex-1 text-amber-700 hover:text-amber-800 border-amber-200 bg-amber-50 hover:bg-amber-100 shadow-sm hover:shadow-md transition-all active:scale-95"
                      onClick={() => onReturn(device.id)}
                    >
                      Return
                    </Button>
                  )}
                  <Button 
                      variant="ghost" 
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 px-2.5 transition-all active:scale-90"
                      onClick={() => onDelete(device.id)}
                      title="Delete Device"
                  >
                      <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};