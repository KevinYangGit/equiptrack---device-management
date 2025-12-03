import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Plus, Package2, Upload, AlertTriangle, Trash2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { AppData, Device, HistoryRecord } from './types';
import { loadData, saveData, generateId, loadWallpaper, isWallpaperFetchedToday, saveWallpaper } from './services/storageService';
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

  // Handlers
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
    setNewDeviceType('Laptop');
    setNewDeviceImage('');
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
              <h3 className="font-semibold text-red-900 mb-1">Storage Error</h3>
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

        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="bg-brand-600 p-2.5 rounded-xl shadow-lg shadow-brand-500/20 text-white">
              <Package2 size={28} />
            </div>
            <div className="bg-white/50 backdrop-blur-sm px-3 py-1 rounded-lg">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">EquipTrack</h1>
              <p className="text-sm text-gray-600 font-medium">Device Management System</p>
            </div>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto shadow-lg shadow-brand-500/20">
            <Plus size={18} className="mr-2" />
            Add New Device
          </Button>
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
        onClose={() => setIsAddModalOpen(false)}
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label>
            <input
              type="text"
              value={newDeviceName}
              onChange={(e) => setNewDeviceName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="e.g. MacBook Pro 14"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={newDeviceType}
              onChange={(e) => setNewDeviceType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
            >
              <option value="Laptop">Laptop</option>
              <option value="Mobile">Mobile</option>
              <option value="Tablet">Tablet</option>
              <option value="Camera">Camera</option>
              <option value="Audio">Audio</option>
              <option value="Accessory">Accessory</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
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
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}