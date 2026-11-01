import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle,
  ArrowUpRight
} from 'lucide-react';

export default function Footer({ setActivePage }) {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800 text-sm">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold">عقارات موثقة 100%</h4>
              <p className="text-xs text-slate-400">فحص وتدقيق لسندات الملكية والوثائق</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold">مكاتب عقارية مرخصة</h4>
              <p className="text-xs text-slate-400">شبكة معتمدة من أفضل مكاتب الوساطة</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold">حجز معاينة فوري</h4>
              <p className="text-xs text-slate-400">تنسيق مواعيد مرن وتواصل مباشر عبر واتساب</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12">
          {/* Col 1: About */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <img src="/assets/engprop-logo.png" alt="EngProp" className="h-12 w-auto object-contain" />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              المنصة العقارية السورية الرائدة التي تجمع بين المكاتب العقارية المعتمدة والباحثين عن العقارات. نوفر تجربة عصرية متكاملة تشمل البحث الذكي، الخريطة التفاعلية، إدارة الإيجارات، وحجز مواعيد المعاينة بسهولة وأمان.
            </p>
            <div className="pt-2">
              <span className="text-xs text-slate-500">نسخة 2026 الرسمية</span>
            </div>
          </div>

          {/* Col 2: العقارات حسب المدن */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">عقارات حسب المنطقة</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button 
                  onClick={() => setActivePage('properties')} 
                  className="hover:text-white transition-colors flex items-center justify-between w-full"
                >
                  <span>عقارات إعزاز (شقق وفلل)</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('properties')} 
                  className="hover:text-white transition-colors flex items-center justify-between w-full"
                >
                  <span>عقارات دمشق والميدان</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('properties')} 
                  className="hover:text-white transition-colors flex items-center justify-between w-full"
                >
                  <span>عقارات حلب والشهباء</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('properties')} 
                  className="hover:text-white transition-colors flex items-center justify-between w-full"
                >
                  <span>ريف حلب وعفرين</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: روابط سريعة */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">الخدمات والأدوات</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => setActivePage('properties')} className="hover:text-white transition-colors">
                  تصفح كافة العقارات
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('map')} className="hover:text-white transition-colors">
                  الخريطة التفاعلية
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('agencies')} className="hover:text-white transition-colors">
                  دليل المكاتب العقارية
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('compare')} className="hover:text-white transition-colors">
                  أداة مقارنة العقارات
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('office-dashboard')} className="hover:text-white transition-colors">
                  لوحة تحكم المكتب العقاري
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: تواصل ودعم */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide">التواصل والدعم</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <span dir="ltr" className="text-slate-300">+963 955 123 456</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="text-slate-300">support@engprop.sy</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <span>إعزاز - طريق عفرين / دمشق - الميدان</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 EngProp. جميع الحقوق محفوظة لفرع التكنولوجيا العقارية والذكاء الصنعي.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">سياسة الخصوصية</span>
            <span className="hover:text-slate-400 cursor-pointer">شروط الاستخدام</span>
            <span className="hover:text-slate-400 cursor-pointer">توثيق المكاتب</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
