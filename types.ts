export type DeviceStatus = 'available' | 'borrowed';

export interface Device {
  id: string;
  name: string;
  type: string;
  image?: string; // Base64 data string
  status: DeviceStatus;
  borrower?: string; // Name of the person currently borrowing it
  lastUpdated: number;
}

export type ActionType = 'add' | 'borrow' | 'return' | 'delete';

export interface HistoryRecord {
  id: string;
  deviceId: string;
  deviceName: string;
  action: ActionType;
  borrower?: string;
  timestamp: number;
}

export interface AppData {
  devices: Device[];
  history: HistoryRecord[];
}