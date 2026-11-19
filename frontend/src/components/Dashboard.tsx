import React, { useEffect, useState } from 'react';
import api from '../api/client';
import type { DashboardSummary } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ListTodo, 
  Calendar, 
  TrendingUp,
  Loader2 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/summary');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard summary', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-slate-500">
        ไม่พบข้อมูลสถิติ
      </div>
    );
  }

  const statusPieData = [
    { name: 'To Do', value: data.summary.todo, color: '#94A3B8' },
    { name: 'In Progress', value: data.summary.inProgress, color: '#3B82F6' },
    { name: 'Completed', value: data.summary.completed, color: '#10B981' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* 1. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">งานทั้งหมด</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{data.summary.total}</h3>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <ListTodo className="w-6 h-6" />
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">กำลังทำ</p>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">{data.summary.inProgress}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ทำเสร็จแล้ว</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{data.summary.completed}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">เกินกำหนดส่ง (Overdue)</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">{data.summary.overdue}</h3>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* กราฟแท่ง: งานแยกตามหมวดหมู่ */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              จำนวนงานแยกตามหมวดหมู่
            </h3>
          </div>
          {data.tasksByCategory.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
              ยังไม่มีข้อมูลหมวดหมู่
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.tasksByCategory}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* กราฟวงกลม: สัดส่วนสถานะงาน */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-4">สัดส่วนสถานะงาน (Status Breakdown)</h3>
          {statusPieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
              ยังไม่มีรายการงาน
            </div>
          ) : (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 pr-4 shrink-0 whitespace-nowrap">
                {statusPieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span>{item.name}: <strong>{item.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Upcoming Deadlines */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-indigo-600" />
          งานที่ใกล้ถึงกำหนดส่งเร็วๆ นี้ (Upcoming Deadlines)
        </h3>
        {data.upcomingDeadlines.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">ไม่มีงานที่ใกล้กำหนดส่งในช่วงนี้</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.upcomingDeadlines.map((task) => (
              <div key={task.id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">{task.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {task.category && (
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                        style={{ backgroundColor: task.category.color }}
                      >
                        {task.category.name}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      ครบกำหนด: {task.dueDate ? new Date(task.dueDate).toLocaleDateString('th-TH') : '-'}
                    </span>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  task.status === 'IN_PROGRESS' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {task.status === 'IN_PROGRESS' ? 'กำลังทำ' : 'รอดำเนินการ'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
