import React, { useEffect, useMemo, useState } from 'react';
import { 
  ShieldCheck,
  Search,
  Bell,
  CheckCircle2,
  MoreHorizontal,
  Plus,
  Save,
} from 'lucide-react';
import { agencies, cities, platformStats } from '../data/propertiesData';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import SettingsPanel from '../components/dashboard/SettingsPanel';
import { createAdminResource, createAgency, getAdminModerationProperties, moderateAdminProperty } from '../services/api';

const pageData = {
  agencies: {
    title: 'إدارة المكاتب والشركات',
    description: 'اعتماد المكاتب، متابعة التراخيص، وإدارة صلاحيات الوصول للمنصة.',
    columns: ['المكتب', 'المدينة', 'المدير المسؤول', 'العقارات', 'الحالة'],
    rows: [
      ['مكتب قاسيون العقاري', 'دمشق', 'أحمد خليل', '42', 'بانتظار التدقيق'],
      ['شركة الشام للاستثمار', 'حلب', 'سارة الحلبي', '86', 'معتمد رسمياً'],
      ['مكتب الياسمين', 'اللاذقية', 'محمد ديوب', '19', 'معتمد رسمياً']
    ]
  },
  plans: {
    title: 'الباقات والحدود والميزات',
    description: 'إدارة خطط الاشتراك وحدود العقارات والمستخدمين والميزات المتاحة لكل مكتب.',
    columns: ['الباقة', 'السعر الشهري', 'العقارات', 'المستخدمون', 'الحالة'],
    rows: [
      ['مبتدئ', 'مجاني', '10', '2', 'نشطة'],
      ['احترافي', '49 $', '100', '10', 'نشطة'],
      ['مؤسسات', '149 $', 'غير محدود', 'غير محدود', 'نشطة']
    ]
  },
  payments: {
    title: 'المدفوعات والفواتير',
    description: 'مراجعة الاشتراكات، الفواتير، وحالات التحصيل المالي.',
    columns: ['رقم الفاتورة', 'المكتب', 'المبلغ', 'تاريخ الإصدار', 'الحالة'],
    rows: [
      ['INV-2025-1042', 'شركة الشام للاستثمار', '49 $', '2025/06/01', 'مدفوعة'],
      ['INV-2025-1041', 'مكتب الياسمين', '49 $', '2025/06/01', 'بانتظار الدفع'],
      ['INV-2025-1039', 'مكتب المدى', '149 $', '2025/05/28', 'مدفوعة']
    ]
  },
  properties: {
    title: 'التحقق من العقارات ومراقبة المحتوى',
    description: 'مراجعة الإعلانات المبلغ عنها والتحقق من الصور والبيانات قبل النشر.',
    columns: ['العقار', 'الناشر', 'المدينة', 'تاريخ الإرسال', 'حالة المراجعة'],
    rows: [
      ['شقة للبيع في المزة', 'مكتب قاسيون', 'دمشق', 'منذ 20 دقيقة', 'بانتظار المراجعة'],
      ['مستودع صناعي', 'شركة الشام', 'حلب', 'أمس', 'تم التحقق'],
      ['أرض زراعية', 'مستخدم: خالد', 'ريف دمشق', 'أمس', 'بلاغ محتوى']
    ]
  },
  locations: {
    title: 'المناطق والمدن',
    description: 'إدارة المحافظات والمناطق والأحياء التي تظهر في البحث ونماذج إضافة العقار.',
    columns: ['المحافظة', 'عدد المناطق', 'العقارات', 'حالة الظهور'],
    rows: [
      ['دمشق', '16', '1,248', 'ظاهرة'],
      ['ريف دمشق', '28', '642', 'ظاهرة'],
      ['حلب', '18', '518', 'ظاهرة'],
      ['اللاذقية', '12', '311', 'ظاهرة']
    ]
  },
  users: {
    title: 'المستخدمون والتقارير والتقييمات',
    description: 'إدارة الحسابات، البلاغات، ومراجعة تقييمات المستخدمين للمكاتب والعقارات.',
    columns: ['المستخدم', 'الدور', 'آخر نشاط', 'التقييمات', 'الحالة'],
    rows: [
      ['خالد العلي', 'مالك عقار', 'منذ 5 دقائق', '12 تقييم', 'نشط'],
      ['رنا منصور', 'باحث عن عقار', 'أمس', '3 تقييمات', 'نشط'],
      ['مكتب المدى', 'مكتب عقاري', 'منذ 3 أيام', 'بلاغان مفتوحان', 'مراجعة']
    ]
  },
  notifications: {
    title: 'مركز الإشعارات والتعاميم',
    description: 'إرسال إشعارات موجهة للمكاتب والمستخدمين ومتابعة سجل الإرسال.',
    columns: ['عنوان الإشعار', 'الجمهور', 'تاريخ الإرسال', 'الوصول', 'الحالة'],
    rows: [
      ['تحديث شروط التحقق من العقار', 'كل المكاتب', 'اليوم 10:30', '98%', 'مكتمل'],
      ['صيانة مجدولة للمنصة', 'كل المستخدمين', 'أمس 18:00', '94%', 'مكتمل'],
      ['تذكير بتجديد الترخيص', 'مكاتب محددة', 'قيد الإعداد', '—', 'مسودة']
    ]
  },
  policies: {
    title: 'سياسات المنصة والإيجار والأمان',
    description: 'تحديث سياسات الاستخدام، قواعد الإيجار، وإعدادات الحماية والخصوصية.',
    columns: ['السياسة', 'الإصدار', 'آخر تحديث', 'نطاق التطبيق', 'الحالة'],
    rows: [
      ['شروط استخدام المنصة', 'v3.2', '2025/05/20', 'كل المستخدمين', 'منشورة'],
      ['سياسة الإيجار والعقود', 'v2.1', '2025/05/10', 'المكاتب والعملاء', 'منشورة'],
      ['سياسة الأمان والخصوصية', 'v4.0', '2025/04/28', 'كل المستخدمين', 'منشورة']
    ]
  }
};

