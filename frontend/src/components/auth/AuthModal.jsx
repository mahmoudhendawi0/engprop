import React, { useState } from 'react';
import { X, User, Lock, Mail, Sparkles } from 'lucide-react';
import { loginUser, registerUser } from '../../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('user@engprop.sy');
  const [password, setPassword] = useState('user123');
  const [accountType, setAccountType] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const requester = mode === 'login' ? loginUser : registerUser;
      const user = await requester({
        name: mode === 'register' ? name : 'User',
        email,
        password,
        role: accountType
      });

      if (onAuthSuccess) {
        onAuthSuccess(user);
      }
      onClose();
    } catch (submitError) {
      setError(submitError.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[28px] w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-sky-950 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute left-5 top-5 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-sky-300 text-xs font-bold mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>بوابة المستخدمين</span>
          </div>
          <h3 className="text-xl font-black">{mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h3>
          <p className="text-xs text-slate-300 mt-1">تسجيل دخول سريع للوصول إلى المفضلة والمقارنة والحجز</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">الاسم الكامل</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full pr-10 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="مثال: أحمد محمد"
                  required
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">نوع الحساب</label>
              <select
                value={accountType}
                onChange={(event) => setAccountType(event.target.value)}
                className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="user">مستخدم عادي</option>
                <option value="office">مكتب عقاري</option>
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full pr-10 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">كلمة المرور</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full pr-10 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-bold px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold disabled:opacity-60"
          >
            {loading ? 'جاري المعالجة...' : mode === 'login' ? 'دخول' : 'إنشاء الحساب'}
          </button>

          <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-600">
            <span>{mode === 'login' ? 'لا تملك حساباً؟' : 'هل لديك حساب؟'}</span>
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="mr-2 font-bold text-sky-700 hover:text-sky-800"
            >
              {mode === 'login' ? 'إنشاء حساب' : 'تسجيل دخول'}
            </button>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
            المستخدم: user@engprop.sy / user123<br />
            المكتب: office@engprop.sy / office123<br />
            السوبر أدمن: admin@engprop.sy / admin123
          </div>
        </form>
      </div>
    </div>
  );
}
