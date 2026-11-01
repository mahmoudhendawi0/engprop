import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Crown,
  Link2,
  Mail,
  QrCode,
  ShieldCheck,
  UserPlus,
  X
} from 'lucide-react';
import {
  createAgencyLead,
  getAgencyLeads,
  getAgencyStaff,
  inviteAgencyStaff,
  updateAgencyLead
} from '../../services/api';

const seedLeads = [
  { id: 'LD-1042', name: 'رامي الحسن', phone: '0991 234 567', interest: 'شقة للبيع', property: 'شقة فاخرة في المزة', status: 'جديد', source: 'واتساب' },
  { id: 'LD-1039', name: 'لينا خضور', phone: '0944 768 210', interest: 'مكتب للإيجار', property: 'مكاتب تجارية - أبو رمانة', status: 'متابعة', source: 'الموقع' },
  { id: 'LD-1034', name: 'فراس المصري', phone: '0988 102 445', interest: 'فيلا', property: 'فيلا الياسمين', status: 'مؤهل', source: 'إنستغرام' }
];

const seedEmployees = [
  { id: 1, name: 'محمد العلي', email: 'm.alali@engprop.sy', role: 'مدير المكتب', permissions: ['العقارات', 'العملاء', 'التقارير'], status: 'نشط' },
  { id: 2, name: 'سارة حمود', email: 's.hamoud@engprop.sy', role: 'وسيط عقاري', permissions: ['العقارات', 'العملاء'], status: 'نشط' },
  { id: 3, name: 'نور الدين حنا', email: 'n.hanna@engprop.sy', role: 'مساعد', permissions: ['المواعيد'], status: 'دعوة معلقة' }
];

const plans = [
  { name: 'الأساسية', price: 'مجانية', properties: 10, employees: 2, features: ['إدارة العملاء', 'بطاقة مكتب عامة'] },
  { name: 'الاحترافية', price: '29$ / شهرياً', properties: 100, employees: 10, features: ['تقارير متقدمة', 'QR ووسائل التواصل', 'دعم الأولوية'] },
  { name: 'الشركات', price: '79$ / شهرياً', properties: 'غير محدود', employees: 'غير محدود', features: ['صلاحيات متقدمة', 'دعم مدير حساب', 'تصدير البيانات'] }
];

function ModuleHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div><span className="text-xs font-bold text-sky-600">{eyebrow}</span><h2 className="text-2xl font-black text-slate-900 mt-1">{title}</h2><p className="text-xs text-slate-500 mt-2">{description}</p></div>
      {action}
    </div>
  );
}