function AdminResourcePage({ page, onAction }) {
  const data = pageData[page];
  const [query, setQuery] = useState('');
  const filteredRows = useMemo(
    () => data.rows.filter(row => row.join(' ').toLowerCase().includes(query.toLowerCase())),
    [data.rows, query]
  );

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">{data.title}</h2>
          <p className="text-xs text-slate-500 mt-1">{data.description}</p>
        </div>
        <button type="button" onClick={onAction} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700">
          <Plus className="w-4 h-4" /> {page === 'agencies' ? 'إضافة مكتب جديد' : 'إضافة سجل جديد'}
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {['إجمالي السجلات', 'نشطة', 'بانتظار الإجراء', 'بلاغات مفتوحة'].map((label, index) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-4">
            <span className="text-xs text-slate-500 font-bold">{label}</span>
            <strong className="block text-2xl text-slate-900 mt-2">{[data.rows.length * 48, 126, 8, 3][index]}</strong>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <h3 className="font-bold text-sm text-slate-900">السجلات والإجراءات</h3>
          <div className="relative w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="بحث..." className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[700px]">
            <thead><tr className="bg-slate-50 text-xs text-slate-500">{data.columns.map(column => <th key={column} className="p-4">{column}</th>)}<th className="p-4">إجراء</th></tr></thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRows.map((row, rowIndex) => <tr key={`${row[0]}-${rowIndex}`} className="hover:bg-slate-50/70">{row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`} className="p-4 text-slate-700">{cellIndex === row.length - 1 ? <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold">{cell}</span> : cell}</td>)}<td className="p-4"><button type="button" onClick={onAction} className="text-blue-600 font-bold hover:text-blue-800"><MoreHorizontal className="w-4 h-4" /></button></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h3 className="font-bold text-sm">إعدادات {data.title}</h3><p className="text-xs text-slate-400 mt-1">التغييرات محفوظة محلياً حتى ربط خدمة المنصة.</p></div>
        <button type="button" onClick={onAction} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold"><Save className="w-4 h-4" /> حفظ التغييرات</button>
      </div>
    </section>
  );
}

function PropertyModerationPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const result = await getAdminModerationProperties();
      setItems(result.items || []);
      setError('');
    } catch (requestError) {
      setError(requestError.message || 'تعذر تحميل العقارات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getAdminModerationProperties()
      .then(result => {
        if (active) {
          setItems(result.items || []);
          setLoading(false);
        }
      })
      .catch(requestError => {
        if (active) {
          setError(requestError.message || 'تعذر تحميل العقارات');
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, []);

  const moderate = async (property, action) => {
    if (action === 'delete' && !window.confirm('هل تريد حذف هذا العقار نهائياً؟')) return;
    setBusyId(property.id);
    try {
      await moderateAdminProperty(property.id, action);
      await load();
    } catch (requestError) {
      setError(requestError.message || 'تعذر تنفيذ الإجراء');
    } finally {
      setBusyId('');
    }
  };

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6">
        <h2 className="text-xl font-black text-slate-900">التحقق من العقارات ومراقبة المحتوى</h2>
        <p className="text-xs text-slate-500 mt-1">اعتماد الإعلانات ومراجعة المخالفات وكشف العقارات المكررة.</p>
      </div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-xs font-bold">{error}</div>}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        {loading ? <div className="p-8 text-center text-sm text-slate-500">جاري تحميل العقارات...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[900px]">
              <thead><tr className="bg-slate-50 text-xs text-slate-500">
                <th className="p-4">العقار</th><th className="p-4">المدينة</th><th className="p-4">السعر</th><th className="p-4">الحالة</th><th className="p-4">التكرار</th><th className="p-4">الإجراءات</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {items.map(property => (
                  <tr key={property.id} className="hover:bg-slate-50/70">
                    <td className="p-4 font-bold text-slate-900">{property.title || 'بدون عنوان'}<span className="block text-[10px] text-slate-400 mt-1">{property.id}</span></td>
                    <td className="p-4 text-slate-600">{property.city || '—'}</td>
                    <td className="p-4 text-blue-700 font-bold">{property.priceUSD || property.price || '—'}</td>
                    <td className="p-4"><span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold">{property.moderationStatus}</span></td>
                    <td className="p-4">{property.isDuplicate ? <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-bold">مكرر محتمل</span> : <span className="text-emerald-600 font-bold">لا يوجد</span>}</td>
                    <td className="p-4"><div className="flex flex-wrap gap-2">
                      <button disabled={busyId === property.id} onClick={() => moderate(property, 'approve')} className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold disabled:opacity-50">اعتماد</button>
                      <button disabled={busyId === property.id} onClick={() => moderate(property, 'reject')} className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold disabled:opacity-50">رفض</button>
                      <button disabled={busyId === property.id} onClick={() => moderate(property, 'suspend')} className="px-2.5 py-1 rounded-lg bg-slate-700 text-white font-bold disabled:opacity-50">إيقاف</button>
                      <button disabled={busyId === property.id} onClick={() => moderate(property, 'delete')} className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold disabled:opacity-50">حذف</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!items.length && <div className="p-8 text-center text-sm text-slate-500">لا توجد عقارات للمراجعة.</div>}
          </div>
        )}
      </div>
    </section>
  );
}

export default function SuperAdminDashboard() {
  const [agenciesList, setAgenciesList] = useState(agencies);
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications] = useState([
    { id: 1, title: 'طلب انضمام مكتب جديد: مكتب قاسيون العقاري - دمشق', time: 'منذ 15 دقيقة', unread: true },
    { id: 2, title: 'تنبيه: عقد رقم CNT-2025-119 تجاوز مدة المراجعة القانونية', time: 'منذ ساعتين', unread: true },
    { id: 3, title: 'تقرير إحصائيات السوق الشهري جاهز للتصدير', time: 'أمس', unread: false },
  ]);
  const [toast, setToast] = useState('');
  const [isAgencyModalOpen, setIsAgencyModalOpen] = useState(false);
  const [agencyForm, setAgencyForm] = useState({
    agencyName: '',
    managerName: '',
    email: '',
    password: '',
    city: '',
    planName: 'Basic',
    durationDays: 30
  });
  const [agencyLoading, setAgencyLoading] = useState(false);
  const [agencyError, setAgencyError] = useState('');
  const [resourceModal, setResourceModal] = useState(null);
  const [resourceForm, setResourceForm] = useState({});
  const [resourceLoading, setResourceLoading] = useState(false);
  const [resourceError, setResourceError] = useState('');
  const resourceFields = {
    locations: [['governorate', 'المحافظة', 'text'], ['district', 'المنطقة / الحي', 'text']],
    plans: [['name', 'اسم الباقة', 'text'], ['price', 'السعر الشهري', 'number']],
    users: [['name', 'اسم المستخدم', 'text'], ['email', 'البريد الإلكتروني', 'email'], ['password', 'كلمة المرور', 'password']],
    payments: [['agencyId', 'معرّف المكتب', 'number'], ['amount', 'المبلغ', 'number'], ['invoice', 'رقم الفاتورة', 'text']],
    notifications: [['title', 'عنوان الإشعار', 'text'], ['message', 'نص الإشعار', 'text']]
  };

  const handleVerifyAgency = (id) => {
    setAgenciesList(prev => prev.map(a => a.id === id ? { ...a, verified: true } : a));
  };

  const showAction = () => {
    setToast('تم حفظ الإجراء محلياً بنجاح');
    window.setTimeout(() => setToast(''), 2200);
  };

  const handleCreateAgency = async (event) => {
    event.preventDefault();
    setAgencyLoading(true);
    setAgencyError('');
    try {
      const result = await createAgency(agencyForm);
      setAgenciesList(prev => [{
        id: result.agency.id,
        name: result.agency.name,
        address: agencyForm.city || 'غير محدد',
        propertiesCount: 0,
        rating: '—',
        verified: false
      }, ...prev]);
      setIsAgencyModalOpen(false);
      setAgencyForm({ agencyName: '', managerName: '', email: '', password: '', city: '', planName: 'Basic', durationDays: 30 });
      setToast('تم إنشاء المكتب والحساب والاشتراك بنجاح');
    } catch (error) {
      setAgencyError(error.message || 'تعذر إنشاء المكتب');
    } finally {
      setAgencyLoading(false);
    }
  };

  const openResourceModal = (type) => {
    setResourceModal(type);
    setResourceForm(type === 'users' ? { role: 'user' } : {});
    setResourceError('');
  };

  const handleCreateResource = async (event) => {
    event.preventDefault();
    setResourceLoading(true);
    setResourceError('');
    try {
      await createAdminResource(resourceModal, resourceForm);
      setResourceModal(null);
      setToast('تمت إضافة السجل بنجاح إلى قاعدة البيانات');
    } catch (error) {
      setResourceError(error.message || 'تعذر حفظ السجل');
    } finally {
      setResourceLoading(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row-reverse gap-6 items-stretch">
        <DashboardSidebar
          kind="admin"
          activeItem={activeTab}
          onNavigate={setActiveTab}
        />
        <main className="min-w-0 flex-1 space-y-8">
        {activeTab === 'properties' ? <PropertyModerationPage /> : activeTab === 'settings' ? <SettingsPanel kind="admin" /> : pageData[activeTab] ? <AdminResourcePage page={activeTab} onAction={() => activeTab === 'agencies' ? setIsAgencyModalOpen(true) : ['locations', 'payments', 'notifications', 'users', 'plans'].includes(activeTab) ? openResourceModal(activeTab) : showAction()} /> : (
          <>
      
      {/* Super Admin Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center p-3">
            <ShieldCheck className="w-10 h-10 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">لوحة تحكم إدارة المنظومة (Super Admin)</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold">
                تحكم مركزي
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              مراقبة مؤشرات السوق العقاري السوري، اعتماد المكاتب، والتحقق من سلامة الصفقات والعقود
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            حالة الخوادم: متصلة ونشطة
          </span>
        </div>
      </div>

      {/* High Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block mb-1">إجمالي العقارات المعروضة</span>
          <span className="text-2xl font-black text-slate-900 font-['Inter']">{platformStats.totalProperties}</span>
          <span className="block text-[11px] text-emerald-600 font-bold mt-1">↑ 12% نمو هذا الشهر</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block mb-1">المكاتب والشركات المعتمدة</span>
          <span className="text-2xl font-black text-slate-900 font-['Inter']">{platformStats.activeAgencies}</span>
          <span className="block text-[11px] text-blue-600 font-bold mt-1">3 مكاتب بانتظار التدقيق</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block mb-1">العقود الموثقة سارية المفعول</span>
          <span className="text-2xl font-black text-slate-900 font-['Inter']">{platformStats.activeContracts}</span>
          <span className="block text-[11px] text-emerald-600 font-bold mt-1">98.5% نسبة التزام الأطراف</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block mb-1">الزيارات الشهرية للمنصة</span>
          <span className="text-2xl font-black text-slate-900 font-['Inter']">{platformStats.monthlyVisits}</span>
          <span className="block text-[11px] text-purple-600 font-bold mt-1">تفاعل واسع من داخل وخارج سوريا</span>
        </div>
      </div>

      {/* Market Statistics by City */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">إحصائيات السوق العقاري وتوزيع الطلب حسب المحافظات</h3>
            <p className="text-xs text-slate-500 mt-0.5">تحليل لنسبة العقارات المعروضة ومتوسط الأسعار</p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
            تحديث فوري
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-2">
          {cities.map(c => {
            const percentage = Math.round((c.count / 150) * 100);
            return (
              <div key={c.name} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-800">{c.name}</span>
                  <span className="text-blue-600 font-['Inter']">{c.count} عقار</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage * 2}%` }}></div>
                </div>
                <span className="text-[10px] text-slate-400 block text-left font-mono">حصة {percentage}% من المعروض</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agency Verification Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">إدارة واعتماد المكاتب العقارية</h3>
            <p className="text-xs text-slate-500 mt-0.5">مراجعة التراخيص واعتماد الشارات الرسمية للمكاتب</p>
          </div>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث في المكاتب..."
              className="w-full pr-8 pl-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-xs font-bold">
                <th className="p-4">اسم المكتب</th>
                <th className="p-4">المدينة / المقر</th>
                <th className="p-4">العقارات المعروضة</th>
                <th className="p-4">التقييم العام</th>
                <th className="p-4">حالة الاعتماد</th>
                <th className="p-4 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {agenciesList.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/50">
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                        {a.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-900">{a.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{a.address}</td>
                  <td className="p-4 font-bold text-blue-600">{a.propertiesCount} عقار</td>
                  <td className="p-4 text-amber-600 font-bold">★ {a.rating}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      a.verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {a.verified ? 'معتمد رسمياً' : 'قيد التدقيق'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {!a.verified ? (
                      <button
                        onClick={() => handleVerifyAgency(a.id)}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-700"
                      >
                        اعتماد
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">موثق ✓</span>
                    )}
                    {toast && <div className="fixed bottom-6 left-6 z-50 px-4 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xl flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{toast}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notifications & Announcements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <span>مركز التنبيهات والإشعارات الرقابية</span>
            </h3>
            <span className="text-[11px] text-blue-600 font-bold cursor-pointer">تحديد الكل كمقروء</span>
          </div>

          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.unread ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                <div className="flex-1">
                  <h5 className="font-bold text-xs text-slate-900">{n.title}</h5>
                  <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100">
              إرسال تعميم أو إشعار لكافة المكاتب العقارية
            </h3>
            <div className="space-y-3 pt-3">
              <input
                type="text"
                placeholder="عنوان التعميم..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <textarea
                rows="3"
                placeholder="نص القرار أو التحديث التنظيمي..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              ></textarea>
            </div>
          </div>
          <button
            onClick={() => alert('تم إرسال التعميم لجميع المكاتب العقارية النشطة!')}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
          >
            نشر التعميم على شبكة المكاتب
          </button>
        </div>
      </div>

          </>
        )}
        </main>
      </div>
      {isAgencyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateAgency} className="bg-white rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-4" dir="rtl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">إضافة مكتب جديد</h2>
                <p className="text-xs text-slate-500 mt-1">سيتم إنشاء حساب مدير المكتب واشتراكه مباشرة.</p>
              </div>
              <button type="button" onClick={() => setIsAgencyModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-xl">×</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ['agencyName', 'اسم المكتب', 'مثال: مكتب الشام العقاري'],
                ['managerName', 'اسم المسؤول', 'الاسم الكامل'],
                ['email', 'البريد الإلكتروني', 'manager@example.com'],
                ['password', 'كلمة المرور', '6 محارف على الأقل'],
                ['city', 'المدينة', 'دمشق']
              ].map(([key, label, placeholder]) => (
                <label key={key} className="space-y-1.5">
                  <span className="block text-xs font-bold text-slate-700">{label}</span>
                  <input
                    required={['agencyName', 'managerName', 'email', 'password'].includes(key)}
                    type={key === 'email' ? 'email' : key === 'password' ? 'password' : 'text'}
                    value={agencyForm[key]}
                    onChange={event => setAgencyForm(prev => ({ ...prev, [key]: event.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              ))}
              <label className="space-y-1.5">
                <span className="block text-xs font-bold text-slate-700">الباقة</span>
                <select value={agencyForm.planName} onChange={event => setAgencyForm(prev => ({ ...prev, planName: event.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                  <option value="Basic">Basic</option>
                  <option value="Pro">Pro</option>
                  <option value="Premium">Premium</option>
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="block text-xs font-bold text-slate-700">مدة الاشتراك بالأيام</span>
                <input type="number" min="1" max="3650" value={agencyForm.durationDays} onChange={event => setAgencyForm(prev => ({ ...prev, durationDays: Number(event.target.value) }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs" />
              </label>
            </div>
            {agencyError && <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-xs font-bold">{agencyError}</div>}
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={agencyLoading} className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-60">{agencyLoading ? 'جاري الإنشاء...' : 'إنشاء المكتب'}</button>
              <button type="button" onClick={() => setIsAgencyModalOpen(false)} className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">إلغاء</button>
            </div>
          </form>
        </div>
      )}
      {resourceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateResource} className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4" dir="rtl">
            <div className="flex items-center justify-between">
              <div><h2 className="text-xl font-black text-slate-900">إضافة {pageData[resourceModal].title}</h2><p className="text-xs text-slate-500 mt-1">سيتم حفظ السجل مباشرة في قاعدة البيانات.</p></div>
              <button type="button" onClick={() => setResourceModal(null)} className="text-slate-400 text-xl">×</button>
            </div>
            <div className="space-y-3">
              {resourceFields[resourceModal].map(([key, label, type]) => (
                <label key={key} className="block space-y-1.5">
                  <span className="block text-xs font-bold text-slate-700">{label}</span>
                  {key === 'message' ? (
                    <textarea required rows="3" value={resourceForm[key] || ''} onChange={event => setResourceForm(prev => ({ ...prev, [key]: event.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs" />
                  ) : (
                    <input required type={type} value={resourceForm[key] || ''} onChange={event => setResourceForm(prev => ({ ...prev, [key]: type === 'number' ? Number(event.target.value) : event.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs" />
                  )}
                </label>
              ))}
              {resourceModal === 'users' && <label className="block space-y-1.5"><span className="block text-xs font-bold text-slate-700">الدور</span><select value={resourceForm.role} onChange={event => setResourceForm(prev => ({ ...prev, role: event.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"><option value="user">مستخدم</option><option value="office">مكتب</option></select></label>}
              {resourceModal === 'plans' && <p className="text-[11px] text-slate-500 bg-slate-50 rounded-xl p-3">سيتم إنشاء الباقة بحد افتراضي قدره 10 عقارات وموظفين.</p>}
            </div>
            {resourceError && <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-xs font-bold">{resourceError}</div>}
            <div className="flex gap-3"><button type="submit" disabled={resourceLoading} className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-xs font-bold disabled:opacity-60">{resourceLoading ? 'جاري الحفظ...' : 'حفظ السجل'}</button><button type="button" onClick={() => setResourceModal(null)} className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">إلغاء</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
