export type Role = 'ADMIN' | 'USER';
export type TaskStatus = 'PENDING' | 'COMPLETED' | 'IN_PROGRESS' | 'ARCHIVED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type Level = 'Bronze' | 'Prata' | 'Ouro' | 'Platina' | 'Diamante';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  points: number;
  level: Level;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  assigned_to: number;
  assigned_name?: string;
  status: TaskStatus;
  priority: Priority;
  start_date?: string;
  due_date: string;
  attachment?: string;
  created_at: string;
  completed_at?: string;
  assignment_type?: 'INDIVIDUAL' | 'GROUP';
  assigned_users?: number[];
}

export interface Goal {
  id: number;
  title: string;
  target_value: number;
  current_value: number;
  type: 'COMPANY' | 'INDIVIDUAL';
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  status: 'PENDING' | 'COMPLETED';
  start_date?: string;
  user_id: number;
  assigned_users?: number[];
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: 'PRAISE' | 'ADJUSTMENT' | 'TASK_COMPLETED' | 'SYSTEM';
  message: string;
  task_id?: number;
  is_read: boolean;
  created_at: string;
  praise_id?: number;
}

export interface Praise {
  id: number;
  admin_id: number;
  user_id: number;
  task_id: number;
  message: string;
  points_awarded: number;
  type: 'PRAISE' | 'ADJUSTMENT';
  created_at: string;
}
