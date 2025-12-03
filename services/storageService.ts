import { AppData, Device, HistoryRecord, DeviceType } from '../types';

const STORAGE_KEY = 'equiptrack_data_v1';

const DEFAULT_DATA: AppData = {
  devices: [
    {
      id: '1',
      name: 'MacBook Pro 16"',
      type: 'Laptop',
      status: 'available',
      lastUpdated: Date.now(),
    },
    {
      id: '2',
      name: 'iPhone 15 Pro Max',
      type: 'Mobile',
      status: 'borrowed',
      borrower: 'Alice Zhang',
      lastUpdated: Date.now(),
    },
    {
      id: '3',
      name: 'Sony A7IV Camera',
      type: 'Camera',
      status: 'available',
      lastUpdated: Date.now(),
    },
  ],
  history: [
    {
      id: 'h1',
      deviceId: '2',
      deviceName: 'iPhone 15 Pro Max',
      action: 'borrow',
      borrower: 'Alice Zhang',
      timestamp: Date.now(),
    }
  ],
};

export const loadData = (): AppData => {
  try {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    if (!serializedData) {
      return DEFAULT_DATA;
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error('Failed to load data:', error);
    return DEFAULT_DATA;
  }
};

export const saveData = (data: AppData): void => {
  try {
    const serializedData = JSON.stringify(data);
    const sizeInBytes = new Blob([serializedData]).size;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    
    // Check if data exceeds 5MB limit (conservative estimate for localStorage)
    if (sizeInMB > 5) {
      throw new Error(`Data size (${sizeInMB.toFixed(2)}MB) exceeds 5MB limit. Consider removing large images.`);
    }
    
    localStorage.setItem(STORAGE_KEY, serializedData);
  } catch (error) {
    console.error('Failed to save data:', error);
    throw error; // Re-throw to allow UI to handle the error
  }
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Wallpaper storage keys
const WALLPAPER_KEY = 'equiptrack_wallpaper';
const WALLPAPER_DATE_KEY = 'equiptrack_wallpaper_date';

// Get today's date string in YYYY-MM-DD format
const getTodayDateString = (): string => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

// Load saved wallpaper URL
export const loadWallpaper = (): string | null => {
  try {
    return localStorage.getItem(WALLPAPER_KEY);
  } catch (error) {
    console.error('Failed to load wallpaper:', error);
    return null;
  }
};

// Check if wallpaper was fetched today
export const isWallpaperFetchedToday = (): boolean => {
  try {
    const savedDate = localStorage.getItem(WALLPAPER_DATE_KEY);
    const today = getTodayDateString();
    return savedDate === today;
  } catch (error) {
    console.error('Failed to check wallpaper date:', error);
    return false;
  }
};

// Save wallpaper URL and update fetch date
export const saveWallpaper = (url: string): void => {
  try {
    localStorage.setItem(WALLPAPER_KEY, url);
    localStorage.setItem(WALLPAPER_DATE_KEY, getTodayDateString());
  } catch (error) {
    console.error('Failed to save wallpaper:', error);
  }
};

// Validate imported data structure
export const validateImportedData = (data: any): AppData => {
  // Check if data has the expected structure
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format: data must be an object');
  }

  // Handle both direct AppData format and wrapped format (with version/exportDate)
  let appData: AppData;
  if (data.data && Array.isArray(data.data.devices) && Array.isArray(data.data.history)) {
    // Wrapped format: { version, exportDate, data: { devices, history } }
    appData = data.data;
  } else if (Array.isArray(data.devices) && Array.isArray(data.history)) {
    // Direct format: { devices, history }
    appData = data;
  } else {
    throw new Error('Invalid data format: missing devices or history arrays');
  }

  // Validate devices array
  if (!Array.isArray(appData.devices)) {
    throw new Error('Invalid data format: devices must be an array');
  }

  // Validate history array
  if (!Array.isArray(appData.history)) {
    throw new Error('Invalid data format: history must be an array');
  }

  // Validate each device
  appData.devices.forEach((device: any, index: number) => {
    if (!device.id || typeof device.id !== 'string') {
      throw new Error(`Invalid device at index ${index}: missing or invalid id`);
    }
    if (!device.name || typeof device.name !== 'string') {
      throw new Error(`Invalid device at index ${index}: missing or invalid name`);
    }
    if (!device.type || typeof device.type !== 'string') {
      throw new Error(`Invalid device at index ${index}: missing or invalid type`);
    }
    if (device.status !== 'available' && device.status !== 'borrowed') {
      throw new Error(`Invalid device at index ${index}: status must be 'available' or 'borrowed'`);
    }
    if (typeof device.lastUpdated !== 'number') {
      throw new Error(`Invalid device at index ${index}: lastUpdated must be a number`);
    }
  });

  // Validate each history record
  appData.history.forEach((record: any, index: number) => {
    if (!record.id || typeof record.id !== 'string') {
      throw new Error(`Invalid history record at index ${index}: missing or invalid id`);
    }
    if (!record.deviceId || typeof record.deviceId !== 'string') {
      throw new Error(`Invalid history record at index ${index}: missing or invalid deviceId`);
    }
    if (!record.deviceName || typeof record.deviceName !== 'string') {
      throw new Error(`Invalid history record at index ${index}: missing or invalid deviceName`);
    }
    if (!['add', 'borrow', 'return', 'delete'].includes(record.action)) {
      throw new Error(`Invalid history record at index ${index}: action must be one of: add, borrow, return, delete`);
    }
    if (typeof record.timestamp !== 'number') {
      throw new Error(`Invalid history record at index ${index}: timestamp must be a number`);
    }
  });

  return appData;
};

// Import data from file
export const importData = (file: File): Promise<AppData> => {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.name.endsWith('.json')) {
      reject(new Error('Invalid file type. Please select a JSON file.'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content) {
          reject(new Error('File is empty'));
          return;
        }

        const imported = JSON.parse(content);
        const validatedData = validateImportedData(imported);
        
        // Save the validated data
        saveData(validatedData);
        
        resolve(validatedData);
      } catch (error) {
        if (error instanceof SyntaxError) {
          reject(new Error('Invalid JSON format. Please ensure the file is a valid JSON file.'));
        } else if (error instanceof Error) {
          reject(error);
        } else {
          reject(new Error('Failed to import data: ' + String(error)));
        }
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file. Please try again.'));
    };

    reader.readAsText(file);
  });
};

