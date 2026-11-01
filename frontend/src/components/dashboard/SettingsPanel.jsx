import React, { useEffect, useState } from 'react';
import { Bell, Building2, Check, Clock3, ImagePlus, LockKeyhole, MapPin, Save, UserRound, X } from 'lucide-react';
import { getAgencyOverview, updateAgencySettings } from '../../services/api';

const defaultOfficeCover = '/assets/properties/office_damascus.jpg';

export default function SettingsPanel({ kind = 'office', onCoverChange }) {
  const isAdmin = kind === 'admin';
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [coverImage, setCoverImage] = useState(() => localStorage.getItem('engprop_office_cover') || defaultOfficeCover);
  const [logoImage, setLogoImage] = useState(() => localStorage.getItem('engprop_office_logo') || '/assets/engprop-logo-icon.png');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAdmin) return;
    getAgencyOverview().then(({ agency }) => {
      const data = JSON.parse(agency?.data || '{}');
      if (data.cover) setCoverImage(data.cover);
      if (data.logo) setLogoImage(data.logo);
    }).catch(() => setError('تعذر تحميل إعدادات المكتب'));
  }, [isAdmin]);

  const handleCoverUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const nextCover = String(reader.result);
      setCoverImage(nextCover);
      localStorage.setItem('engprop_office_cover', nextCover);
      onCoverChange?.(nextCover);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const nextLogo = String(reader.result);
      setLogoImage(nextLogo);
      localStorage.setItem('engprop_office_logo', nextLogo);
    };
    reader.readAsDataURL(file);
  };

  const clearCover = () => {
    setCoverImage('');
    localStorage.removeItem('engprop_office_cover');
    onCoverChange?.('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isAdmin) {
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
      return;
    }
    setSaving(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      await updateAgencySettings({
        name: form.get('agencyName'),
        description: form.get('description'),
        storeUrl: form.get('storeUrl'),
        address: form.get('address'),
        phone: form.get('officePhone'),
        hours: form.get('hours'),
        city: form.get('city'),
        logo: logoImage,
        cover: coverImage,
        emailNotifications: notifications,
        twoFactor
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (submitError) {
      setError(submitError.message || 'تعذر حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-sky-600">الإعدادات</span>
        <h2 className="text-2xl font-black text-slate-900 mt-1">{isAdmin ? 'إعدادات المنصة' : 'إعدادات المكتب'}</h2>
        <p className="text-xs text-slate-500 mt-1">حدّث بيانات الحساب والهوية والإشعارات من مكان واحد.</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
          <Check className="w-4 h-4" /> تم حفظ التغييرات بنجاح
        </div>
      )}
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600"><UserRound className="w-5 h-5" /></div>
            <div>
              <h3 className="font-black text-sm text-slate-900">بيانات الحساب</h3>
              <p className="text-[11px] text-slate-500">المعلومات الأساسية الظاهرة في النظام</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
            <label className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700">الاسم</span>
              <input defaultValue={isAdmin ? 'مدير منصة EngProp' : 'المهندس محمود هنداوي'} className="settings-input" />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700">البريد الإلكتروني</span>
              <input type="email" defaultValue={isAdmin ? 'admin@engprop.sy' : 'office@engprop.sy'} className="settings-input" />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700">رقم الهاتف</span>
              <input dir="ltr" defaultValue="0951494682" className="settings-input" />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700">المدينة</span>
              <select defaultValue="حلب" className="settings-input">
                <option>دمشق</option><option>حلب</option><option>إعزاز</option><option>ريف حلب</option>
              </select>
            </label>
          </div>
        </section>

        {!isAdmin && (
          <section className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><Building2 className="w-5 h-5" /></div>
              <div>
                <h3 className="font-black text-sm text-slate-900">هوية المكتب</h3>
                <p className="text-[11px] text-slate-500">الاسم والوصف ومعلومات المتجر العام</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
              <label className="space-y-1.5"><span className="text-xs font-bold text-slate-700">اسم المكتب</span><input name="agencyName" defaultValue="مكتب المهندس محمود هنداوي العقاري" className="settings-input" /></label>
              <label className="space-y-1.5"><span className="text-xs font-bold text-slate-700">رابط المتجر</span><input name="storeUrl" dir="ltr" defaultValue="engprop.sy/offices/engprop" className="settings-input" /></label>
              <label className="md:col-span-2 space-y-1.5"><span className="text-xs font-bold text-slate-700">وصف المكتب</span><textarea name="description" defaultValue="مكتب عقاري موثق في حلب وأعزاز متخصص في بيع وتأجير الشقق والفلل." rows="4" className="settings-input resize-none" /></label>
              <div className="space-y-2">
                <span className="block text-xs font-bold text-slate-700">شعار المكتب</span>
                <div className="flex items-center gap-3">
                  <img src={logoImage} alt="شعار المكتب" className="w-14 h-14 rounded-2xl border border-slate-200 object-contain bg-white p-2" />
                  <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 hover:text-sky-700">
                    تغيير الشعار
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="sr-only" />
                  </label>
                </div>
              </div>
              <label className="space-y-1.5"><span className="text-xs font-bold text-slate-700"><MapPin className="inline w-3.5 h-3.5 ml-1" />العنوان والموقع</span><input name="address" defaultValue="حلب - أعزاز" className="settings-input" /></label>
              <label className="space-y-1.5"><span className="text-xs font-bold text-slate-700">رقم التواصل</span><input name="officePhone" dir="ltr" defaultValue="0951494682" className="settings-input" /></label>
              <label className="space-y-1.5"><span className="text-xs font-bold text-slate-700"><Clock3 className="inline w-3.5 h-3.5 ml-1" />ساعات العمل</span><input name="hours" defaultValue="09:00 - 18:00" className="settings-input" /></label>
              <div className="md:col-span-2 space-y-2">
                <span className="block text-xs font-bold text-slate-700">صورة غلاف المكتب</span>
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  {coverImage ? (
                    <img src={coverImage} alt="معاينة غلاف المكتب" className="h-44 w-full object-cover" />
                  ) : (
                    <div className="h-44 flex flex-col items-center justify-center gap-2 text-slate-400"><ImagePlus className="w-8 h-8" /><span className="text-xs">لم يتم اختيار صورة غلاف</span></div>
                  )}
                  {coverImage && (
                    <button type="button" onClick={clearCover} className="absolute left-3 top-3 rounded-lg bg-white/90 p-2 text-slate-600 shadow-sm hover:text-rose-600" title="إزالة صورة الغلاف">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:border-sky-300 hover:text-sky-700">
                  <ImagePlus className="w-4 h-4" />
                  اختيار صورة من الجهاز
                  <input type="file" accept="image/*" onChange={handleCoverUpload} className="sr-only" />
                </label>
                <p className="text-[11px] text-slate-400">تظهر الصورة في رأس لوحة المكتب. يفضل استخدام صورة أفقية واضحة.</p>
              </div>
            </div>
          </section>
        )}

        <section className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><Bell className="w-5 h-5" /></div>
            <div>
              <h3 className="font-black text-sm text-slate-900">الإشعارات والأمان</h3>
              <p className="text-[11px] text-slate-500">تحكم بالتنبيهات وحماية الحساب</p>
            </div>
          </div>
          <div className="space-y-4 pt-5">
            <label className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 cursor-pointer">
              <span><strong className="block text-xs text-slate-800">إشعارات البريد</strong><small className="text-[11px] text-slate-500">تنبيهات العقود والمواعيد والتحديثات</small></span>
              <input type="checkbox" checked={notifications} onChange={(event) => setNotifications(event.target.checked)} className="w-5 h-5 accent-sky-600" />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 cursor-pointer">
              <span><strong className="block text-xs text-slate-800">المصادقة الثنائية</strong><small className="text-[11px] text-slate-500">طبقة حماية إضافية عند تسجيل الدخول</small></span>
              <input type="checkbox" checked={twoFactor} onChange={(event) => setTwoFactor(event.target.checked)} className="w-5 h-5 accent-sky-600" />
            </label>
            <button type="button" className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-sky-700"><LockKeyhole className="w-4 h-4" /> تغيير كلمة المرور</button>
          </div>
        </section>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-xs font-bold text-white hover:bg-sky-700 disabled:opacity-60">
            <Save className="w-4 h-4" /> {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      </form>
    </div>
  );
}
