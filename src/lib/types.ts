export type UserRole = 'Admin' | 'Farm Manager' | 'Farm Worker';

export interface User {
  userId: string;
  name: string;
  role: UserRole;
  email: string;
  phone?: string;
  avatarUrl?: string;
}

export interface Worker {
  workerId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  assignedField: string;
  employmentType: 'Permanent' | 'Seasonal' | 'Daily Wage';
  wageRate: number; // per hour
  status: 'Active' | 'Inactive';
  photoUrl: string;
  photoHint: string;
}

export interface Attendance {
  attendanceId: string;
  workerId: string;
  date: string; // ISO 8601
  clockIn: string; // ISO 8601
  clockOut: string; // ISO 8601
  totalHours: number;
}

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type CropType = 'Maize' | 'Rice' | 'Tomato' | 'Cassava' | 'Other';
export type TaskType = 'Planting' | 'Weeding' | 'Harvesting' | 'Irrigation' | 'Fertilizer Application';

export interface Task {
  taskId: string;
  assignedWorkers: string[]; // array of workerIds
  fieldName: string;
  cropType: CropType;
  taskType: TaskType;
  description: string;
  expectedOutput: number; // e.g., 200kg
  actualOutput?: number;
  deadline: string; // ISO 8601
  status: TaskStatus;
}

export interface Field {
  fieldId: string;
  fieldName: string;
  size: number; // in acres
  cropType: CropType;
  season: string; // e.g., "2024 Wet Season"
}

export interface Productivity {
  productivityId: string;
  workerId: string;
  fieldId: string;
  date: string; // ISO 8601
  outputQuantity: number; // in kg
  hoursWorked: number;
}

export interface Payroll {
  payrollId: string;
  workerId: string;
  totalHours: number;
  totalPayment: number;
  month: string; // e.g., "2024-07"
}

export interface ProductivityDataPoint {
  date: string;
  output: number;
}

export interface LaborDistributionDataPoint {
  crop: CropType;
  workers: number;
}
