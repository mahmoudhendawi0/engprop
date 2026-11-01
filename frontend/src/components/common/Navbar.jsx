import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Heart, 
  Scale, 
  PlusCircle, 
  Menu, 
  X, 
  ShieldCheck, 
  Briefcase, 
  UserCheck, 
  Home
} from 'lucide-react';

export default function Navbar({ 
  activePage, 
  setActivePage, 
  favoritesCount = 0, 
  compareList = [], 
  onOpenAuth,
  user = null,
  onLogout
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const canManageOffice = user?.role === 'office' || user?.role === 'admin';
  const isSuperAdmin = user?.role === 'admin';

  const navLinks = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'properties', label: 'تصفح العقارات', icon: Building2 },
    { id: 'map', label: 'خريطة العقارات', icon: MapPin },
    { id: 'agencies', label: 'دليل المكاتب', icon: Briefcase },
    { 
      id: 'compare', 
      label: 'المقارنة', 
      icon: Scale, 
      badge: compareList.length > 0 ? compareList.length : null 
    },
    { 
      id: 'favorites', 
      label: 'المفضلة', 
      icon: Heart, 
      badge: favoritesCount > 0 ? favoritesCount : null 
    },
    ...(canManageOffice ? [{ id: 'office-dashboard', label: 'لوحة المكتب', icon: UserCheck }] : []),
    ...(isSuperAdmin ? [{ id: 'super-admin', label: 'السوبر أدمن', icon: ShieldCheck }] : [])
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      {/* Top micro bar with fast market banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              سوق العقارات السوري 2026: عقارات موثقة رسمياً
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">متوسط سعر المتر بإعزاز: $690 | دمشق: $1,250 | حلب: $820</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span>دعم فني: +963 955 123 456</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => setActivePage('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <img 
            src="/assets/engprop-logo.png" 
            alt="EngProp Logo" 
            className="h-16 w-auto object-contain group-hover:scale-105 transition-transform" 
          />
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden xl:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActivePage(link.id)}
                className={`relative px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive 
                    ? 'bg-sky-50 text-sky-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="bg-sky-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center -mr-1 shadow-xs animate-bounce">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Actions (AI Search & Add Property) */}
        <div className="hidden sm:flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-2.5 py-2 rounded-xl">
              <div className="text-right">
                <div className="text-[10px] text-slate-500">مرحباً</div>
                <div className="text-xs font-black text-slate-800 truncate max-w-[100px]">{user.name || user.email}</div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-white text-[10px] font-bold"
              >
                خروج
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold shadow-md transition-all cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>تسجيل الدخول</span>
            </button>
          )}

          {/* Add Property Button */}
          {canManageOffice && (
            <button
              onClick={() => setActivePage('add-property')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-sm font-bold shadow-md shadow-sky-600/20 hover:shadow-lg hover:shadow-sky-600/30 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة عقار</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 xl:hidden">
          {user ? (
            <button
              type="button"
              onClick={onLogout}
              className="px-2.5 py-2 rounded-lg bg-slate-800 text-white text-[10px] font-bold"
            >
              خروج
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-2.5 py-2 rounded-lg bg-slate-900 text-white text-[10px] font-bold"
            >
              دخول
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-2 pt-2 pb-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activePage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActivePage(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-right transition-colors ${
                    isActive 
                      ? 'bg-sky-500 text-white' 
                      : 'text-slate-700 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{link.label}</span>
                  {link.badge && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full mr-auto ${isActive ? 'bg-white text-sky-600' : 'bg-sky-600 text-white'}`}>
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {canManageOffice && (
              <button
                onClick={() => {
                  setActivePage('add-property');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-sky-600 text-white font-bold rounded-xl shadow-md"
              >
                <PlusCircle className="w-5 h-5" />
                <span>إضافة عقار جديد</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
