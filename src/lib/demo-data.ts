import type { Worker, Task, Field, Attendance, Productivity, Payroll, ProductivityDataPoint, LaborDistributionDataPoint } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { subDays, format } from 'date-fns';

const workerImages = PlaceHolderImages.reduce((acc, img) => {
  acc[img.id] = { url: img.imageUrl, hint: img.imageHint };
  return acc;
}, {} as Record<string, { url: string; hint: string }>);

const workers: Worker[] = [
  { workerId: 'W001', name: 'John Doe', age: 34, gender: 'Male', phone: '123-456-7890', assignedField: 'North Field', employmentType: 'Permanent', wageRate: 15, status: 'Active', photoUrl: workerImages['worker1']?.url, photoHint: workerImages['worker1']?.hint },
  { workerId: 'W002', name: 'Jane Smith', age: 28, gender: 'Female', phone: '234-567-8901', assignedField: 'South Field', employmentType: 'Seasonal', wageRate: 14, status: 'Active', photoUrl: workerImages['worker2']?.url, photoHint: workerImages['worker2']?.hint },
  { workerId: 'W003', name: 'Peter Jones', age: 45, gender: 'Male', phone: '345-678-9012', assignedField: 'East Field', employmentType: 'Permanent', wageRate: 16, status: 'Active', photoUrl: workerImages['worker3']?.url, photoHint: workerImages['worker3']?.hint },
  { workerId: 'W004', name: 'Mary Williams', age: 22, gender: 'Female', phone: '456-789-0123', assignedField: 'North Field', employmentType: 'Daily Wage', wageRate: 12, status: 'Inactive', photoUrl: workerImages['worker4']?.url, photoHint: workerImages['worker4']?.hint },
  { workerId: 'W005', name: 'David Brown', age: 39, gender: 'Male', phone: '567-890-1234', assignedField: 'West Field', employmentType: 'Seasonal', wageRate: 14.5, status: 'Active', photoUrl: workerImages['worker5']?.url, photoHint: workerImages['worker5']?.hint },
];

const fields: Field[] = [
  { fieldId: 'F01', fieldName: 'North Field', size: 10, cropType: 'Maize', season: '2024 Wet Season' },
  { fieldId: 'F02', fieldName: 'South Field', size: 15, cropType: 'Rice', season: '2024 Wet Season' },
  { fieldId: 'F03', fieldName: 'East Field', size: 8, cropType: 'Tomato', season: '2024 Dry Season' },
];

const tasks: Task[] = [
  { taskId: 'T001', assignedWorkers: ['W001', 'W004'], fieldName: 'North Field', cropType: 'Maize', taskType: 'Planting', description: 'Plant maize seeds in rows, 2 feet apart.', expectedOutput: 10, actualOutput: 10, deadline: subDays(new Date(), 28).toISOString(), status: 'Completed' },
  { taskId: 'T002', assignedWorkers: ['W002'], fieldName: 'South Field', cropType: 'Rice', taskType: 'Weeding', description: 'Manual weeding of the rice paddy.', expectedOutput: 5, actualOutput: 6, deadline: subDays(new Date(), 15).toISOString(), status: 'Completed' },
  { taskId: 'T003', assignedWorkers: ['W003', 'W005'], fieldName: 'East Field', cropType: 'Tomato', taskType: 'Harvesting', description: 'Harvest ripe tomatoes carefully.', expectedOutput: 500, actualOutput: 550, deadline: subDays(new Date(), 5).toISOString(), status: 'Completed' },
  { taskId: 'T004', assignedWorkers: ['W001'], fieldName: 'North Field', cropType: 'Maize', taskType: 'Irrigation', description: 'Set up and run the drip irrigation system for 4 hours.', expectedOutput: 1, deadline: new Date().toISOString(), status: 'In Progress' },
  { taskId: 'T005', assignedWorkers: ['W002', 'W003'], fieldName: 'South Field', cropType: 'Rice', taskType: 'Fertilizer Application', description: 'Apply NPK fertilizer as per guidelines.', expectedOutput: 15, deadline: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'Pending' },
  { taskId: 'T006', assignedWorkers: ['W005'], fieldName: 'East Field', cropType: 'Tomato', taskType: 'Planting', description: 'Plant tomato seedlings.', expectedOutput: 2, deadline: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'Pending' },
];

const attendance: Attendance[] = [
  { attendanceId: 'A001', workerId: 'W001', date: subDays(new Date(), 1).toISOString(), clockIn: '08:00', clockOut: '17:00', totalHours: 8 },
  { attendanceId: 'A002', workerId: 'W002', date: subDays(new Date(), 1).toISOString(), clockIn: '08:15', clockOut: '17:00', totalHours: 7.75 },
  { attendanceId: 'A003', workerId: 'W003', date: subDays(new Date(), 1).toISOString(), clockIn: '07:55', clockOut: '16:30', totalHours: 7.58 },
  { attendanceId: 'A004', workerId: 'W005', date: subDays(new Date(), 1).toISOString(), clockIn: '08:05', clockOut: '17:05', totalHours: 8 },
];

const productivity: Productivity[] = [
  { productivityId: 'P001', workerId: 'W003', fieldId: 'F03', date: subDays(new Date(), 5).toISOString(), outputQuantity: 280, hoursWorked: 8 },
  { productivityId: 'P002', workerId: 'W005', fieldId: 'F03', date: subDays(new Date(), 5).toISOString(), outputQuantity: 270, hoursWorked: 8 },
  { productivityId: 'P003', workerId: 'W001', fieldId: 'F01', date: subDays(new Date(), 28).toISOString(), outputQuantity: 10, hoursWorked: 8 },
];

const payroll: Payroll[] = [
  { payrollId: 'PAY01', workerId: 'W001', totalHours: 160, totalPayment: 2400, month: '2024-07' },
  { payrollId: 'PAY02', workerId: 'W002', totalHours: 150, totalPayment: 2100, month: '2024-07' },
  { payrollId: 'PAY03', workerId: 'W003', totalHours: 168, totalPayment: 2688, month: '2024-07' },
  { payrollId: 'PAY05', workerId: 'W005', totalHours: 155, totalPayment: 2247.5, month: '2024-07' },
];

const productivityTrend: ProductivityDataPoint[] = [
  { date: format(subDays(new Date(), 28), 'MMM d'), output: 350 },
  { date: format(subDays(new Date(), 21), 'MMM d'), output: 410 },
  { date: format(subDays(new Date(), 14), 'MMM d'), output: 380 },
  { date: format(subDays(new Date(), 7), 'MMM d'), output: 450 },
  { date: format(new Date(), 'MMM d'), output: 420 },
];

const laborDistribution: LaborDistributionDataPoint[] = [
  { crop: 'Maize', workers: 15 },
  { crop: 'Rice', workers: 12 },
  { crop: 'Tomato', workers: 8 },
  { crop: 'Cassava', workers: 5 },
];

export const demoData = {
  workers,
  fields,
  tasks,
  attendance,
  productivity,
  payroll,
  productivityTrend,
  laborDistribution,
};
