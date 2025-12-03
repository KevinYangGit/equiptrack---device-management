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