// Export data to JSON file
export const exportData = (): void => {
  try {
    const data = loadData();
    
    // Create export object with metadata
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: data
    };

    // Convert to JSON string with formatting
    const json = JSON.stringify(exportData, null, 2);
    
    // Create Blob
    const blob = new Blob([json], { type: 'application/json' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    a.download = `equiptrack-backup-${timestamp}.json`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export data:', error);
    throw new Error('Failed to export data. Please try again.');
  }
};

// Device name history storage keys
const DEVICE_NAMES_KEY = 'equiptrack_device_names';
const DEVICE_TYPES_KEY = 'equiptrack_device_types';

// Device Name History Management
export interface DeviceNameHistory {
  [name: string]: number; // name -> usage count
}

// Load device name history
export const loadDeviceNames = (): DeviceNameHistory => {
  try {
    const serializedData = localStorage.getItem(DEVICE_NAMES_KEY);
    if (!serializedData) {
      return {};
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error('Failed to load device names:', error);
    return {};
  }
};

// Save device name (increment usage count)
export const saveDeviceName = (name: string): void => {
  try {
    const history = loadDeviceNames();
    history[name] = (history[name] || 0) + 1;
    localStorage.setItem(DEVICE_NAMES_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save device name:', error);
  }
};

// Delete device name from history
export const deleteDeviceName = (name: string): void => {
  try {
    const history = loadDeviceNames();
    delete history[name];
    localStorage.setItem(DEVICE_NAMES_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to delete device name:', error);
  }
};

// Get device names sorted by frequency (descending)
export const getDeviceNamesSorted = (): string[] => {
  const history = loadDeviceNames();
  return Object.entries(history)
    .sort(([, countA], [, countB]) => countB - countA)
    .map(([name]) => name);
};

// Device Type Management
const DEFAULT_DEVICE_TYPES: DeviceType[] = [
  { name: 'Laptop', icon: 'Laptop', color: 'text-blue-600' },
  { name: 'Mobile', icon: 'Smartphone', color: 'text-purple-600' },
  { name: 'Tablet', icon: 'Tablet', color: 'text-indigo-600' },
  { name: 'Camera', icon: 'Camera', color: 'text-rose-600' },
  { name: 'Audio', icon: 'Headphones', color: 'text-pink-600' },
  { name: 'Accessory', icon: 'Keyboard', color: 'text-amber-600' },
  { name: 'Other', icon: 'Box', color: 'text-gray-600' },
];

// Load device types
export const loadDeviceTypes = (): DeviceType[] => {
  try {
    const serializedData = localStorage.getItem(DEVICE_TYPES_KEY);
    if (!serializedData) {
      // Return default types if no saved types
      return [...DEFAULT_DEVICE_TYPES];
    }
    const data = JSON.parse(serializedData);
    
    // 向后兼容：如果是字符串数组，转换为对象数组
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
      return data.map((name: string) => {
        const defaultType = DEFAULT_DEVICE_TYPES.find(dt => dt.name === name);
        return defaultType || { name, icon: 'Box', color: 'text-gray-600' };
      });
    }
    
    return data;
  } catch (error) {
    console.error('Failed to load device types:', error);
    return [...DEFAULT_DEVICE_TYPES];
  }
};

// Save device types
export const saveDeviceTypes = (types: DeviceType[]): void => {
  try {
    localStorage.setItem(DEVICE_TYPES_KEY, JSON.stringify(types));
  } catch (error) {
    console.error('Failed to save device types:', error);
    throw error;
  }
};

// Add new device type
export const addDeviceType = (type: string, icon: string = 'Box', color: string = 'text-gray-600'): void => {
  if (!type || !type.trim()) {
    throw new Error('Device type cannot be empty');
  }
  
  const types = loadDeviceTypes();
  const trimmedType = type.trim();
  
  if (types.some(t => t.name === trimmedType)) {
    throw new Error('Device type already exists');
  }
  
  types.push({ name: trimmedType, icon, color });
  saveDeviceTypes(types);
};

// Update device type icon
export const updateDeviceTypeIcon = (typeName: string, icon: string, color?: string): void => {
  const types = loadDeviceTypes();
  const typeIndex = types.findIndex(t => t.name === typeName);
  
  if (typeIndex === -1) {
    throw new Error('Device type not found');
  }
  
  types[typeIndex] = {
    ...types[typeIndex],
    icon,
    color: color || types[typeIndex].color || 'text-gray-600'
  };
  
  saveDeviceTypes(types);
};

// Delete device type
export const deleteDeviceType = (type: string, currentDevices: Device[]): void => {
  // Check if type is being used by any device
  const isInUse = currentDevices.some(device => device.type === type);
  if (isInUse) {
    throw new Error(`Cannot delete device type "${type}" because it is being used by existing devices`);
  }
  
  const types = loadDeviceTypes();
  const filteredTypes = types.filter(t => t.name !== type);
  
  if (filteredTypes.length === 0) {
    throw new Error('Cannot delete the last device type');
  }
  
  saveDeviceTypes(filteredTypes);
};