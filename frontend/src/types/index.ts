export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  _count?: { tasks: number };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  categoryId?: string;
  category?: Category;
  creatorId: string;
  creator: User;
  collaborators: {
    user: User;
    taggedAt: string;
  }[];
  createdAt: string;
}

export interface DashboardSummary {
  summary: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    overdue: number;
  };
  tasksByCategory: {
    name: string;
    count: number;
    color: string;
  }[];
  upcomingDeadlines: Task[];
}