export function LeadsModule() {
  const [leads, setLeads] = useState(seedLeads);
  const [filter, setFilter] = useState('الكل');
  const [notice, setNotice] = useState('');
  const statuses = ['جديد', 'متابعة', 'مؤهل', 'مغلق'];
  useEffect(() => {
    getAgencyLeads().then(({ items }) => {
      if (items?.length) setLeads(items.map(item => ({ id: item.id, ...item.data, status: item.stage })));
    }).catch(() => setNotice('تعذر تحميل العملاء من الخادم'));
  }, []);
  const visible = leads.filter((lead) => filter === 'الكل' || lead.status === filter);
  return <div className="space-y-6">
    <ModuleHeader eyebrow="CRM" title="العملاء المحتملون" description="حوّل طلبات الاستفسار إلى صفقات وتابع كل فرصة من مكان واحد." action={<button type="button" onClick={async () => { try { const { lead } = await createAgencyLead({ name: 'عميل جديد', stage: 'new' }); setLeads(current => [{ id: lead.id, name: 'عميل جديد', status: 'جديد' }, ...current]); } catch { setNotice('تعذر إضافة العميل'); } }} className="px-4 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold flex items-center gap-2"><UserPlus className="w-4 h-4" />إضافة عميل</button>} />
    {notice && <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-700 p-3 text-xs font-bold">{notice}</div>}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{statuses.map((status) => <button type="button" key={status} onClick={() => setFilter(status)} className={`rounded-2xl border p-4 text-right ${filter === status ? 'border-sky-400 bg-sky-50' : 'border-slate-200 bg-white'}`}><span className="text-xs text-slate-500">{status}</span><strong className="block text-2xl text-slate-900 mt-1">{leads.filter((lead) => lead.status === status).length}</strong></button>)}</div>
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden"><div className="p-4 border-b border-slate-100 flex gap-2"><button type="button" onClick={() => setFilter('الكل')} className="text-xs font-bold text-sky-600">كل العملاء ({leads.length})</button></div><div className="divide-y divide-slate-100">{visible.map((lead) => <div key={lead.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"><div><span className="text-[11px] text-slate-400 font-mono">{lead.id} • {lead.source || 'الموقع'}</span><strong className="block text-sm text-slate-900 mt-1">{lead.name}</strong><span className="text-xs text-slate-500">{lead.interest || 'استفسار عقاري'} {lead.property ? `— ${lead.property}` : ''}</span></div><div className="flex items-center gap-3"><span dir="ltr" className="text-xs text-slate-500">{lead.phone}</span><select value={lead.status} onChange={async (event) => { const next = event.target.value; try { await updateAgencyLead(lead.id, next === 'جديد' ? 'new' : next); setLeads(current => current.map(item => item.id === lead.id ? { ...item, status: next } : item)); } catch { setNotice('تعذر تحديث مرحلة العميل'); } }} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold bg-white">{statuses.map((status) => <option key={status}>{status}</option>)}</select></div></div>)}</div></div>
  </div>;
}

export function EmployeesModule() {
  const [employees, setEmployees] = useState(seedEmployees);
  const [notice, setNotice] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'وسيط عقاري' });
  useEffect(() => {
    getAgencyStaff().then(({ items }) => { if (items?.length) setEmployees(items); }).catch(() => setNotice('تعذر تحميل الموظفين من الخادم'));
  }, []);
  const togglePermission = (id, permission) => setEmployees((current) => current.map((employee) => employee.id === id ? { ...employee, permissions: employee.permissions.includes(permission) ? employee.permissions.filter((item) => item !== permission) : [...employee.permissions, permission] } : employee));
  const permissions = ['العقارات', 'العملاء', 'المواعيد', 'التقارير'];
  const addEmployee = (event) => {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    if (!name || !email) return;
    inviteAgencyStaff({ name, email, role: 'agent', permissions: ['properties.view', 'appointments.view'] })
      .then(({ staff, temporaryPassword }) => {
        setEmployees(current => [staff, ...current]);
        setForm({ name: '', email: '', role: 'وسيط عقاري' });
        setShowForm(false);
        setNotice(`تمت إضافة الدعوة. كلمة المرور المؤقتة: ${temporaryPassword}`);
      })
      .catch(error => setNotice(error.message || 'تعذر دعوة الموظف'));
  };
  return <div className="space-y-6">
    <ModuleHeader eyebrow="الفريق والصلاحيات" title="الموظفون" description="أدر أعضاء فريق المكتب وحدد ما يمكن لكل مستخدم الوصول إليه." action={<button type="button" onClick={() => setShowForm((current) => !current)} className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-2"><Mail className="w-4 h-4" />{showForm ? 'إغلاق النموذج' : 'دعوة موظف'}</button>} />
    {notice && <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 text-xs font-bold flex justify-between">{notice}<button type="button" onClick={() => setNotice('')}><X className="w-4 h-4" /></button></div>}
    {showForm && <form onSubmit={addEmployee} className="bg-white border border-sky-200 rounded-3xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
      <label className="space-y-1.5"><span className="block text-xs font-bold text-slate-700">اسم الموظف</span><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="مثال: أحمد محمد" className="settings-input" /></label>
      <label className="space-y-1.5"><span className="block text-xs font-bold text-slate-700">البريد الإلكتروني</span><input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="employee@example.com" className="settings-input" /></label>
      <label className="space-y-1.5"><span className="block text-xs font-bold text-slate-700">الدور الوظيفي</span><select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="settings-input"><option>وسيط عقاري</option><option>مدير المكتب</option><option>مساعد</option><option>محاسب</option></select></label>
      <div className="md:col-span-3 flex justify-end gap-2"><button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">إلغاء</button><button type="submit" className="px-5 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold">إضافة وإرسال الدعوة</button></div>
    </form>}
    <div className="space-y-3">{employees.map((employee) => <div key={employee.id} className="bg-white border border-slate-200 rounded-2xl p-5"><div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-black">{employee.name.slice(0, 1)}</div><div><strong className="block text-sm text-slate-900">{employee.name}</strong><span className="text-xs text-slate-500">{employee.email} • {employee.role}</span></div></div><div className="flex flex-wrap gap-2">{permissions.map((permission) => <button type="button" key={permission} onClick={() => togglePermission(employee.id, permission)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border ${employee.permissions.includes(permission) ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>{employee.permissions.includes(permission) ? <Check className="inline w-3 h-3 ml-1" /> : null}{permission}</button>)}</div><span className={`text-[11px] font-bold ${employee.status === 'نشط' ? 'text-emerald-600' : 'text-amber-600'}`}>{employee.status}</span></div></div>)}</div>
    <div className="rounded-2xl bg-slate-900 text-white p-5 flex items-center gap-3 text-xs"><ShieldCheck className="w-5 h-5 text-sky-300" /><span>الصلاحيات محلية لهذه الجلسة ويمكن ربطها لاحقاً بنظام المستخدمين في الخادم.</span></div>
  </div>;
}

export function SubscriptionModule({ propertyCount = 0 }) {
  const [selected, setSelected] = useState(1);
  const usage = Math.min(propertyCount, 100);
  return <div className="space-y-6">
    <ModuleHeader eyebrow="الاشتراك والحدود" title="باقة المكتب" description="راقب استخدامك واختر الباقة التي تناسب نمو أعمالك." />
    <div className="bg-gradient-to-l from-slate-900 to-sky-900 text-white rounded-3xl p-6"><div className="flex items-center justify-between"><div><span className="text-xs text-sky-200">الباقة الحالية</span><h3 className="text-2xl font-black mt-1">{plans[selected].name}</h3></div><Crown className="w-8 h-8 text-amber-300" /></div><div className="mt-6"><div className="flex justify-between text-xs text-sky-100"><span>العقارات المستخدمة</span><span>{propertyCount} / 100</span></div><div className="h-2 rounded-full bg-white/20 mt-2 overflow-hidden"><div className="h-full bg-sky-300 rounded-full" style={{ width: `${usage}%` }} /></div></div></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{plans.map((plan, index) => <button type="button" key={plan.name} onClick={() => setSelected(index)} className={`text-right bg-white rounded-2xl border-2 p-5 ${selected === index ? 'border-sky-500 shadow-lg' : 'border-slate-200'}`}><span className="text-xs text-slate-500">باقة</span><h3 className="text-lg font-black text-slate-900 mt-1">{plan.name}</h3><strong className="block text-sky-600 mt-2">{plan.price}</strong><div className="text-xs text-slate-500 mt-4 space-y-2"><p>حتى {plan.properties} عقار</p><p>حتى {plan.employees} موظفين</p>{plan.features.map((feature) => <p key={feature}>✓ {feature}</p>)}</div></button>)}</div>
  </div>;
}

export function QrSocialModule() {
  const [copied, setCopied] = useState(false);
  const link = 'https://engprop.sy/office/midan-9042';
  const copyLink = async () => { try { await navigator.clipboard.writeText(link); } catch { /* clipboard unavailable in preview */ } setCopied(true); window.setTimeout(() => setCopied(false), 1800); };
  return <div className="space-y-6">
    <ModuleHeader eyebrow="التسويق الرقمي" title="QR والبطاقات الاجتماعية" description="شارك صفحة مكتبك وملفاتك التعريفية عبر رابط واحد قابل للمشاركة." action={<button type="button" onClick={copyLink} className="px-4 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold flex items-center gap-2"><Copy className="w-4 h-4" />{copied ? 'تم النسخ' : 'نسخ الرابط'}</button>} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5"><div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center text-center"><div className="w-48 h-48 rounded-2xl bg-slate-900 text-white flex items-center justify-center"><QrCode className="w-32 h-32" /></div><h3 className="font-black text-slate-900 mt-5">امسح للوصول إلى مكتب المهندس محمود هنداوي</h3><p className="text-xs text-slate-500 mt-2">حلب - أعزاز • 0951494682</p></div><div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4"><h3 className="font-black text-slate-900">بطاقة المشاركة</h3><div className="rounded-2xl bg-gradient-to-l from-sky-700 to-blue-900 p-5 text-white"><span className="text-xs text-sky-100">EngProp • مكتب موثق</span><h4 className="text-xl font-black mt-8">مكتب المهندس محمود هنداوي</h4><p className="text-xs text-sky-100 mt-1">حلب - أعزاز • 0951494682</p><div className="flex gap-2 mt-6 text-xs"><span className="px-2 py-1 rounded-lg bg-white/15"><Link2 className="inline w-3 h-3 ml-1" />{link}</span></div></div><button type="button" onClick={copyLink} className="w-full rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-700">مشاركة البطاقة</button></div></div>
  </div>;
}

export default function OfficeManagementModules({ activeTab, propertyCount }) {
  const modules = useMemo(() => ({ leads: <LeadsModule />, employees: <EmployeesModule />, subscription: <SubscriptionModule propertyCount={propertyCount} />, 'qr-cards': <QrSocialModule /> }), [propertyCount]);
  return modules[activeTab] || null;
}
