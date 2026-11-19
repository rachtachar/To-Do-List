import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import type { Task, Category, TaskStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { TaskModal } from './TaskModal';
import { 
  Plus, 
  Search, 
  Clock, 
  Calendar, 
  Trash2, 
  Edit3, 
  AlertCircle,
  Users,
  Loader2 
} from 'lucide-react';

export const TaskManager: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'created_by_me' | 'tagged_to_me'>('all');
  const [sortBy, setSortBy] = useState<'createdAt_desc' | 'dueDate_asc' | 'dueDate_desc'>('createdAt_desc');
  const [dueFilter, setDueFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedPriority) params.priority = selectedPriority;
      if (filterType !== 'all') params.filterType = filterType;
      if (sortBy) params.sortBy = sortBy;
      if (dueFilter) params.dueFilter = dueFilter;

      const res = await api.get('/tasks', { params });
      setTasks(res.data.tasks);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedStatus, selectedPriority, filterType, sortBy, dueFilter]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 250); // debounce search
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error('Failed to update task status', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบงานนี้?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  const isOverdue = (dueDate?: string, status?: TaskStatus) => {
    if (!dueDate || status === 'DONE') return false;
    return new Date(dueDate).getTime() < Date.now();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">รายการงานทั้งหมด</h2>
          <p className="text-xs text-slate-500 mt-0.5">จัดการงาน กรองหมวดหมู่ และติดตามความคืบหน้า</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTaskToEdit(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-100 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            สร้างงานใหม่
          </button>
        </div>
      </div>

      {/* 2. Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหางานตามชื่อ หรือคำอธิบาย..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Filters Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Ownership Filter */}
          <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                filterType === 'all' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setFilterType('created_by_me')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                filterType === 'created_by_me' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              งานของฉัน
            </button>
            <button
              onClick={() => setFilterType('tagged_to_me')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                filterType === 'tagged_to_me' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              งานที่ถูกแท็ก
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none"
          >
            <option value="">ทุกสถานะ</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none"
          >
            <option value="">ทุกหมวดหมู่</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none"
          >
            <option value="">ทุกระดับความสำคัญ</option>
            <option value="LOW">ต่ำ (Low)</option>
            <option value="MEDIUM">ปานกลาง (Medium)</option>
            <option value="HIGH">สูง (High)</option>
          </select>

          {/* Due Date Filter */}
          <select
            value={dueFilter}
            onChange={(e) => setDueFilter(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none"
          >
            <option value="">ทุกช่วงเวลา</option>
            <option value="overdue">⚠️ เกินกำหนดส่ง (Overdue)</option>
            <option value="next_7_days">📅 ส่งเร็วๆ นี้ (ภายใน 7 วัน)</option>
          </select>

          {/* Sort By Dropdown (เรียงตามกำหนดเวลา ส่งก่อน vs ส่งหลัง) */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold rounded-lg focus:outline-none cursor-pointer"
            title="เรียงลำดับรายการงาน"
          >
            <option value="createdAt_desc">🆕 สร้างล่าสุด</option>
            <option value="dueDate_asc">⏱️ ต้องส่งก่อน (ใกล้กำหนดที่สุด)</option>
            <option value="dueDate_desc">📅 ต้องส่งหลัง (กำหนดไกลสุด)</option>
          </select>

          {(search || selectedCategory || selectedStatus || selectedPriority || filterType !== 'all' || dueFilter || sortBy !== 'createdAt_desc') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
                setSelectedStatus('');
                setSelectedPriority('');
                setFilterType('all');
                setDueFilter('');
                setSortBy('createdAt_desc');
              }}
              className="text-xs text-indigo-600 hover:underline ml-auto"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>
      </div>

      {/* 3. Task List Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-2xs">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-base font-semibold text-slate-700">ไม่พบรายการงาน</h4>
          <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหา ตัวกรอง หรือกดปุ่ม "สร้างงานใหม่"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => {
            const overdue = isOverdue(task.dueDate, task.status);
            const isCreator = task.creatorId === user?.id;

            // กำหนดสีของ Card ตามสถานะของงาน
            const cardBgStyle = 
              task.status === 'DONE'
                ? 'bg-emerald-50/90 border-emerald-200/80 shadow-emerald-100/40'
                : task.status === 'IN_PROGRESS'
                ? 'bg-amber-50/90 border-amber-200/80 shadow-amber-100/40'
                : 'bg-white border-slate-200/80 shadow-slate-100/40';

            return (
              <div
                key={task.id}
                className={`${cardBgStyle} rounded-2xl p-5 border shadow-sm hover:shadow-md transition flex flex-col justify-between`}
              >
                <div>
                  {/* Category & Priority Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {task.category && (
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: task.category.color }}
                        >
                          {task.category.name}
                        </span>
                      )}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        task.priority === 'HIGH'
                          ? 'bg-red-50 text-red-600 border border-red-100'
                          : task.priority === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : 'bg-slate-50 text-slate-500 border border-slate-200'
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Status Toggle Dropdown */}
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      className={`text-xs font-semibold px-2 py-0.5 rounded-lg border focus:outline-none cursor-pointer transition ${
                        task.status === 'DONE'
                          ? 'bg-emerald-100/80 text-emerald-800 border-emerald-300'
                          : task.status === 'IN_PROGRESS'
                          ? 'bg-amber-100/80 text-amber-800 border-amber-300'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>

                  {/* Task Title */}
                  <h3 className={`text-sm font-bold text-slate-800 ${
                    task.status === 'DONE' ? 'line-through text-slate-400' : ''
                  }`}>
                    {task.title}
                  </h3>

                  {/* Description */}
                  {task.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Footer Info */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 space-y-2">
                  {/* Due Date & Overdue Warning */}
                  {task.dueDate && (
                    <div className={`flex items-center gap-1.5 text-xs ${
                      overdue ? 'text-rose-600 font-semibold' : 'text-slate-500'
                    }`}>
                      {overdue ? (
                        <AlertCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Calendar className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {new Date(task.dueDate).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {overdue && ' (เกินกำหนด)'}
                      </span>
                    </div>
                  )}

                  {/* Collaborators & Action Buttons */}
                  <div className="flex items-center justify-between pt-1">
                    {/* Tagged Collaborators */}
                    <div className="flex items-center gap-1">
                      {task.collaborators && task.collaborators.length > 0 ? (
                        <div className="flex items-center -space-x-1.5" title="ผู้ที่เกี่ยวข้อง">
                          {task.collaborators.map((c) => (
                            <div
                              key={c.user.id}
                              className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 border border-white flex items-center justify-center text-[10px] font-bold"
                              title={c.user.name}
                            >
                              {c.user.name.charAt(0).toUpperCase()}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Users className="w-3 h-3" /> เฉพาะฉัน
                        </span>
                      )}
                    </div>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setTaskToEdit(task);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="แก้ไขงาน"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {isCreator && (
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="ลบงาน"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Create/Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
        }}
        onSuccess={() => {
          fetchTasks();
          fetchCategories();
        }}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};
