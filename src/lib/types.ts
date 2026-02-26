

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

export interface FarmTask {
  id?: string;
  fieldId: string;
  cropType: CropType;
  taskType: TaskType;
  description: string;
  expectedOutput: number;
  expectedOutputUnit: string;
  deadline: string; // ISO 8601
  assignedWorkerIds: string[]; // array of workerIds
  status: TaskStatus;
  managerId: string;
  createdAt: string;
  completedAt?: string;
}

export interface FarmField {
  id?: string;
  name: string;
  size: number;
  sizeUnit: string;
  cropType: string;
  season: string;
  managerId: string;
  createdAt: string;
}

export interface ProductivityEntry {
    id?: string;
    workerId: string;
    fieldId: string;
    taskId: string;
    date: string; // ISO Date string
    outputQuantity: number;
    outputUnit: string;
    hoursWorkedForEntry: number;
    notes?: string;
    createdAt: string; // ISO DateTime string
}


export interface PayrollSummary {
  id?: string;
  workerId: string;
  month: number;
  year: number;
  totalHoursWorkedMonth: number;
  totalTaskBasedPayment: number;
  effectiveWageRate: number;
  effectiveWageRateUnit: string;
  totalPaymentDue: number;
  generatedAt: string; // ISO DateTime string
}

export interface ProductivityDataPoint {
  date: string;
  output: number;
}

export interface LaborDistributionDataPoint {
  crop: CropType;
  workers: number;
}
