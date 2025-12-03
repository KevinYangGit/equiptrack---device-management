import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Plus, Package2, Upload, AlertTriangle, Trash2, X, CheckCircle2, AlertCircle, Download, FileUp, Settings, Laptop, Smartphone, Camera, Headphones, Keyboard, Box, Tablet, Monitor, Printer, Server, HardDrive, Mouse, Speaker, Gamepad2, Watch, Tv, Radio, Package } from 'lucide-react';
import { AppData, Device, HistoryRecord, DeviceType } from './types';
import { loadData, saveData, generateId, loadWallpaper, isWallpaperFetchedToday, saveWallpaper, exportData, importData, loadDeviceNames, saveDeviceName, deleteDeviceName, getDeviceNamesSorted, loadDeviceTypes, addDeviceType, deleteDeviceType, saveDeviceTypes, updateDeviceTypeIcon } from './services/storageService';
import { IconSelector } from './components/IconSelector';
import { DeviceList } from './components/DeviceList';
import { HistoryLog } from './components/HistoryLog';
import { Button } from './components/Button';
import { Modal } from './components/Modal';
import { AutocompleteInput } from './components/AutocompleteInput';

const App = () => {
  // State
  const [data, setData] = useState<AppData>(() => loadData());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [deviceToDeleteId, setDeviceToDeleteId] = useState<string | null>(null);
  
  // Error state for storage issues
  const [storageError, setStorageError] = useState<string | null>(null);
  
  // Success message state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Import state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<{ deviceCount: number; historyCount: number; exportDate?: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const importFileRef = useRef<File | null>(null);
  
  // Settings menu state
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isExportConfirmOpen, setIsExportConfirmOpen] = useState(false);
  
  // Device name history state
  const [deviceNameHistory, setDeviceNameHistory] = useState<string[]>([]);
  const [isDeviceNameDropdownOpen, setIsDeviceNameDropdownOpen] = useState(false);
  
  // Device types state
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [isDeviceTypeModalOpen, setIsDeviceTypeModalOpen] = useState(false);
  const [newDeviceTypeInput, setNewDeviceTypeInput] = useState('');
  const [newDeviceTypeIcon, setNewDeviceTypeIcon] = useState('Box');
  const [newDeviceTypeColor, setNewDeviceTypeColor] = useState('text-gray-600');
  const [editingType, setEditingType] = useState<DeviceType | null>(null);
  
  // Form Inputs
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState('Laptop');
  const [newDeviceImage, setNewDeviceImage] = useState<string>(''); // Base64 image
  const [borrowerName, setBorrowerName] = useState('');

  // Wallpaper State
  const [bgUrl, setBgUrl] = useState('');
  const [isBgLoading, setIsBgLoading] = useState(true);

  // Wallpaper Management Logic
  useEffect(() => {
    const initializeWallpaper = async () => {
      // First, load saved wallpaper from local storage
      const savedWallpaper = loadWallpaper();
      if (savedWallpaper) {
        setBgUrl(savedWallpaper);
        setIsBgLoading(false);
      }

      // Check if we need to fetch a new wallpaper today
      const fetchedToday = isWallpaperFetchedToday();
      
      if (fetchedToday) {
        // Already fetched today, use saved wallpaper
        if (!savedWallpaper) {
          // Fallback if saved wallpaper is missing
          setBgUrl('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000');
        }
        setIsBgLoading(false);
        return;
      }

      // If no saved wallpaper and need to fetch, keep loading state
      if (!savedWallpaper) {
        setIsBgLoading(true);
      }

      // Need to fetch new wallpaper
      const fetchBingWallpaper = async () => {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
          // Fetch Bing Daily Image via a CORS-friendly wrapper
          const response = await fetch(
            'https://bing.biturl.top/?resolution=1920&format=json&index=0&mkt=zh-CN',
            { signal: controller.signal }
          );
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          if (data && data.url) {
            // Save the new wallpaper URL and update date
            saveWallpaper(data.url);
            setBgUrl(data.url);
          } else {
            throw new Error('Invalid response format');
          }
        } catch (error) {
          clearTimeout(timeoutId);
          console.error('Failed to fetch Bing wallpaper:', error);
          // If fetch fails and we have a saved wallpaper, keep using it
          // Otherwise, use fallback
          if (!savedWallpaper) {
            setBgUrl('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000');
          }
        } finally {
          setIsBgLoading(false);
        }
      };

      // Fetch new wallpaper in background
      fetchBingWallpaper();
    };

    initializeWallpaper();
  }, []);

  // Derived state for autocomplete
  const previousBorrowers = useMemo(() => {
    const borrowers = new Set<string>();
    data.history.forEach(record => {
      if (record.borrower) borrowers.add(record.borrower);
    });
    return Array.from(borrowers);
  }, [data.history]);

  // Memoized device lookups for modals
  const selectedDevice = useMemo(() => 
    data.devices.find(d => d.id === selectedDeviceId),
    [data.devices, selectedDeviceId]
  );

  const deviceToDelete = useMemo(() => 
    data.devices.find(d => d.id === deviceToDeleteId),
    [data.devices, deviceToDeleteId]
  );

  // Device statistics
  const deviceStats = useMemo(() => {
    const total = data.devices.length;
    const available = data.devices.filter(d => d.status === 'available').length;
    const borrowed = data.devices.filter(d => d.status === 'borrowed').length;
    return { total, available, borrowed };
  }, [data.devices]);

  // Create device type map for DeviceList
  const deviceTypeMap = useMemo(() => {
    const map: Record<string, { icon: string; color: string }> = {};
    deviceTypes.forEach(type => {
      map[type.name] = {
        icon: type.icon,
        color: type.color || 'text-gray-600'
      };
    });
    return map;
  }, [deviceTypes]);

  // Load device name history and device types on mount
  useEffect(() => {
    setDeviceNameHistory(getDeviceNamesSorted());
    const types = loadDeviceTypes();
    setDeviceTypes(types);
    if (types.length > 0) {
      setNewDeviceType(types[0].name);
    }
  }, []);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.settings-menu-container')) {
        setIsSettingsMenuOpen(false);
      }
      if (!target.closest('.device-name-dropdown-container')) {
        setIsDeviceNameDropdownOpen(false);
      }
    };
    
    if (isSettingsMenuOpen || isDeviceNameDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSettingsMenuOpen, isDeviceNameDropdownOpen]);

  // Handlers
  const handleExportClick = () => {
    setIsSettingsMenuOpen(false);
    setIsExportConfirmOpen(true);
  };

  const handleExport = () => {
    setIsExportConfirmOpen(false);
    try {
      exportData();
      setSuccessMessage('数据已成功导出！');
      setStorageError(null);
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : '导出数据失败，请重试');
      setSuccessMessage(null);
    }
  };

  const handleImportClickFromMenu = () => {
    setIsSettingsMenuOpen(false);
    handleImportClick();
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        setIsImporting(true);
        setStorageError(null);
        
        // Store file reference
        importFileRef.current = file;
        
        // Read and preview the file
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            const imported = JSON.parse(content);
            
            // Extract data (handle both wrapped and direct format)
            let data: AppData;
            if (imported.data && Array.isArray(imported.data.devices)) {
              data = imported.data;
            } else if (Array.isArray(imported.devices)) {
              data = imported;
            } else {
              throw new Error('Invalid file format');
            }

            // Show preview
            setImportPreview({
              deviceCount: data.devices.length,
              historyCount: data.history.length,
              exportDate: imported.exportDate
            });
            setIsImportModalOpen(true);
            setIsImporting(false);
          } catch (error) {
            setIsImporting(false);
            setStorageError(error instanceof Error ? error.message : '无法读取文件，请确保是有效的JSON文件');
          }
        };
        reader.onerror = () => {
          setIsImporting(false);
          setStorageError('读取文件失败，请重试');
        };
        reader.readAsText(file);
      } catch (error) {
        setIsImporting(false);
        setStorageError(error instanceof Error ? error.message : '导入失败，请重试');
      }
    };
    input.click();
  };

  const handleImportConfirm = async () => {
    if (!importFileRef.current) {
      setStorageError('未选择文件');
      return;
    }

    try {
      setIsImporting(true);
      setStorageError(null);
      
      const importedData = await importData(importFileRef.current);
      setData(importedData);
      setSuccessMessage('数据已成功导入！');
      setIsImportModalOpen(false);
      setImportPreview(null);
      importFileRef.current = null;
      setIsImporting(false);
    } catch (error) {
      setIsImporting(false);
      setStorageError(error instanceof Error ? error.message : '导入数据失败，请重试');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setStorageError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      e.target.value = ''; // Reset input
      return;
    }

    // Validate file size (5MB limit)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      setStorageError(`Image size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds 5MB limit. Please choose a smaller image.`);
      e.target.value = ''; // Reset input
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewDeviceImage(reader.result as string);
      setStorageError(null); // Clear any previous errors
    };
    reader.onerror = () => {
      setStorageError('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleAddDevice = () => {
    if (!newDeviceName) return;

    // Save device name to history
    saveDeviceName(newDeviceName);
    setDeviceNameHistory(getDeviceNamesSorted());

    const newDevice: Device = {
      id: generateId(),
      name: newDeviceName,
      type: newDeviceType,
      image: newDeviceImage,
      status: 'available',
      lastUpdated: Date.now(),
    };

    const newHistory: HistoryRecord = {
      id: generateId(),
      deviceId: newDevice.id,
      deviceName: newDeviceName,
      action: 'add',
      timestamp: Date.now(),
    };

    const newData = {
      devices: [...data.devices, newDevice],
      history: [newHistory, ...data.history],
    };

    setData(newData);
    try {
      saveData(newData);
      setStorageError(null);
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : 'Failed to save data');
      return;
    }
    setIsAddModalOpen(false);
    
    // Reset form
    setNewDeviceName('');
    const types = loadDeviceTypes();
    if (types.length > 0) {
      setNewDeviceType(types[0].name);
    }
    setNewDeviceImage('');
  };

  const handleDeleteDeviceName = (name: string) => {
    deleteDeviceName(name);
    setDeviceNameHistory(getDeviceNamesSorted());
  };

  const handleAddDeviceType = () => {
    if (!newDeviceTypeInput.trim()) {
      setStorageError('设备类型不能为空');
      return;
    }

    try {
      addDeviceType(newDeviceTypeInput.trim(), newDeviceTypeIcon, newDeviceTypeColor);
      const updatedTypes = loadDeviceTypes();
      setDeviceTypes(updatedTypes);
      setNewDeviceTypeInput('');
      setNewDeviceTypeIcon('Box');
      setNewDeviceTypeColor('text-gray-600');
      setSuccessMessage('设备类型已添加');
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : '添加设备类型失败');
    }
  };

  const handleDeleteDeviceType = (typeName: string) => {
    try {
      deleteDeviceType(typeName, data.devices);
      const updatedTypes = loadDeviceTypes();
      setDeviceTypes(updatedTypes);
      
      // If deleted type was selected, switch to first available type
      if (newDeviceType === typeName && updatedTypes.length > 0) {
        setNewDeviceType(updatedTypes[0].name);
      }
      
      setSuccessMessage('设备类型已删除');
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : '删除设备类型失败');
    }
  };

  const handleEditTypeIcon = (type: DeviceType) => {
    setEditingType(type);
    setNewDeviceTypeIcon(type.icon);
    setNewDeviceTypeColor(type.color || 'text-gray-600');
  };

  const handleSaveTypeIcon = () => {
    if (!editingType) return;
    
    try {
      updateDeviceTypeIcon(editingType.name, newDeviceTypeIcon, newDeviceTypeColor);
      const updatedTypes = loadDeviceTypes();
      setDeviceTypes(updatedTypes);
      setEditingType(null);
      setSuccessMessage('图标已更新');
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : '更新图标失败');
    }
  };

  const openBorrowModal = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setBorrowerName('');
    setIsBorrowModalOpen(true);
  };

  const handleBorrow = () => {
    if (!selectedDeviceId || !borrowerName) return;

    const deviceIndex = data.devices.findIndex(d => d.id === selectedDeviceId);
    if (deviceIndex === -1) return;

    const device = data.devices[deviceIndex];
    const updatedDevice = {
      ...device,
      status: 'borrowed' as const,
      borrower: borrowerName,
      lastUpdated: Date.now(),
    };

    const newHistory: HistoryRecord = {
      id: generateId(),
      deviceId: device.id,
      deviceName: device.name,
      action: 'borrow',
      borrower: borrowerName,
      timestamp: Date.now(),
    };

    const newDevices = [...data.devices];
    newDevices[deviceIndex] = updatedDevice;

    const newData = {
      devices: newDevices,
      history: [newHistory, ...data.history],
    };

    setData(newData);
    try {
      saveData(newData);
      setStorageError(null);
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : 'Failed to save data');
      return;
    }
    setIsBorrowModalOpen(false);
  };

  const openReturnModal = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setIsReturnModalOpen(true);
  };

  const handleReturn = () => {
    if (!selectedDeviceId) return;

    const deviceIndex = data.devices.findIndex(d => d.id === selectedDeviceId);
    if (deviceIndex === -1) return;

    const device = data.devices[deviceIndex];
    const previousBorrower = device.borrower;

    const updatedDevice = {
      ...device,
      status: 'available' as const,
      borrower: undefined,
      lastUpdated: Date.now(),
    };

    const newHistory: HistoryRecord = {
      id: generateId(),
      deviceId: device.id,
      deviceName: device.name,
      action: 'return',
      borrower: previousBorrower,
      timestamp: Date.now(),
    };

    const newDevices = [...data.devices];
    newDevices[deviceIndex] = updatedDevice;

    const newData = {
      devices: newDevices,
      history: [newHistory, ...data.history],
    };

    setData(newData);
    try {
      saveData(newData);
      setStorageError(null);
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : 'Failed to save data');
      return;
    }
    setIsReturnModalOpen(false);
  };

  const openDeleteModal = (deviceId: string) => {
    setDeviceToDeleteId(deviceId);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (!deviceToDeleteId) return;

    const device = data.devices.find(d => d.id === deviceToDeleteId);
    if (!device) return;

    const newHistory: HistoryRecord = {
        id: generateId(),
        deviceId: device.id,
        deviceName: device.name,
        action: 'delete',
        timestamp: Date.now(),
    };

    const newData = {
      devices: data.devices.filter(d => d.id !== deviceToDeleteId),
      history: [newHistory, ...data.history],
    };

    setData(newData);
    try {
      saveData(newData);
      setStorageError(null);
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : 'Failed to save data');
      return;
    }
    setIsDeleteModalOpen(false);
    setDeviceToDeleteId(null);
  };

  return (
    <div className="min-h-screen relative font-sans text-slate-800 selection:bg-brand-500/30">
      {/* Background without Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {bgUrl && (
            <div 
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-100"
                style={{ backgroundImage: `url(${bgUrl})` }}
            />
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Storage Error Alert */}
        {storageError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-fade-in-up">
            <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-red-900 mb-1">错误</h3>
              <p className="text-sm text-red-700">{storageError}</p>
            </div>
            <button
              onClick={() => setStorageError(null)}
              className="text-red-400 hover:text-red-600 transition-colors shrink-0"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Success Message Alert */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 animate-fade-in-up">
            <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={20} />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-green-900 mb-1">成功</h3>
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-400 hover:text-green-600 transition-colors shrink-0"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Header */}
        <header className="relative flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 animate-fade-in-up z-20">
          <div className="flex items-center gap-3">
            <div className="bg-brand-600 p-2.5 rounded-xl shadow-lg shadow-brand-500/20 text-white">
              <Package2 size={28} />
            </div>
            <div className="bg-white/50 backdrop-blur-sm px-3 py-1 rounded-lg">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">EquipTrack</h1>
              <p className="text-sm text-gray-600 font-medium">Device Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Settings Button with Dropdown Menu */}
            <div className="relative settings-menu-container">
              <Button 
                onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)} 
                variant="secondary" 
                className="shadow-sm hover:shadow-md transition-all p-2"
                title="设置"
              >
                <Settings size={18} />
              </Button>

              {/* Settings Dropdown Menu */}
              {isSettingsMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[100] animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={handleExportClick}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                  >
                    <Download size={16} />
                    <span>导出数据</span>
                  </button>
                  <button
                    onClick={handleImportClickFromMenu}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isImporting}
                  >
                    <FileUp size={16} />
                    <span>导入数据</span>
                  </button>
                </div>
              )}
            </div>

            <Button onClick={() => setIsAddModalOpen(true)} className="shadow-lg shadow-brand-500/20">
              <Plus size={18} className="mr-2" />
              Add New Device
            </Button>
          </div>
        </header>

        {/* Device Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-fade-in-up">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">全部设备数量</p>
                <p className="text-2xl font-bold text-gray-900">{deviceStats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package2 className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">可借用设备数量</p>
                <p className="text-2xl font-bold text-green-600">{deviceStats.available}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle2 className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">已借出设备数量</p>
                <p className="text-2xl font-bold text-amber-600">{deviceStats.borrowed}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <AlertCircle className="text-amber-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Device List */}
          <div className="lg:col-span-2">
            <DeviceList 
              devices={data.devices} 
              onBorrow={openBorrowModal}
              onReturn={openReturnModal}
              onDelete={openDeleteModal}
              deviceTypeMap={deviceTypeMap}
            />
          </div>

          {/* Right Column: History Log */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <HistoryLog logs={data.history} />
            </div>
          </div>
        </div>
      </div>

      {/* Add Device Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsDeviceNameDropdownOpen(false);
        }}
        title="Add New Device"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Device Image</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                {newDeviceImage ? (
                  <img src={newDeviceImage} alt="Preview" className="h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Click to upload image</p>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
          </div>
          
          <div className="relative device-name-dropdown-container">
            <label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label>
            <div className="relative">
              <input
                type="text"
                value={newDeviceName}
                onChange={(e) => {
                  setNewDeviceName(e.target.value);
                  setIsDeviceNameDropdownOpen(true);
                }}
                onFocus={() => setIsDeviceNameDropdownOpen(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="e.g. MacBook Pro 14"
              />
              
              {/* Device Name History Dropdown */}
              {isDeviceNameDropdownOpen && deviceNameHistory.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto py-1">
                  {deviceNameHistory
                    .filter(name => 
                      !newDeviceName || name.toLowerCase().includes(newDeviceName.toLowerCase())
                    )
                    .map((name) => (
                      <div
                        key={name}
                        className="px-3 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 cursor-pointer flex justify-between items-center group"
                      >
                        <span
                          onClick={() => {
                            setNewDeviceName(name);
                            setIsDeviceNameDropdownOpen(false);
                          }}
                          className="flex-1"
                        >
                          {name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDeviceName(name);
                            if (newDeviceName === name) {
                              setNewDeviceName('');
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 transition-opacity"
                          title="删除"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <button
                type="button"
                onClick={() => setIsDeviceTypeModalOpen(true)}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                管理类型
              </button>
            </div>
            <select
              value={newDeviceType}
              onChange={(e) => setNewDeviceType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
            >
              {deviceTypes.map((type) => (
                <option key={type.name} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => {
              setIsAddModalOpen(false);
              setIsDeviceNameDropdownOpen(false);
            }}>Cancel</Button>
            <Button onClick={handleAddDevice} disabled={!newDeviceName}>Add Device</Button>
          </div>
        </div>
      </Modal>

      {/* Borrow Modal */}
      <Modal
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        title="Borrow Device"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Who is borrowing <span className="font-semibold text-gray-900">
              {selectedDevice?.name}
            </span>?
          </p>
          
          <AutocompleteInput
            label="Borrower Name"
            value={borrowerName}
            onValueChange={setBorrowerName}
            suggestions={previousBorrowers}
            placeholder="Enter name"
            autoFocus
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsBorrowModalOpen(false)}>Cancel</Button>
            <Button onClick={handleBorrow} disabled={!borrowerName}>Confirm Borrow</Button>
          </div>
        </div>
      </Modal>

      {/* Return Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Return Device"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg text-amber-800 text-sm">
            <AlertTriangle className="shrink-0" size={20} />
            <p>Are you sure you want to mark this device as returned?</p>
          </div>
          
          <p className="text-sm text-gray-600">
            Device: <span className="font-semibold text-gray-900">
              {selectedDevice?.name}
            </span>
            <br />
            Current Borrower: <span className="font-semibold text-gray-900">
              {selectedDevice?.borrower}
            </span>
          </p>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsReturnModalOpen(false)}>Cancel</Button>
            <Button onClick={handleReturn}>Confirm Return</Button>
          </div>
        </div>
      </Modal>

       {/* Delete Modal */}
       <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Device"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg text-red-800 text-sm">
            <AlertTriangle className="shrink-0" size={20} />
            <p>This action cannot be undone. The device will be permanently removed from the inventory.</p>
          </div>
          
          <p className="text-sm text-gray-600">
            Deleting: <span className="font-semibold text-gray-900">
              {deviceToDelete?.name}
            </span>
          </p>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete Device</Button>
          </div>
        </div>
      </Modal>

      {/* Import Confirm Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportPreview(null);
          importFileRef.current = null;
        }}
        title="确认导入数据"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg text-amber-800 text-sm">
            <AlertTriangle className="shrink-0" size={20} />
            <p>导入数据将覆盖当前所有设备数据。此操作无法撤销，请确认是否继续。</p>
          </div>
          
          {importPreview && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                导入数据预览：
              </p>
              <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">设备数量：</span>
                  {importPreview.deviceCount}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">历史记录数量：</span>
                  {importPreview.historyCount}
                </p>
                {importPreview.exportDate && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">导出日期：</span>
                    {new Date(importPreview.exportDate).toLocaleString('zh-CN')}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button 
              variant="secondary" 
              onClick={() => {
                setIsImportModalOpen(false);
                setImportPreview(null);
                importFileRef.current = null;
              }}
              disabled={isImporting}
            >
              取消
            </Button>
            <Button 
              onClick={handleImportConfirm} 
              disabled={isImporting}
            >
              {isImporting ? '导入中...' : '确认导入'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Export Confirm Modal */}
      <Modal
        isOpen={isExportConfirmOpen}
        onClose={() => setIsExportConfirmOpen(false)}
        title="确认导出数据"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg text-blue-800 text-sm">
            <AlertTriangle className="shrink-0" size={20} />
            <p>即将导出所有设备数据。导出文件将包含所有设备和历史记录。</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">当前设备数量：</span>
              {deviceStats.total}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">历史记录数量：</span>
              {data.history.length}
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button 
              variant="secondary" 
              onClick={() => setIsExportConfirmOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleExport}>
              确认导出
            </Button>
          </div>
        </div>
      </Modal>

      {/* Device Type Management Modal */}
      <Modal
        isOpen={isDeviceTypeModalOpen}
        onClose={() => {
          setIsDeviceTypeModalOpen(false);
          setNewDeviceTypeInput('');
          setNewDeviceTypeIcon('Box');
          setNewDeviceTypeColor('text-gray-600');
          setEditingType(null);
          setStorageError(null);
        }}
        title="管理设备类型"
      >
        <div className="space-y-4">
          {/* Add New Type Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">添加新类型</label>
            <div className="space-y-3">
              <input
                type="text"
                value={newDeviceTypeInput}
                onChange={(e) => setNewDeviceTypeInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddDeviceType();
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="输入新设备类型"
              />
              
              {/* Icon Selector */}
              <IconSelector
                selectedIcon={newDeviceTypeIcon}
                selectedColor={newDeviceTypeColor}
                onIconChange={(icon, color) => {
                  setNewDeviceTypeIcon(icon);
                  setNewDeviceTypeColor(color);
                }}
              />
              
              <Button onClick={handleAddDeviceType} disabled={!newDeviceTypeInput.trim()}>
                添加
              </Button>
            </div>
          </div>

          {/* Device Types List */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">现有类型</label>
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-60 overflow-auto">
              {deviceTypes.map((type) => {
                const isInUse = data.devices.some(device => device.type === type.name);
                const isEditing = editingType?.name === type.name;
                
                // Get icon component
                const getIconComponent = (iconName: string) => {
                  const iconMap: Record<string, React.ComponentType<any>> = {
                    Laptop, Smartphone, Camera, Headphones, Keyboard, Box,
                    Tablet, Monitor, Printer, Server, HardDrive, Mouse,
                    Speaker, Gamepad2, Watch, Tv, Radio, Package,
                  };
                  return iconMap[iconName] || Box;
                };
                
                const IconComponent = getIconComponent(type.icon);
                
                return (
                  <div
                    key={type.name}
                    className="px-3 py-3 hover:bg-gray-50 group"
                  >
                    {isEditing ? (
                      // 编辑模式
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <IconComponent size={20} className={type.color} />
                          <span className="text-sm font-medium text-gray-900">{type.name}</span>
                        </div>
                        <IconSelector
                          selectedIcon={newDeviceTypeIcon}
                          selectedColor={newDeviceTypeColor}
                          onIconChange={(icon, color) => {
                            setNewDeviceTypeIcon(icon);
                            setNewDeviceTypeColor(color);
                          }}
                        />
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleSaveTypeIcon}
                            className="text-sm py-1.5"
                          >
                            保存
                          </Button>
                          <Button 
                            variant="secondary" 
                            onClick={() => {
                              setEditingType(null);
                              setNewDeviceTypeIcon('Box');
                              setNewDeviceTypeColor('text-gray-600');
                            }}
                            className="text-sm py-1.5"
                          >
                            取消
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // 显示模式
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <IconComponent size={20} className={type.color || 'text-gray-600'} />
                          <span className="text-sm text-gray-700">{type.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isInUse && (
                            <span className="text-xs text-gray-500">使用中</span>
                          )}
                          <button
                            onClick={() => handleEditTypeIcon(type)}
                            className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 p-1 transition-opacity"
                            title="编辑图标"
                          >
                            <Settings size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteDeviceType(type.name)}
                            disabled={isInUse}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                            title={isInUse ? '该类型正在使用中，无法删除' : '删除类型'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {deviceTypes.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">暂无设备类型</p>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="secondary" onClick={() => {
              setIsDeviceTypeModalOpen(false);
              setNewDeviceTypeInput('');
              setNewDeviceTypeIcon('Box');
              setNewDeviceTypeColor('text-gray-600');
              setEditingType(null);
              setStorageError(null);
            }}>
              关闭
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}