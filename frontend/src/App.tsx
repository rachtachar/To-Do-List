import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { TaskManager } from './components/TaskManager';
import {
  CheckSquare,
  LayoutDashboard,
  ListTodo,
  LogOut,
  User as UserIcon,
  Loader2
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks'>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-900 leading-tight">To-Do List</h1>
              <span className="text-[10px] text-slate-400 font-medium">To-Do List & Dashboard</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'dashboard'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === 'tasks'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <ListTodo className="w-4 h-4" />
              <span>รายการงาน (Tasks)</span>
            </button>
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-right">
              <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                <UserIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
                <p className="text-[10px] text-slate-400">{user.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' ? <Dashboard /> : <TaskManager />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
