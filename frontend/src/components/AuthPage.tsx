import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { CheckSquare, Lock, Mail, User as UserIcon, Loader2 } from 'lucide-react';

export const AuthPage: React.FC = () => {
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const res = await api.post('/auth/login', { email, password });
                login(res.data.token, res.data.user);
            } else {
                await api.post('/auth/register', { name, email, password });
                // สมัครเสร็จแล้วล็อกอินให้อัตโนมัติทันที
                const loginRes = await api.post('/auth/login', { email, password });
                login(loginRes.data.token, loginRes.data.user);
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
            } else {
                setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
                {/* โลโก้ & หัวข้อ */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 mb-3">
                        <CheckSquare className="w-7 h-7" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">To-Do List</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {isLogin ? 'ยินดีต้อนรับกลับเข้าสู่ระบบ' : 'สร้างบัญชีผู้ใช้ใหม่เพื่อเริ่มต้น'}
                    </p>
                </div>

                {/* ข้อความแจ้งเตือน Error */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">ชื่อ-นามสกุล</label>
                            <div className="relative">
                                <UserIcon className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                                <input
                                    type="text"
                                    required
                                    placeholder="เช่น สมชาย ใจดี"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">อีเมล</label>
                        <div className="relative">
                            <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="email"
                                required
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">รหัสผ่าน</label>
                        <div className="relative">
                            <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md shadow-indigo-100 flex items-center justify-center transition disabled:opacity-50 mt-2"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isLogin ? (
                            'เข้าสู่ระบบ'
                        ) : (
                            'สมัครสมาชิก'
                        )}
                    </button>
                </form>

                {/* สลับไป-มาระหว่าง Login และ Register */}
                <div className="mt-6 text-center text-xs text-slate-500">
                    {isLogin ? 'ยังไม่มีบัญชีใช่หรือไม่?' : 'มีบัญชีอยู่แล้ว?'}{' '}
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        className="text-indigo-600 font-semibold hover:underline"
                    >
                        {isLogin ? 'สมัครสมาชิกที่นี่' : 'เข้าสู่ระบบ'}
                    </button>
                </div>
            </div>
        </div>
    );
};