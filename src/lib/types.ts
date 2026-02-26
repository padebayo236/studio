
export type UserRole = 'Admin' | 'FarmManager' | 'FarmWorker' | 'Accountant';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  phoneNumber?: string;
  lastLoginAt?: string;
}

export type EmploymentType = 'Permanent' | 'Seasonal' | 'Daily Wage';
export type WorkerStatus = 'Active' | 'Inactive';

export interface Worker {
  id?: string;
  workerId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  address: string;
  assignedField: string;
  employmentType: EmploymentType;
  wageRate: number; // per hour
  status: WorkerStatus;
  photoUrl: string;
  photoHint: string;
}

export interface AttendanceRecord {
  id?: string;
  workerId: string;
  date: string; // "yyyy-MM-dd"
  timeIn: string; // ISO string
  timeOut: string | null; // ISO string
  totalHoursWorked: number | null;
  createdAt?: string; // ISO string
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
