import React, { useState, useEffect } from 'react';
import api from '../api/client';
import type { Task, Category, User, TaskStatus, Priority } from '../types';
import { X, Calendar, Tag, AlertCircle, Users, Loader2 } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taskToEdit?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  taskToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [collaboratorIds, setCollaboratorIds] = useState<string[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // โหลดรายชื่อ Categories และ Users ที่สามารถแท็กได้
  useEffect(() => {
    if (isOpen) {
      const loadOptions = async () => {
        try {
          const [catRes, userRes] = await Promise.all([
            api.get('/categories'),
            api.get('/users'),
          ]);
          setCategories(catRes.data.categories);
          setAvailableUsers(userRes.data.users);
        } catch (err) {
          console.error('Failed to load modal options', err);
        }
      };
      loadOptions();
    }
  }, [isOpen]);

  // เมื่อเปิด Modal หรือเปลี่ยน taskToEdit ให้ใส่ข้อมูลตั้งต้น
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status);
      setPriority(taskToEdit.priority);
      setCategoryId(taskToEdit.categoryId || '');
      setCollaboratorIds(taskToEdit.collaborators?.map((c) => c.user.id) || []);
      if (taskToEdit.dueDate) {
        // แปลง ISO Date string ให้อยู่ในฟอร์แมต YYYY-MM-DDTHH:mm
        const d = new Date(taskToEdit.dueDate);
        const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setDueDate(iso);
      } else {
        setDueDate('');
      }
    } else {
      // โหมดสร้างใหม่
      setTitle('');
      setDescription('');
      setStatus('TODO');
      setPriority('MEDIUM');
      setDueDate('');
      setCategoryId('');
      setCollaboratorIds([]);
    }
    setError('');
  }, [taskToEdit, isOpen]);

  const toggleCollaborator = (userId: string) => {
    setCollaboratorIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        categoryId: categoryId || null,
        collaboratorIds,
      };

      if (taskToEdit) {
        await api.patch(`/tasks/${taskToEdit.id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกงาน');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            {taskToEdit ? 'แก้ไขงาน' : 'สร้างงานใหม่'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              ชื่องาน <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="ระบุชื่องาน..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">รายละเอียดเพิ่มเติม</label>
            <textarea
              rows={3}
              placeholder="รายละเอียดงาน..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> หมวดหมู่
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value="">(ไม่มีหมวดหมู่)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ความสำคัญ</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value="LOW">ต่ำ (Low)</option>
                <option value="MEDIUM">ปานกลาง (Medium)</option>
                <option value="HIGH">สูง (High)</option>
              </select>
            </div>
          </div>

          {/* Status & Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">สถานะ</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value="TODO">To Do (รอดำเนินการ)</option>
                <option value="IN_PROGRESS">In Progress (กำลังทำ)</option>
                <option value="DONE">Done (เสร็จสิ้น)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> กำหนดส่ง (Due Date)
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Tag Collaborators */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> แท็กผู้ที่เกี่ยวข้อง (Collaborators)
            </label>
            {availableUsers.length === 0 ? (
              <p className="text-xs text-slate-400 italic">ยังไม่มีผู้ใช้คนอื่นในระบบสำหรับแท็ก</p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg">
                {availableUsers.map((u) => {
                  const isTagged = collaboratorIds.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleCollaborator(u.id)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition flex items-center gap-1.5 ${
                        isTagged
                          ? 'bg-indigo-600 border-indigo-600 text-white font-medium shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span>{u.name}</span>
                      {isTagged && <span>✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {taskToEdit ? 'บันทึกการแก้ไข' : 'สร้างงาน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
