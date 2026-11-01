import React from 'react';
import {
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Map,
  Settings,
  ShieldCheck,
  QrCode,
  Users,
  WalletCards
} from 'lucide-react';

const officeItems = [
  { id: 'overview', label: 'الرئيسية', icon: LayoutDashboard },
  { id: 'properties', label: 'عقاراتي', icon: Building2 },
  { id: 'add-property', label: 'إضافة عقار', icon: Building2 },
  { id: 'contracts', label: 'الإيجارات والعقود', icon: FileText },
  { id: 'appointments', label: 'المواعيد والمهام', icon: CalendarDays },
  { id: 'analytics', label: 'التحليلات', icon: BarChart3 },
  { id: 'leads', label: 'العملاء المحتملون', icon: Users },
  { id: 'employees', label: 'الموظفون والصلاحيات', icon: ShieldCheck },
  { id: 'subscription', label: 'الاشتراك والحدود', icon: WalletCards },
  { id: 'qr-cards', label: 'QR والبطاقات الاجتماعية', icon: QrCode },
  { id: 'settings', label: 'الإعدادات', icon: Settings }
];

const adminItems = [
  { id: 'overview', label: 'الرئيسية', icon: LayoutDashboard },
  { id: 'agencies', label: 'المكاتب', icon: Building2 },
  { id: 'plans', label: 'الباقات', icon: WalletCards },
  { id: 'payments', label: 'المدفوعات', icon: WalletCards },
  { id: 'properties', label: 'العقارات', icon: Building2 },
  { id: 'locations', label: 'المناطق', icon: Map },
  { id: 'users', label: 'المستخدمون', icon: Users },
  { id: 'notifications', label: 'الإشعارات', icon: Bell },
  { id: 'policies', label: 'السياسات والأمان', icon: ShieldCheck },
  { id: 'settings', label: 'الإعدادات', icon: Settings }
];

export default function DashboardSidebar({ kind = 'office', activeItem = 'overview', onNavigate }) {
  const isAdmin = kind === 'admin';
  const items = isAdmin ? adminItems : officeItems;

  return (
    <aside className="w-full lg:w-64 lg:shrink-0 bg-[#0f172a] text-white rounded-3xl lg:rounded-2xl p-4 lg:p-5 lg:min-h-[calc(100vh-140px)]">
      <div className="flex items-center gap-3 px-2 pb-5 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
          {isAdmin ? <ShieldCheck className="w-5 h-5 text-sky-300" /> : <Building2 className="w-5 h-5 text-sky-300" />}
        </div>
        <div>
          <div className="font-black text-sm">EngProp</div>
          <div className="text-[11px] text-slate-400">{isAdmin ? 'إدارة المنصة' : 'لوحة المكتب'}</div>
        </div>
      </div>

      <nav className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-2 mt-5">
        {items.map(({ id, label, icon: Icon }) => {
          const active = activeItem === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate?.(id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-right text-xs font-bold transition-colors ${
                active
                  ? 'bg-[#1e3a5f] text-white'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-sky-300' : 'text-slate-400'}`} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
