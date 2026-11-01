import React, { useState } from 'react';
import { 
  Check, 
  X, 
  ArrowLeft, 
  Trash2, 
  MapPin, 
  Building, 
  Plus, 
  Printer, 
  Share2, 
  MessageCircle, 
  Compass, 
  Calendar, 
  ShieldCheck, 
  Star,
  Sparkles
} from 'lucide-react';
import { properties } from '../data/propertiesData';

export default function CompareProperties({ 
  comparedProperties = [], 
  onRemoveFromCompare, 
  onClearCompare,
  onSelectProperty,
  onAddToCompare,
  setActivePage,
  propertyList = properties
}) {
  const [highlightDifferences, setHighlightDifferences] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  const currentProperties = propertyList?.length ? propertyList : properties;

  // Available properties that can be added to compare
  const availableToAdd = currentProperties.filter(
    p => !comparedProperties.some(cp => cp.id === p.id)
  );

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'مقارنة عقارات - EngProp',
        text: `مقارنة بين ${comparedProperties.length} عقارات في سوريا عبر منصة EngProp`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to check if a row has differences across compared properties
  const isRowDifferent = (getter) => {
    if (comparedProperties.length < 2) return false;
    const firstVal = getter(comparedProperties[0]);
    return comparedProperties.some(p => getter(p) !== firstVal);
  };

  if (comparedProperties.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <Building className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">لم تقم بإضافة عقارات للمقارنة بعد</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            يمكنك مقارنة حتى 4 عقارات مختلفة جنباً إلى جنب للتعرف على أفضل الأسعار، المساحات، وتجهيزات الطاقة والميزات بنقرة واحدة.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setActivePage('properties')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>تصفح العقارات الآن</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 print:py-2">
      
      {/* Toast alert for copied link */}
      {copiedToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-2xl border border-slate-700 animate-in fade-in duration-200">
          تم نسخ رابط المقارنة بنجاح!
        </div>
      )}

      {/* Header & Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
              المقارنة المتزامنة
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ({comparedProperties.length} من أصل 4 عقارات)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            مقارنة العقارات المختارة
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            قارن بدقة بين الأسعار بالدولار والليرة السورية، وسعر المتر، والواجهات وتجهيزات الطاقة لاختيار الأنسب.
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Add Property Button */}
          {comparedProperties.length < 4 && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عقار ({4 - comparedProperties.length} متاح)</span>
            </button>
          )}

          {/* Highlight Differences Toggle */}
          <button
            onClick={() => setHighlightDifferences(!highlightDifferences)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              highlightDifferences
                ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-200'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="تمييز وتلوين الحقول المختلفة بين العقارات"
          >
            <Sparkles className={`w-3.5 h-3.5 ${highlightDifferences ? 'text-amber-600' : 'text-slate-400'}`} />
            <span>تمييز الفروقات</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            title="مشاركة جدول المقارنة"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>مشاركة</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            title="طباعة المقارنة بصيغة ورقية / PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>طباعة</span>
          </button>

          {/* Clear All Button */}
          <button
            onClick={onClearCompare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all cursor-pointer"
            title="إفراغ قائمة المقارنة كاملة"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>مسح الكل</span>
          </button>
        </div>
      </div>

      {/* Comparison Table / Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-x-auto">
        <table className="w-full text-right border-collapse min-w-[760px]">
          <tbody>
            
            {/* ROW 1: Property Card & Image */}
            <tr className="border-b border-slate-100">
              <td className="p-4 w-44 font-bold text-xs text-slate-500 bg-slate-50/70 align-top">
                <span className="block font-black text-slate-800 mb-1">العقار المعروض</span>
                <span className="text-[11px] text-slate-400">نظرة عامة وصور</span>
              </td>
              {comparedProperties.map(p => (
                <td key={p.id} className="p-4 w-64 align-top">
                  <div className="relative rounded-2xl overflow-hidden mb-3 h-44 border border-slate-200 shadow-xs group">
                    <img 
                      src={p.image || p.images?.[0] || p.gallery?.[0] || '/assets/images/74e3791940a62972275dd2c23dbee27e57215cf5.jpg'} 
                      alt={p.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    {/* Remove single button */}
                    <button
                      onClick={() => onRemoveFromCompare(p.id)}
                      className="absolute top-2 left-2 p-1.5 rounded-full bg-black/60 hover:bg-red-600 text-white transition-colors cursor-pointer shadow-md print:hidden"
                      title="إزالة هذا العقار من المقارنة"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {/* Purpose tag */}
                    <span className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-lg bg-blue-600 text-white text-[11px] font-bold shadow-md">
                      {p.purpose}
                    </span>
                    {/* Verified badge */}
                    {p.verified && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                        <ShieldCheck className="w-3 h-3" />
                        <span>موثق</span>
                      </span>
                    )}
                  </div>
                  <h4 
                    onClick={() => onSelectProperty(p)}
                    className="font-bold text-sm text-slate-900 hover:text-blue-600 cursor-pointer line-clamp-2 leading-snug mb-1"
                  >
                    {p.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{p.rating || 4.8}</span>
                    <span className="text-slate-400 font-normal">({p.reviewsCount || 12} تقييم)</span>
                  </div>
                </td>
              ))}
              {/* Optional Placeholder Column to Add More */}
              {comparedProperties.length < 4 && (
                <td className="p-4 w-64 align-middle text-center border-r border-dashed border-slate-200 bg-slate-50/40 print:hidden">
                  <div className="py-8 px-4 flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-xs text-slate-600">أضف عقاراً آخر للمقارنة</span>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      اختيار عقار
                    </button>
                  </div>
                </td>
              )}
            </tr>

            {/* ROW 2: Price USD */}
            <tr className={`border-b border-slate-100 ${highlightDifferences && isRowDifferent(p => p.priceUSD || p.price) ? 'bg-amber-50/40' : ''}`}>
              <td className="p-4 font-bold text-xs text-slate-600 bg-slate-50/70">
                السعر بالدولار ($)
              </td>
              {comparedProperties.map(p => (
                <td key={p.id} className="p-4 font-black text-blue-600 text-base font-['Inter']">
                  ${(p.priceUSD || p.price || 0).toLocaleString()} 
                  <span className="text-xs font-semibold text-slate-500 mr-1">
                    {p.purpose === 'للإيجار' ? '/ شهرياً' : ''}
                  </span>
                </td>
              ))}
              {comparedProperties.length < 4 && <td className="bg-slate-50/30 print:hidden"></td>}
            </tr>

            {/* ROW 3: Price SYP */}
            <tr className={`border-b border-slate-100 ${highlightDifferences && isRowDifferent(p => p.priceSYP) ? 'bg-amber-50/40' : ''}`}>
              <td className="p-4 font-bold text-xs text-slate-600 bg-slate-50/70">
                السعر بالليرة السورية
              </td>
              {comparedProperties.map(p => (
                <td key={p.id} className="p-4 text-xs font-extrabold text-slate-700">
                  {p.priceSYP ? `${p.priceSYP} ل.س` : 'حسب سعر الصرف اليومي'}
                </td>
              ))}
              {comparedProperties.length < 4 && <td className="bg-slate-50/30 print:hidden"></td>}
            </tr>

            {/* ROW 4: Price per m² */}
            <tr className={`border-b border-slate-100 ${highlightDifferences && isRowDifferent(p => Math.round((p.priceUSD || p.price || 0) / (p.area || 1))) ? 'bg-amber-50/40' : ''}`}>
              <td className="p-4 font-bold text-xs text-slate-600 bg-slate-50/70">
                سعر المتر المربع
              </td>
              {comparedProperties.map(p => {
                const area = p.area || 1;
                const price = p.priceUSD || p.price || 0;
                const perMeter = Math.round(price / area);
                return (
                  <td key={p.id} className="p-4 text-xs font-bold text-slate-800 font-['Inter']">
                    ${perMeter.toLocaleString()} <span className="text-[11px] font-medium text-slate-500 font-['Cairo']">/ م²</span>
                  </td>
                );
              })}
              {comparedProperties.length < 4 && <td className="bg-slate-50/30 print:hidden"></td>}
            </tr>

            {/* ROW 5: Location */}
            <tr className={`border-b border-slate-100 ${highlightDifferences && isRowDifferent(p => p.city) ? 'bg-amber-50/40' : ''}`}>
              <td className="p-4 font-bold text-xs text-slate-600 bg-slate-50/70">
                الموقع والحي
              </td>
              {comparedProperties.map(p => (
                <td key={p.id} className="p-4 text-xs font-medium text-slate-700">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">{p.city} - {p.district || ''}</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5 line-clamp-1">{p.address}</span>
                    </div>
                  </div>
                </td>
              ))}
              {comparedProperties.length < 4 && <td className="bg-slate-50/30 print:hidden"></td>}
            </tr>

            {/* ROW 6: Type */}
            <tr className={`border-b border-slate-100 ${highlightDifferences && isRowDifferent(p => p.type) ? 'bg-amber-50/40' : ''}`}>
              <td className="p-4 font-bold text-xs text-slate-600 bg-slate-50/70">
                نوع العقار
              </td>
              {comparedProperties.map(p => (
                <td key={p.id} className="p-4 text-xs font-bold text-slate-800">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                    {p.type}
                  </span>
                </td>
              ))}
              {comparedProperties.length < 4 && <td className="bg-slate-50/30 print:hidden"></td>}
            </tr>

            {/* ROW 7: Area */}
            <tr className={`border-b border-slate-100 ${highlightDifferences && isRowDifferent(p => p.area) ? 'bg-amber-50/40' : ''}`}>
              <td className="p-4 font-bold text-xs text-slate-600 bg-slate-50/70">
                المساحة الإجمالية
              </td>
              {comparedProperties.map(p => (
                <td key={p.id} className="p-4 text-xs font-black text-slate-900 font-['Inter']">
                  {p.area} <span className="text-xs font-bold text-slate-600 font-['Cairo']">م²</span>
                </td>
              ))}
              {comparedProperties.length < 4 && <td className="bg-slate-50/30 print:hidden"></td>}
            </tr>

            {/* ROW 8: Bedrooms & Living Rooms */}
            <tr className={`border-b border-slate-100 ${highlightDifferences && isRowDifferent(p => p.bedrooms ?? p.rooms) ? 'bg-amber-50/40' : ''}`}>
              <td className="p-4 font-bold text-xs text-slate-600 bg-slate-50/70">
                الغرف والصالونات
              </td>
              {comparedProperties.map(p => (
                <td key={p.id} className="p-4 text-xs text-slate-700">
                  <span className="font-bold text-slate-900">{p.bedrooms ?? p.rooms ?? 0}</span> غرف نوم
                  {p.livingRooms ? ` • ${p.livingRooms} صالون` : ''}
                </td>
              ))}
              {comparedProperties.length < 4 && <td className="bg-slate-50/30 print:hidden"></td>}
            </tr>

            {/* ROW 9: Bathrooms */}
            <tr className={`border-b border-slate-100 ${highlightDifferences && isRowDifferent(p => p.bathrooms) ? 'bg-amber-50/40' : ''}`}>
              <td className="p-4 font-bold text-xs text-slate-600 bg-slate-50/70">
                الحمامات
              </td>
              {comparedProperties.map(p => (
                <td key={p.id} className="p-4 text-xs text-slate-700">
                  <span className="font-bold text-slate-900">{p.bathrooms || 1}</span> حمامات
                </td>
              ))}
              {comparedProperties.length < 4 && <td className="bg-slate-50/30 print:hidden"></td>}
            </tr>

            {/* ROW 10: Floor / Level */}
            <tr className={`border-b border-slate-100 ${highlightDifferences && isRowDifferent(p => p.floorNumber || p.floor) ? 'bg-amber-50/40' : ''}`}>
              <td className="p-4 font-bold text-xs text-slate-600 bg-slate-50/70">
                الطابق والمصعد
              </td>
              {comparedProperties.map(p => (
                <td key={p.id} className="p-4 text-xs text-slate-700">
                  {p.floorNumber || p.floor || 'طابق أرضي'}
                </td>
              ))}
              {comparedProperties.length < 4 && <td className="bg-slate-50/30 print:hidden"></td>}
            </tr>

            {/* ROW 11: Facing & Orientation */}
            <tr className={`border-b border-slate-100 ${highlightDifferences && isRowDifferent(p => p.facing) ? 'bg-amber-50/40' : ''}`}>
              <td className="p-4 font-bold text-xs text-slate-600 bg-slate-50/70">
                الاتجاه والواجهة
              </td>
              {comparedProperties.map(p => (
                <td key={p.id} className="p-4 text-xs text-slate-700">
                  {p.facing ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                      <Compass className="w-3.5 h-3.5 text-blue-500" />
                      <span>{p.facing}</span>
                    </span>
                  ) : 'غير محدد'}
                </td>
              ))}
              {comparedProperties.length < 4 && <td className="bg-slate-50/30 print:hidden"></td>}
            </tr>

            {/* ROW 12: Year Built */}
            <tr className={`border-b border-slate-100 ${highlightDifferences && isRowDifferent(p => p.yearBuilt) ? 'bg-amber-50/40' : ''}`}>
              <td className="p-4 font-bold text-xs text-slate-600 bg-slate-50/70">
                سنة البناء
              </td>
              {comparedProperties.map(p => (
                <td key={p.id} className="p-4 text-xs font-bold text-slate-800 font-['Inter']">
                  {p.yearBuilt ? (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{p.yearBuilt}</span>
                    </span>
                  ) : 'حديث'}
                </td>
              ))}
              {comparedProperties.length < 4 && <td className="bg-slate-50/30 print:hidden"></td>}
            </tr>

            {/* ROW 13: Key Amenities / Features */}
            <tr className={`border-b border-slate-100 ${highlightDifferences ? 'bg-amber-50/20' : ''}`}>
              <td className="p-4 font-bold text-xs text-slate-600 bg-slate-50/70 align-top">
                الميزات والتجهيزات
              </td>
              {comparedProperties.map(p => (
                <td key={p.id} className="p-4 text-xs text-slate-700 align-top">
                  {p.features && p.features.length > 0 ? (
                    <ul className="space-y-1.5">
                      {p.features.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px]">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-slate-400">مواصفات قياسية</span>
                  )}
                </td>
              ))}
              {comparedProperties.length < 4 && <td className="bg-slate-50/30 print:hidden"></td>}
            </tr>

            {/* ROW 14: Responsible Agency */}
            <tr className={`border-b border-slate-100 ${highlightDifferences && isRowDifferent(p => p.agency?.name) ? 'bg-amber-50/40' : ''}`}>
              <td className="p-4 font-bold text-xs text-slate-600 bg-slate-50/70">
                المكتب العقاري
              </td>
              {comparedProperties.map(p => (
                <td key={p.id} className="p-4 text-xs">
                  <div className="flex items-center gap-2">
                    <img 
                      src={p.agency?.avatar || '/assets/images/cca0869e035d3042041e5aea3cf29f0b2cd44c1c.png'} 
                      alt="" 
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" 
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">{p.agency?.name || 'مكتب عقاري معتمد'}</span>
                      <span className="text-[10px] text-slate-400">{p.agency?.agentName || 'الوكيل المسؤول'}</span>
                    </div>
                  </div>
                </td>
              ))}
              {comparedProperties.length < 4 && <td className="bg-slate-50/30 print:hidden"></td>}
            </tr>

            {/* ROW 15: Actions */}
            <tr className="print:hidden">
              <td className="p-4 font-bold text-xs text-slate-500 bg-slate-50/70">
                إجراءات التواصل
              </td>
              {comparedProperties.map(p => (
                <td key={p.id} className="p-4 space-y-2">
                  <button
                    onClick={() => onSelectProperty(p)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    عرض التفاصيل الكاملة
                  </button>
                  {p.agency?.whatsapp && (
                    <a
                      href={`https://wa.me/${p.agency.whatsapp}?text=${encodeURIComponent(`مرحباً، أود الاستفسار عن عقار ${p.title} في مقارنة EngProp`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>محادثة واتساب</span>
                    </a>
                  )}
                </td>
              ))}
              {comparedProperties.length < 4 && <td className="bg-slate-50/30 print:hidden"></td>}
            </tr>

          </tbody>
        </table>
      </div>

      {/* Quick Summary / Recommendation Box */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 print:hidden">
        <div className="space-y-1 text-center md:text-right">
          <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 justify-center md:justify-start">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>نصيحة المهندس العقاري للمقارنة</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            عند المقارنة، لا تعتمد على السعر الإجمالي فقط بل ركز على سعر المتر المربع وتوفر سند الملكية (طابو نظامي أخضر) وتجهيزات الطاقة البديلة لضمان أعلى عائد استثماري وراحة سكنية.
          </p>
        </div>
        <button
          onClick={() => setActivePage('properties')}
          className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
        >
          متابعة البحث عن عقارات
        </button>
      </div>

      {/* Modal: Add Property to Compare */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">إضافة عقار لجدول المقارنة</h3>
                <p className="text-xs text-slate-400">اختر عقاراً من القائمة لإدراجه فوراً جنباً إلى جنب</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - List of Available Properties */}
            <div className="p-6 overflow-y-auto divide-y divide-slate-100 space-y-3">
              {availableToAdd.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  لا توجد عقارات أخرى متاحة للإضافة حالياً.
                </div>
              ) : (
                availableToAdd.map(prop => (
                  <div key={prop.id} className="pt-3 first:pt-0 flex items-center justify-between gap-4 hover:bg-slate-50 p-3 rounded-2xl transition-colors">
                    <div className="flex items-center gap-3">
                      <img 
                        src={prop.image || prop.images?.[0] || '/assets/images/74e3791940a62972275dd2c23dbee27e57215cf5.jpg'} 
                        alt="" 
                        className="w-16 h-14 rounded-xl object-cover border border-slate-200 shrink-0" 
                      />
                      <div>
                        <span className="font-bold text-xs text-slate-900 block line-clamp-1">{prop.title}</span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                          <span className="font-bold text-blue-600 font-['Inter']">${(prop.priceUSD || prop.price || 0).toLocaleString()}</span>
                          <span>•</span>
                          <span>{prop.city}</span>
                          <span>•</span>
                          <span>{prop.area} م²</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (onAddToCompare) onAddToCompare(prop);
                        setIsAddModalOpen(false);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shrink-0 cursor-pointer transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
