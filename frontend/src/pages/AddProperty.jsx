import React, { useState } from 'react';
import { 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight, 
  UploadCloud, 
  X,
  FileSpreadsheet,
  Download,
  AlertCircle
} from 'lucide-react';
import { cities } from '../data/propertiesData';
import LocationPicker from '../components/map/LocationPicker';
import { readPropertySpreadsheet } from '../utils/propertySpreadsheet';

export default function AddProperty({ onAddPropertySuccess, onAddPropertiesSuccess, setActivePage }) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [importRows, setImportRows] = useState([]);
  const [importError, setImportError] = useState('');
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'شقة',
    purpose: 'للإيجار',
    city: 'دمشق',
    location: '',
    coords: null,
    price: '',
    priceUnit: '$/شهرياً',
    area: '',
    rooms: '3',
    bathrooms: '2',
    floor: 'الطابق 2',
    description: '',
    features: ['تكييف مركزي', 'مصعد سريع', 'طاقة شمسية 24/7'],
    images: ['/assets/images/74e3791940a62972275dd2c23dbee27e57215cf5.jpg'],
    agencyName: 'مكتب المهندس محمود هنداوي العقاري',
    phone: '0951494682'
  });

  const availableImages = [
    '/assets/images/74e3791940a62972275dd2c23dbee27e57215cf5.jpg',
    '/assets/images/614f66a16dbe4a11ecf31e286b252ab316f120aa.png',
    '/assets/images/53ee67db148deef332a8afd240ab7e3dc287db8a.png',
    '/assets/images/9dacb1c0fef6be5ce4bf920ee302085bcd3c8c62.jpg',
    '/assets/images/af96a8dfef4a405a6b98308528432440891a8af7.jpg',
    '/assets/images/a765a62d22939492ed9b6a7e9358a60f09603ea2.png',
    '/assets/images/74e3791940a62972275dd2c23dbee27e57215cf5.jpg'
  ];

  const handleSpreadsheet = async (file) => {
    if (!file) return;
    setImportError('');
    setImportRows([]);
    setImporting(true);
    try {
      const rows = await readPropertySpreadsheet(file);
      setImportRows(rows);
      if (!rows.length) setImportError('لا توجد عقارات في الملف.');
    } catch (error) {
      setImportError(error.message || 'تعذر قراءة الملف.');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = '\uFEFFالعنوان,المدينة,الحي والعنوان,السعر,نوع العملية,نوع العقار,المساحة,الغرف,الحمامات,الوصف,رابط الصورة,خط العرض,خط الطول\r\nشقة للبيع في الميدان,دمشق,الميدان - شارع الجزماتية,85000,للبيع,شقة,145,3,2,شقة واسعة ومجددة,,33.4893,36.2967\r\n';
    const url = URL.createObjectURL(new Blob([template], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'قالب-استيراد-العقارات.csv';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const confirmImport = async () => {
    const rowsToImport = importRows.filter((row) => !row.errors.length);
    if (!rowsToImport.length) {
      setImportError('لا توجد صفوف سليمة للاستيراد. أصلح الأخطاء في الملف ثم أعد رفعه.');
      return;
    }
    setImporting(true);
    setImportError('');
    try {
      const properties = rowsToImport.map(({ property }, index) => ({
        ...property,
        id: Date.now() + index,
        priceUnit: property.purpose === 'للإيجار' ? '$/شهرياً' : '$',
        priceSYP: `${(property.price * 15000).toLocaleString('en-US')} ل.س`,
        images: [property.image],
        publishedAt: 'الآن',
        featured: false,
        verified: true,
        viewsCount: 0,
        agency: {
          id: 99,
          name: formData.agencyName,
          phone: formData.phone,
          whatsapp: formData.phone.replace(/[^0-9]/g, ''),
          rating: 5,
          verified: true
        }
      }));
      await onAddPropertiesSuccess(properties);
      setImportedCount(properties.length);
      setBulkModalOpen(false);
      setSubmitted(true);
    } catch (error) {
      if (error.savedCount) {
        let remainingSaved = error.savedCount;
        setImportRows((rows) => rows.filter((row) => {
          if (row.errors.length || remainingSaved === 0) return true;
          remainingSaved -= 1;
          return false;
        }));
      }
      setImportError(error.message || 'تعذر حفظ العقارات.');
    } finally {
      setImporting(false);
    }
  };

  const handleNext = (e) => {
    e?.preventDefault();
    if (step === 1 && !formData.coords) {
      setSubmitError('حدد موقع العقار على الخريطة قبل المتابعة.');
      return;
    }
    setSubmitError('');
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.coords) {
      setStep(1);
      setSubmitError('حدد موقع العقار على الخريطة قبل نشر الإعلان.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    setImportedCount(0);
    const priceValue = Number(formData.price) || 500;
    const newProperty = {
      ...formData,
      id: Date.now(),
      price: priceValue,
      priceUSD: priceValue,
      priceSYP: `${(priceValue * 15000).toLocaleString('en-US')} ل.س`,
      area: Number(formData.area) || 120,
      rooms: Number(formData.rooms) || 3,
      bedrooms: Number(formData.rooms) || 3,
      bathrooms: Number(formData.bathrooms) || 2,
      district: formData.location || 'المنطقة السكنية',
      location: formData.location || `${formData.city} - المنطقة السكنية`,
      city: formData.city,
      type: formData.type,
      purpose: formData.purpose,
      title: formData.title || 'عقار جديد',
      description: formData.description || 'عقار جديد تم إدخاله من لوحة إضافة العقارات.',
      image: formData.images?.[0] || '/assets/images/74e3791940a62972275dd2c23dbee27e57215cf5.jpg',
      images: formData.images?.length ? formData.images : ['/assets/images/74e3791940a62972275dd2c23dbee27e57215cf5.jpg'],
      publishedAt: 'الآن',
      featured: false,
      verified: true,
      viewsCount: 0,
      agency: {
        id: 99,
        name: formData.agencyName,
        phone: formData.phone,
        whatsapp: formData.phone.replace(/[^0-9]/g, ''),
        rating: 5.0,
        verified: true,
        avatar: '/assets/images/0342e4849ee5e228880170b0433b30d1d1d6fcde.png'
      },
      coords: formData.coords
    };

    try {
      if (onAddPropertySuccess) {
        await onAddPropertySuccess(newProperty);
      }
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error.message || 'تعذر حفظ العقار');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-blue-600 block mb-1">بوابة المكاتب العقارية</span>
          <h1 className="text-2xl font-black text-slate-900">إضافة إعلان عقار جديد</h1>
          <p className="text-xs text-slate-500 mt-0.5">أدخل بيانات ومواصفات العقار بدقة ليظهر للباحثين مباشرة</p>
        </div>

        <button
          onClick={() => setBulkModalOpen(true)}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>استيراد من Excel أو CSV</span>
        </button>
      </div>

      {submitted ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">{importedCount ? `تم استيراد ${importedCount} عقار بنجاح!` : 'تم نشر العقار بنجاح!'}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            عقارك الآن منشور ونشط على شبكة EngProp وسيظهر في نتائج البحث والخريطة التفاعلية فوراً.
          </p>
          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={() => { setSubmitted(false); setStep(1); }}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200"
            >
              إضافة عقار آخر
            </button>
            <button
              onClick={() => setActivePage('properties')}
              className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700"
            >
              مشاهدة في قائمة العقارات
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
          
          {/* Stepper indicator */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold border-b border-slate-100 pb-6">
            {[
              { num: 1, label: 'البيانات الأساسية' },
              { num: 2, label: 'المواصفات الفنية' },
              { num: 3, label: 'الصور والوسائط' },
              { num: 4, label: 'السعر والنشر' },
            ].map((s) => (
              <div 
                key={s.num}
                className={`flex flex-col items-center gap-1.5 ${
                  step >= s.num ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step === s.num 
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                    : step > s.num 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {step > s.num ? '✓' : s.num}
                </div>
                <span className="text-[11px] hidden sm:block">{s.label}</span>
              </div>
            ))}
          </div>

          <form onSubmit={step === 4 ? handleSubmit : handleNext} className="space-y-6">
            {submitError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">{submitError}</div>}
            
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">عنوان الإعلان *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: شقة ديلوكس 3 غرف في الميدان بالقرب من الحديقة"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع العملية *</label>
                    <select
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      <option value="للإيجار">للإيجار</option>
                      <option value="للبيع">للبيع</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع العقار *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      <option value="شقة">شقة سكنية</option>
                      <option value="فيلا">فيلا / قصر</option>
                      <option value="مكتب">مكتب تجاري</option>
                      <option value="بنتهاوس">بنتهاوس</option>
                      <option value="تجاري">مستودع / تجاري</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">المدينة / المنطقة *</label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value, coords: null })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      {cities.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">العنوان التفصيلي والحي *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: دمشق - حي الميدان - بالقرب من شارع الجزماتية"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <LocationPicker
                  key={formData.city}
                  city={formData.city}
                  value={formData.coords}
                  onChange={(coords) => setFormData((current) => ({ ...current, coords }))}
                />
                {submitError && <p role="alert" className="text-xs font-semibold text-red-600">{submitError}</p>}
              </div>
            )}

            {/* Step 2: Specs & Features */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">المساحة (م²) *</label>
                    <input
                      type="number"
                      required
                      placeholder="مثال: 145"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">عدد الغرف</label>
                    <select
                      value={formData.rooms}
                      onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <option value="1">غرفة وصالون</option>
                      <option value="2">غرفتين وصالون</option>
                      <option value="3">3 غرف وصالون</option>
                      <option value="4">4 غرف وصالون</option>
                      <option value="5">5 غرف فأكثر</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">عدد الحمامات</label>
                    <select
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <option value="1">حمام 1</option>
                      <option value="2">2 حمام</option>
                      <option value="3">3 حمامات</option>
                      <option value="4">4 حمامات فأكثر</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">الطابق</label>
                    <input
                      type="text"
                      placeholder="مثال: الطابق 3"
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">الوصف التفصيلي</label>
                  <textarea
                    rows="3"
                    placeholder="اكتب وصفاً جذاباً ودقيقاً للعقار يشمل حالة الكسوة والمرافق المحيطة..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  ></textarea>
                </div>
              </div>
            )}

            {/* Step 3: Images */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    حدد صور العقار (يمكنك الاختيار من أصول التصميم المتاحة أو رفع صور جديدة):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {availableImages.map((img, idx) => {
                      const isSelected = formData.images.includes(img);
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (isSelected) {
                              setFormData({ ...formData, images: formData.images.filter(i => i !== img) });
                            } else {
                              setFormData({ ...formData, images: [...formData.images, img] });
                            }
                          }}
                          className={`relative h-24 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                            isSelected ? 'border-blue-600 ring-2 ring-blue-300' : 'border-slate-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          {isSelected && (
                            <span className="absolute top-1 right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                              ✓
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-2 bg-slate-50">
                  <UploadCloud className="w-8 h-8 text-blue-500 mx-auto" />
                  <span className="block text-xs font-bold text-slate-700">اسحب وأفلت صور إضافية هنا</span>
                  <span className="text-[11px] text-slate-400">يدعم صيغ PNG, JPG حتى 10 ميغابايت لكل صورة</span>
                </div>
              </div>
            )}

            {/* Step 4: Price & Publish */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">السعر المطلوب بالدولار ($) *</label>
                    <input
                      type="number"
                      required
                      placeholder="مثال: 350"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-600 text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">وحدة السعر</label>
                    <select
                      value={formData.priceUnit}
                      onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      <option value="$/شهرياً">$/شهرياً (للإيجار)</option>
                      <option value="$">$ دولار قطعي (للبيع)</option>
                      <option value="$/سنوياً">$/سنوياً</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم المكتب / الوسيط المسؤول</label>
                    <input
                      type="text"
                      value={formData.agencyName}
                      onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم هاتف التواصل والواتساب</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 space-y-1">
                  <span className="font-bold block">مراجعة نهائية قبل النشر:</span>
                  <p>العقار سيتم توثيقه وإتاحته لجميع المستخدمين على الصفحة الرئيسية ودليل العقارات والخريطة التفاعلية فور الضغط على تأكيد النشر.</p>
                </div>
              </div>
            )}

            {/* Stepper Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>
              ) : <div></div>}

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <span>{submitting ? 'جاري الحفظ...' : step === 4 ? 'تأكيد ونشر الإعلان' : 'المتابعة للخطوة التالية'}</span>
                {step < 4 && <ArrowLeft className="w-4 h-4" />}
              </button>
            </div>

          </form>

        </div>
      )}

      {/* Bulk Import Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4" dir="rtl" lang="ar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>استيراد العقارات من ملف Excel أو CSV</span>
              </h3>
              <button type="button" onClick={() => { setBulkModalOpen(false); setImportError(''); }} aria-label="إغلاق" className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-6">
              ارفع ملف XLSX أو CSV. يجب أن يتضمن كل صف العنوان والمدينة والحي والسعر والمساحة وإحداثيات الموقع. نزّل القالب لتجهيز ملفك بالأعمدة المطلوبة.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={downloadTemplate} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
                <Download className="h-4 w-4 text-blue-600" /> تنزيل قالب الاستيراد
              </button>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700">
                <UploadCloud className="h-4 w-4" />
                {importing ? 'جارٍ تجهيز الملف...' : 'اختيار ملف Excel أو CSV'}
                <input type="file" accept=".xlsx,.csv" className="sr-only" disabled={importing} onChange={(event) => { handleSpreadsheet(event.target.files?.[0]); event.target.value = ''; }} />
              </label>
            </div>

            {importError && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{importError}</div>}

            {importRows.length > 0 && <>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-slate-700">معاينة الملف: {importRows.length} عقار</span>
                <span className="text-emerald-700">صالح للاستيراد: {importRows.filter((row) => !row.errors.length).length}</span>
                <span className="text-red-600">يحتاج تصحيحًا: {importRows.filter((row) => row.errors.length).length}</span>
              </div>
              <div className="max-h-72 overflow-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[680px] text-right text-xs">
                  <thead className="sticky top-0 bg-slate-50 text-slate-600"><tr>
                    <th className="p-3">الصف</th><th className="p-3">العقار</th><th className="p-3">المدينة</th><th className="p-3">السعر</th><th className="p-3">المساحة</th><th className="p-3">حالة الصف</th>
                  </tr></thead>
                  <tbody>{importRows.map((row) => <tr key={row.rowNumber} className="border-t border-slate-100">
                    <td className="p-3">{row.rowNumber}</td><td className="p-3 font-semibold">{row.property.title || '—'}</td><td className="p-3">{row.property.city || '—'}</td><td className="p-3">{row.property.price || '—'}</td><td className="p-3">{row.property.area || '—'} م²</td>
                    <td className={`p-3 ${row.errors.length ? 'text-red-600' : 'text-emerald-700'}`}>{row.errors.length ? row.errors.join('، ') : 'جاهز'}</td>
                  </tr>)}</tbody>
                </table>
              </div>
            </>}

            {importing && <div className="p-8 text-center text-xs font-semibold text-slate-500">جارٍ قراءة الملف وحفظ العقارات...</div>}

            {!importRows.length && !importing && <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <UploadCloud className="w-8 h-8 text-blue-500 mx-auto" />
              <span className="mt-2 block text-xs font-bold text-slate-700">اختر ملفًا لعرض العقارات ومراجعتها قبل الاستيراد</span>
            </div>}

            <div className="flex justify-between gap-3 border-t border-slate-100 pt-4">
              <button type="button" onClick={() => { setBulkModalOpen(false); setImportRows([]); setImportError(''); }} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800">إلغاء</button>
              <button type="button" disabled={importing || !importRows.some((row) => !row.errors.length)} onClick={confirmImport} className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">استيراد العقارات السليمة</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
