import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Search,
  PlusCircle, 
  FileText, 
  Calendar, 
  Eye, 
  Trash2, 
  UploadCloud,
  ArrowUpRight,
  Clock3,
  TrendingUp,
  Users,
  Phone,
  MoreHorizontal
} from 'lucide-react';
import { properties, contractsList } from '../data/propertiesData';
import { appointmentsData } from '../data/contractsData';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import SettingsPanel from '../components/dashboard/SettingsPanel';
import OfficeManagementModules from '../components/dashboard/OfficeManagementModules';
import { deleteAgencyProperty, getAgencyAppointments, getAgencyRentals, moderateAdminProperty, renewAgencyRental, updateAgencyAppointment, updateAgencyRental } from '../services/api';

export default function OfficeDashboard({ setActivePage, onSelectProperty, isAdmin = false }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [localProperties, setLocalProperties] = useState(properties);
  const [localContracts, setLocalContracts] = useState(contractsList);
  const [reminderDays, setReminderDays] = useState(() => Number(localStorage.getItem('engprop_contract_reminder_days') || 30));
  const [appointments, setAppointments] = useState(appointmentsData);
  const [propertyQuery, setPropertyQuery] = useState('');
  const [officeCover, setOfficeCover] = useState(() => localStorage.getItem('engprop_office_cover') || '/assets/properties/office_damascus.jpg');
  const [contractView, setContractView] = useState('list');
  const [selectedContract, setSelectedContract] = useState(null);
  const [backendNotice, setBackendNotice] = useState('');
  const [deletingPropertyId, setDeletingPropertyId] = useState(null);
  useEffect(() => {
    Promise.all([getAgencyAppointments(), getAgencyRentals()])
      .then(([appointmentsResponse, rentalsResponse]) => {
        if (appointmentsResponse.items?.length) {
          setAppointments(appointmentsResponse.items.map(item => ({
            id: item.id,
            ...(item.data || {}),
            status: item.status,
            preferredDate: item.starts_at?.slice(0, 10) || item.data?.preferredDate || 'غير محدد'
          })));
        }
        if (rentalsResponse.items?.length) {
          setLocalContracts(rentalsResponse.items.map(item => ({
            id: item.id,
            ...(item.data || {}),
            startDate: item.start_date,
            endDate: item.end_date,
            status: item.status,
            daysRemaining: Math.ceil((new Date(item.end_date) - new Date()) / 86400000)
          })));
        }
      })
      .catch(() => setBackendNotice('تعذر تحميل بيانات المواعيد والعقود من الخادم'));
  }, []);
  const expiringContracts = localContracts.filter((contract) => contract.daysRemaining <= 45 && contract.daysRemaining > 0);
  const expiredContracts = localContracts.filter((contract) => contract.daysRemaining <= 0);
  const monthlyViews = [38, 52, 47, 66, 58, 74, 69, 83, 78, 92, 86, 100];
  const totalViews = localProperties.reduce((total, property) => total + (property.viewsCount || 0), 0) || 4890;
  const confirmedAppointments = appointments.filter((appointment) => appointment.status === 'تم التأكيد' || appointment.status === 'مؤكد');
  const filteredProperties = localProperties.filter((property) => {
    const query = propertyQuery.trim().toLocaleLowerCase();
    if (!query) return true;
    return [property.title, property.type, property.city, property.district, property.address, property.purpose]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase()
      .includes(query);
  });

  const updateAppointmentStatus = (id, status) => {
    updateAgencyAppointment(id, status)
      .then(() => setAppointments((current) => current.map((appointment) => appointment.id === id ? { ...appointment, status } : appointment)))
      .catch(() => setBackendNotice('تعذر تحديث حالة الموعد'));
  };

  const updateContractStatus = (id, status) => {
    if (status === 'مجدد') {
      const current = localContracts.find(contract => contract.id === id);
      const nextEndDate = new Date(current?.endDate || '1970-01-01');
      nextEndDate.setFullYear(nextEndDate.getFullYear() + 1);
      renewAgencyRental(id, { endDate: nextEndDate.toISOString().slice(0, 10) })
        .then(({ contract }) => setLocalContracts(currentContracts => currentContracts.map(item => item.id === id ? {
          ...item,
          endDate: contract.end_date,
          status: 'مجدد',
          daysRemaining: Math.ceil((new Date(contract.end_date) - new Date()) / 86400000),
          alerts: 'تم تجديد العقد'
        } : item)))
        .catch(() => setBackendNotice('تعذر تجديد العقد'));
      return;
    }
    const backendStatus = status === 'منتهٍ' ? 'terminated' : status === 'مجدد' ? 'renewed' : 'active';
    updateAgencyRental(id, { status: backendStatus })
      .then(() => setLocalContracts((current) => current.map((contract) => contract.id === id ? { ...contract, status, alerts: status === 'منتهٍ' ? 'تم إنهاء العقد' : 'تم تحديث حالة العقد' } : contract)))
      .catch(() => setBackendNotice('تعذر تحديث العقد'));
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-gradient-to-l from-sky-600 to-blue-700 text-white rounded-3xl p-6 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs text-sky-100 font-bold">ملخص أداء المكتب</span>
              <h2 className="text-2xl font-black mt-2">أهلاً بك في لوحة المكتب</h2>
              <p className="text-xs text-sky-100 mt-2 max-w-lg leading-6">تابع عقاراتك ومواعيدك وعقودك من مكان واحد، واتخذ الإجراء المناسب بسرعة.</p>
            </div>
            <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/15 items-center justify-center"><TrendingUp className="w-7 h-7" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-7">
            <div className="rounded-2xl bg-white/10 p-3"><span className="block text-[11px] text-sky-100">نسبة الاستجابة</span><strong className="text-xl">92%</strong></div>
            <div className="rounded-2xl bg-white/10 p-3"><span className="block text-[11px] text-sky-100">طلبات جديدة</span><strong className="text-xl">{appointments.filter((item) => item.status === 'بانتظار التأكيد').length}</strong></div>
            <div className="rounded-2xl bg-white/10 p-3"><span className="block text-[11px] text-sky-100">مشاهدات اليوم</span><strong className="text-xl">248</strong></div>
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div><span className="text-xs font-bold text-slate-500">نظرة سريعة</span><h3 className="text-lg font-black text-slate-900 mt-1">إجراءات اليوم</h3></div>
            <Clock3 className="w-5 h-5 text-amber-500" />
          </div>
          <div className="space-y-3 mt-5">
            <button type="button" onClick={() => setActiveTab('appointments')} className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-50 text-right hover:bg-amber-100">
              <span><strong className="block text-xs text-amber-900">مواعيد بانتظار التأكيد</strong><small className="text-[11px] text-amber-700">{appointments.filter((item) => item.status === 'بانتظار التأكيد').length} طلبات جديدة</small></span>
              <ArrowUpRight className="w-4 h-4 text-amber-600" />
            </button>
            <button type="button" onClick={() => { setActiveTab('contracts'); setContractView('alerts'); }} className="w-full flex items-center justify-between p-3 rounded-2xl bg-rose-50 text-right hover:bg-rose-100">
              <span><strong className="block text-xs text-rose-900">عقود تحتاج متابعة</strong><small className="text-[11px] text-rose-700">{expiringContracts.length} عقود قريبة الانتهاء</small></span>
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
            </button>
            <button type="button" onClick={() => setActivePage('add-property')} className="w-full flex items-center justify-between p-3 rounded-2xl bg-sky-50 text-right hover:bg-sky-100">
              <span><strong className="block text-xs text-sky-900">أضف عقاراً جديداً</strong><small className="text-[11px] text-sky-700">وسّع مخزون مكتبك</small></span>
              <PlusCircle className="w-4 h-4 text-sky-600" />
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-slate-100">
          <div><h3 className="font-black text-sm text-slate-900">آخر المواعيد</h3><p className="text-[11px] text-slate-500 mt-1">تابع الطلبات الجديدة بسرعة</p></div>
          <button type="button" onClick={() => setActiveTab('appointments')} className="text-xs font-bold text-sky-600">عرض الكل</button>
        </div>
        <div className="divide-y divide-slate-100">
          {appointments.slice(0, 3).map((appointment) => (
            <div key={appointment.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500"><Calendar className="w-4 h-4" /></div><div><strong className="block text-xs text-slate-900">{appointment.clientName}</strong><span className="text-[11px] text-slate-500">{appointment.propertyTitle}</span></div></div>
              <div className="flex items-center gap-4 text-[11px]"><span className="text-slate-500">{appointment.preferredDate} • {appointment.preferredTime}</span><span className={`px-2.5 py-1 rounded-full font-bold ${appointment.status === 'بانتظار التأكيد' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{appointment.status}</span></div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <label className="flex items-center justify-between gap-4">
            <span><strong className="block text-xs text-slate-800">مدة التذكير الافتراضية</strong><small className="text-[11px] text-slate-500">تظهر التنبيهات قبل انتهاء العقد بهذه المدة</small></span>
            <select value={reminderDays} onChange={(event) => { const value = Number(event.target.value); setReminderDays(value); localStorage.setItem('engprop_contract_reminder_days', String(value)); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold">
              <option value="7">7 أيام</option><option value="15">15 يوماً</option><option value="30">30 يوماً</option><option value="45">45 يوماً</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><span className="text-xs font-bold text-sky-600">التقارير</span><h2 className="text-xl font-black text-slate-900 mt-1">تحليلات المكتب وتقارير الأداء</h2></div>
        <button type="button" onClick={() => window.print()} className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold">تصدير التقرير PDF</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          ['إجمالي المشاهدات', totalViews.toLocaleString(), '+18.4%', Eye, 'text-blue-600', 'bg-blue-50'],
          ['طلبات المعاينة', appointments.length, '+12.0%', Calendar, 'text-amber-600', 'bg-amber-50'],
          ['العقود النشطة', localContracts.length, '+8.2%', FileText, 'text-emerald-600', 'bg-emerald-50'],
          ['العملاء المحتملون', 38, '+24.5%', Users, 'text-purple-600', 'bg-purple-50']
        ].map(([label, value, growth, Icon, color, background]) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs"><div className="flex items-start justify-between"><span className="text-xs font-bold text-slate-500">{label}</span><div className={`p-2 rounded-xl ${background} ${color}`}><Icon className="w-4 h-4" /></div></div><strong className="block text-2xl font-black text-slate-900 mt-3">{value}</strong><span className="text-[11px] font-bold text-emerald-600">{growth} مقارنة بالشهر السابق</span></div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between"><div><h3 className="font-black text-sm text-slate-900">تطور المشاهدات</h3><p className="text-[11px] text-slate-500 mt-1">آخر 12 شهراً</p></div><span className="text-xs font-bold text-emerald-600">+18.4%</span></div>
          <div className="h-56 flex items-end gap-2 sm:gap-4 mt-8 border-b border-slate-100">{monthlyViews.map((height, index) => <div key={index} className="flex-1 flex flex-col items-center gap-2"><div className="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-sky-600 to-sky-300 hover:from-blue-700 hover:to-sky-400 transition-all" style={{ height: `${height}%` }} title={`${height * 48} مشاهدة`} /><span className="text-[10px] text-slate-400">{['أب','أي','حز','تم','آب','أيل','تش','ثا','ك١','ك٢','ك٣','ك٤'][index]}</span></div>)}</div>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs"><h3 className="font-black text-sm text-slate-900">أفضل العقارات أداءً</h3><div className="space-y-4 mt-5">{localProperties.slice(0, 4).map((property, index) => <div key={property.id} className="flex items-center gap-3"><span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-black flex items-center justify-center">{index + 1}</span><img src={property.image || property.gallery?.[0]} alt="" className="w-10 h-10 rounded-xl object-cover" /><div className="min-w-0 flex-1"><strong className="block text-xs text-slate-800 truncate">{property.title}</strong><span className="text-[11px] text-slate-400">{(property.viewsCount || 0).toLocaleString()} مشاهدة</span></div><ArrowUpRight className="w-4 h-4 text-emerald-500" /></div>)}</div></div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h2 className="text-xl font-black text-slate-900">المواعيد والمهام</h2><p className="text-xs text-slate-500 mt-1">إدارة طلبات المعاينة والتواصل مع العملاء</p></div><div className="flex gap-2"><span className="px-3 py-2 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold">{appointments.filter((item) => item.status === 'بانتظار التأكيد').length} بانتظار التأكيد</span><span className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold">{confirmedAppointments.length} مؤكدة</span></div></div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">{appointments.map((appointment) => <div key={appointment.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center"><Calendar className="w-5 h-5" /></div><div><span className="text-[11px] text-slate-400">{appointment.id}</span><h3 className="font-black text-sm text-slate-900">{appointment.clientName}</h3></div></div><span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${appointment.status === 'بانتظار التأكيد' ? 'bg-amber-50 text-amber-700' : appointment.status === 'تمت المعاينة' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700'}`}>{appointment.status}</span></div><div className="mt-4 space-y-2 text-xs"><p className="font-bold text-sky-700">{appointment.propertyTitle}</p><div className="flex flex-wrap gap-4 text-slate-500"><span>{appointment.preferredDate} • {appointment.preferredTime}</span><span dir="ltr"><Phone className="inline w-3 h-3 ml-1" />{appointment.clientPhone}</span></div><p className="text-[11px] text-slate-500 leading-5">{appointment.notes}</p></div><div className="flex items-center justify-between border-t border-slate-100 mt-4 pt-4"><button type="button" className="text-xs font-bold text-sky-600"><Phone className="inline w-3 h-3 ml-1" /> اتصال</button><div className="flex gap-2">{appointment.status === 'بانتظار التأكيد' && <button type="button" onClick={() => updateAppointmentStatus(appointment.id, 'تم التأكيد')} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-[11px] font-bold">تأكيد الموعد</button>}{appointment.status === 'تم التأكيد' && <button type="button" onClick={() => updateAppointmentStatus(appointment.id, 'تمت المعاينة')} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">تسجيل المعاينة</button>}<button type="button" className="p-2 rounded-lg bg-slate-100 text-slate-500" title="المزيد"><MoreHorizontal className="w-4 h-4" /></button></div></div></div>)}</div>
    </div>
  );

  const openContractDetails = (contract) => {
    setSelectedContract(contract);
    setContractView('details');
  };

  const renderContractView = () => {
    if (contractView === 'create') {
      return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">إنشاء عقد إيجار جديد</h3>
              <p className="text-xs text-slate-500 mt-1">أدخل بيانات العقد ليتم حفظه ومتابعة تنبيهات انتهائه</p>
            </div>
            <button type="button" onClick={() => setContractView('list')} className="text-xs font-bold text-slate-500 hover:text-slate-900">
              العودة للعقود
            </button>
          </div>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(event) => {
            event.preventDefault();
            setContractView('list');
          }}>
            {[
              ['اسم المستأجر', 'مثال: أحمد محمد'],
              ['هاتف المستأجر', '+963 9xx xxx xxx'],
              ['تاريخ بداية العقد', '2026-10-01'],
              ['تاريخ نهاية العقد', '2027-09-30'],
              ['قيمة الإيجار الشهري', '500'],
              ['قيمة التأمين', '1000']
            ].map(([label, placeholder]) => (
              <label key={label} className="space-y-1.5">
                <span className="block text-xs font-bold text-slate-700">{label}</span>
                <input
                  required
                  type={label.includes('تاريخ') ? 'date' : label.includes('قيمة') ? 'number' : 'text'}
                  placeholder={placeholder}
                  className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </label>
            ))}
            <label className="space-y-1.5">
              <span className="block text-xs font-bold text-slate-700">العقار</span>
              <select required className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <option value="">اختر العقار</option>
                {localProperties.filter((property) => property.purpose === 'للإيجار').map((property) => (
                  <option key={property.id} value={property.id}>{property.title}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="block text-xs font-bold text-slate-700">دورية السداد</span>
              <select className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <option>شهري</option>
                <option>ربع سنوي</option>
                <option>سنوي</option>
              </select>
            </label>
            <label className="md:col-span-2 space-y-1.5">
              <span className="block text-xs font-bold text-slate-700">ملاحظات العقد</span>
              <textarea rows="3" className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none" placeholder="أي شروط أو ملاحظات إضافية..." />
            </label>
            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setContractView('list')} className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
                إلغاء
              </button>
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700">
                حفظ العقد
              </button>
            </div>
          </form>
        </div>
      );
    }

    if (contractView === 'alerts') {
      return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">تنبيهات انتهاء الإيجار</h3>
              <p className="text-xs text-slate-500 mt-1">إجراءات سريعة قبل انتهاء العقود</p>
            </div>
            <button type="button" onClick={() => setContractView('list')} className="text-xs font-bold text-slate-500 hover:text-slate-900">العودة للعقود</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[7, 15, reminderDays].filter((days, index, values) => values.indexOf(days) === index).map((days) => (
              <div key={days} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs text-slate-500 font-bold">خلال {days} أيام</span>
                <strong className="block text-3xl text-slate-900 mt-2">
                  {localContracts.filter((contract) => contract.daysRemaining <= days && contract.daysRemaining > 0).length}
                </strong>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {expiringContracts.map((contract) => (
              <div key={contract.id} className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-amber-200 bg-amber-50/60">
                <button type="button" onClick={() => openContractDetails(contract)} className="text-right">
                  <strong className="block text-xs text-slate-900">{contract.propertyTitle}</strong>
                  <span className="text-[11px] text-slate-500">{contract.tenantName} • باقي {contract.daysRemaining} يوم</span>
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => updateContractStatus(contract.id, 'مجدد')} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-[11px] font-bold">تجديد</button>
                  <button type="button" onClick={() => updateContractStatus(contract.id, 'منتهٍ')} className="px-3 py-2 rounded-lg bg-white text-rose-700 border border-rose-200 text-[11px] font-bold">إنهاء</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (contractView === 'details' && selectedContract) {
      return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-mono text-slate-400">{selectedContract.id}</span>
              <h3 className="text-lg font-black text-slate-900 mt-1">تفاصيل عقد الإيجار</h3>
            </div>
            <button type="button" onClick={() => setContractView('list')} className="text-xs font-bold text-slate-500 hover:text-slate-900">العودة للعقود</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['العقار', selectedContract.propertyTitle],
              ['المستأجر', selectedContract.tenantName],
              ['الهاتف', selectedContract.tenantPhone],
              ['نوع العقد', selectedContract.type],
              ['بداية العقد', selectedContract.startDate],
              ['نهاية العقد', selectedContract.endDate],
              ['الإيجار الشهري', `${selectedContract.monthlyRent} ${selectedContract.currency}`],
              ['دورية الدفع', selectedContract.paymentCycle]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <span className="block text-[11px] text-slate-500 mb-1">{label}</span>
                <strong className="text-sm text-slate-900">{value}</strong>
              </div>
            ))}
          </div>
          <div className={`rounded-2xl p-4 text-xs font-bold ${selectedContract.daysRemaining <= 45 ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
            {selectedContract.daysRemaining <= 45 ? `تنبيه: العقد يحتاج متابعة، متبقي ${selectedContract.daysRemaining} يوم.` : 'العقد ساري ولا يحتاج إلى إجراء عاجل.'}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => updateContractStatus(selectedContract.id, 'مجدد')} className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold">تجديد العقد</button>
            <button type="button" onClick={() => updateContractStatus(selectedContract.id, 'منتهٍ')} className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 text-xs font-bold">إنهاء العقد</button>
            <button type="button" onClick={() => updateContractStatus(selectedContract.id, 'تم تحديث السعر')} className="px-4 py-2.5 rounded-xl border border-sky-200 text-sky-700 text-xs font-bold">تحديث السعر</button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">سجل العقود الموثقة والإيجارات</h3>
            <p className="text-xs text-slate-500 mt-0.5">تتبع تاريخ بدء وانتهاء العقود وحالات التحصيل والتجديد</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setContractView('alerts')} className="px-3.5 py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl hover:bg-amber-100">التنبيهات</button>
            <button type="button" onClick={() => setContractView('create')} className="px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800">+ عقد جديد</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-xs font-bold">
                <th className="p-4">رقم العقد</th><th className="p-4">العقار</th><th className="p-4">المستأجر</th><th className="p-4">المبلغ</th><th className="p-4">الفترة</th><th className="p-4">الحالة</th><th className="p-4">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {localContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-mono font-bold text-slate-700">{contract.id}</td>
                  <td className="p-4 font-bold text-slate-900 max-w-[220px]">{contract.propertyTitle}</td>
                  <td className="p-4 text-slate-700">{contract.tenantName}</td>
                  <td className="p-4 font-bold text-sky-600">{contract.monthlyRent?.toLocaleString()} {contract.currency}</td>
                  <td className="p-4 text-slate-500 text-[11px]">{contract.startDate} إلى {contract.endDate}</td>
                  <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${contract.daysRemaining <= 45 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{contract.status}</span></td>
                  <td className="p-4"><button type="button" onClick={() => openContractDetails(contract)} className="text-xs font-bold text-sky-600 hover:text-sky-800">عرض</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProperties.length === 0 && (
          <div className="p-10 text-center text-xs text-slate-500">لم نعثر على عقار يطابق بحثك.</div>
        )}
      </div>
    );
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العقار نهائياً؟')) return;
    setDeletingPropertyId(id);
    setBackendNotice('');
    try {
      if (isAdmin) await moderateAdminProperty(id, 'delete');
      else await deleteAgencyProperty(id);
      setLocalProperties(prev => prev.filter(property => property.id !== id));
    } catch (error) {
      setBackendNotice(error.message || 'تعذر حذف العقار');
    } finally {
      setDeletingPropertyId(null);
    }
  };

  const handleToggleStatus = (id) => {
    setLocalProperties(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = p.purpose === 'للإيجار' ? 'مؤجر حالياً' : 'تم البيع';
        return { ...p, purpose: p.purpose === nextStatus ? 'للإيجار' : nextStatus };
      }
      return p;
    }));
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row-reverse gap-6 items-stretch">
        <DashboardSidebar
          activeItem={activeTab === 'properties' ? 'properties' : activeTab}
          onNavigate={(item) => {
            if (item === 'add-property') setActivePage('add-property');
            if (item === 'overview' || item === 'properties' || item === 'contracts' || item === 'appointments' || item === 'analytics' || item === 'leads' || item === 'employees' || item === 'subscription' || item === 'qr-cards' || item === 'settings') {
              setActiveTab(item);
              if (item === 'contracts') setContractView('list');
            }
          }}
        />
        <main className="min-w-0 flex-1 space-y-8">
        {backendNotice && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700">{backendNotice}</div>}
        {activeTab === 'settings' ? <SettingsPanel kind="office" onCoverChange={setOfficeCover} /> : (
        <>
      
      {/* Top Banner / Agency Info */}
      <div
        className="relative overflow-hidden bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
        style={officeCover ? { backgroundImage: `linear-gradient(90deg, rgba(15,23,42,.97), rgba(15,23,42,.72)), url(${officeCover})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center p-3">
            <Building2 className="w-10 h-10 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">لوحة تحكم المكتب العقاري</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                مكتب موثق
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              مكتب المهندس محمود هنداوي العقاري • حلب - أعزاز • 0951494682
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActivePage('add-property')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة عقار جديد</span>
          </button>

          <button
            onClick={() => setActivePage('add-property')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>استيراد عقارات من Excel</span>
          </button>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-slate-500 font-bold">العقارات النشطة</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 font-['Inter']">{localProperties.length}</span>
          <span className="block text-[11px] text-emerald-600 font-bold mt-1">↑ 3 مضافة هذا الأسبوع</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-slate-500 font-bold">المشاهدات الشهرية</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 font-['Inter']">4,890</span>
          <span className="block text-[11px] text-emerald-600 font-bold mt-1">↑ 18% زيادة في التفاعل</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-slate-500 font-bold">مواعيد المعاينة القادمة</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 font-['Inter']">6</span>
          <span className="block text-[11px] text-blue-600 font-bold mt-1">2 موعد لليوم</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-slate-500 font-bold">العقود النشطة</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 font-['Inter']">{localContracts.length}</span>
          <span className="block text-[11px] text-amber-600 font-bold mt-1">عقد واحد قريب من الانتهاء</span>
        </div>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'analytics' && renderAnalytics()}
      {['leads', 'employees', 'subscription', 'qr-cards'].includes(activeTab) && (
      <OfficeManagementModules activeTab={activeTab} propertyCount={localProperties.length} />
      )}

      {/* Tabs Navigation */}
      {activeTab === 'contracts' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-bold">إجمالي العقود</span>
            <strong className="block text-3xl text-slate-900 mt-2">{localContracts.length}</strong>
            <span className="text-[11px] text-slate-400">العقود المسجلة في المكتب</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs">
            <span className="text-xs text-amber-700 font-bold">تنتهي خلال 45 يوماً</span>
            <strong className="block text-3xl text-amber-600 mt-2">{expiringContracts.length}</strong>
            <span className="text-[11px] text-amber-600">تحتاج إلى تجديد أو تواصل</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs">
            <span className="text-xs text-rose-700 font-bold">عقود متأخرة</span>
            <strong className="block text-3xl text-rose-600 mt-2">{expiredContracts.length}</strong>
            <span className="text-[11px] text-rose-600">تحتاج إلى إجراء فوري</span>
          </div>
        </div>
      )}

      <div className="flex border-b border-slate-200 gap-4">
        {[
          { id: 'overview', label: 'نظرة عامة' },
          { id: 'properties', label: `إدارة العقارات (${localProperties.length})` },
          { id: 'contracts', label: `إدارة العقود والإيجارات (${localContracts.length})` },
          { id: 'appointments', label: `طلبات المعاينة والمواعيد (${appointments.length})` },
          { id: 'analytics', label: 'التحليلات' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Properties Management */}
      {activeTab === 'properties' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">جدول عقارات المكتب</h3>
              <span className="text-xs text-slate-500 font-medium">يمكنك تغيير حالة العقار أو معاينته مباشرة</span>
            </div>
            <label className="relative w-full sm:w-72">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={propertyQuery}
                onChange={(event) => setPropertyQuery(event.target.value)}
                placeholder="ابحث بالاسم أو المدينة أو النوع"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-9 pl-3 text-xs outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-xs font-bold">
                  <th className="p-4">العقار</th>
                  <th className="p-4">الموقع</th>
                  <th className="p-4">السعر</th>
                  <th className="p-4">المواصفات</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {filteredProperties.map(property => (
                  <tr key={property.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={property.image || property.images?.[0] || property.gallery?.[0] || '/assets/images/74e3791940a62972275dd2c23dbee27e57215cf5.jpg'} 
                          alt="" 
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200" 
                        />
                        <div>
                          <span 
                            onClick={() => onSelectProperty(property)}
                            className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer block line-clamp-1"
                          >
                            {property.title}
                          </span>
                          <span className="text-[11px] text-slate-400">{property.type}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{property.location || property.address || property.city}</td>
                    <td className="p-4 font-black text-blue-600 font-['Inter']">
                      {(property.priceUSD || property.price || 0).toLocaleString()} {property.priceUnit || '$'}
                    </td>
                    <td className="p-4 text-slate-600">
                      {property.bedrooms ?? property.rooms ?? 0} غرف • {property.area} م²
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(property.id)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                          property.purpose === 'للإيجار'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : property.purpose === 'للبيع'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                        title="انقر لتبديل حالة التوفر"
                      >
                        {property.purpose}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onSelectProperty(property)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          title="معاينة"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          disabled={deletingPropertyId === property.id}
                          onClick={() => handleDeleteProperty(property.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Contracts Management */}
      {activeTab === 'contracts' && (
        renderContractView()
      )}

      {/* Tab 3: Appointments */}
      {activeTab === 'appointments' && (
        renderAppointments()
      )}

          </>
        )}
        </main>
      </div>
    </div>
  );
}
