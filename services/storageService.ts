import { AppData, Device, HistoryRecord } from '../types';

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