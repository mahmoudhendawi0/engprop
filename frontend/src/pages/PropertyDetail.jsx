import React, { useState } from 'react';
import { 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize2, 
  Calendar, 
  Layers, 
  ShieldCheck, 
  Phone, 
  MessageCircle, 
  Heart, 
  Share2, 
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import ContactModal from '../components/property/ContactModal';
import PropertyCard from '../components/property/PropertyCard';
import { properties } from '../data/propertiesData';

export default function PropertyDetail({ 
  property, 
  onBack, 
  onSelectProperty,
  isFavorite = false,
  onToggleFavorite,
  propertyList = properties
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!property) return null;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentProperties = propertyList?.length ? propertyList : properties;
  const similarProperties = currentProperties.filter(
    p => p.id !== property.id && (p.city === property.city || p.type === property.type)
  ).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Top Navigation & Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors p-2 rounded-xl hover:bg-slate-100 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لكافة العقارات</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Share button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? 'تم نسخ الرابط!' : 'مشاركة'}</span>
          </button>

          {/* Favorite button */}
          <button
            onClick={() => onToggleFavorite && onToggleFavorite(property.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
              isFavorite 
                ? 'border-rose-200 bg-rose-50 text-rose-600' 
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            <span>{isFavorite ? 'في المفضلة' : 'حفظ'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Gallery & Main Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Images and Property Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Gallery Container */}
          <div className="space-y-3">
            {/* Active Main Image */}
            <div className="relative h-[380px] sm:h-[480px] rounded-3xl overflow-hidden border border-slate-200 shadow-md">
              <img
                src={(property.images && property.images[activeImageIndex]) || property.image || (property.images && property.images[0]) || '/assets/images/74e3791940a62972275dd2c23dbee27e57215cf5.jpg'}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow-md">
                  {property.purpose}
                </span>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                  {property.type}
                </span>
              </div>
            </div>

            {/* Thumbnail Selectors */}
            {property.images && property.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx 
                        ? 'border-blue-600 ring-2 ring-blue-200 scale-95' 
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title and Specs */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-2">
                  <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{property.location || property.address || `${property.city || ''} - ${property.district || ''}`}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>نُشر {property.publishedAt || 'مؤخراً'}</span>
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {property.title}
                </h1>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="block text-xs text-slate-400 font-medium">السعر المطلوب</span>
                <span className="text-2xl sm:text-3xl font-black text-blue-600 font-['Inter']">
                  {(property.priceUSD || property.price || 0).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-600 mr-1.5">{property.priceUnit || '$'}</span>
              </div>
            </div>

            {/* Specifications Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                <Maximize2 className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <span className="block text-[11px] text-slate-400 font-semibold">المساحة</span>
                <span className="font-extrabold text-slate-800 text-sm">{property.area} م²</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                <BedDouble className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <span className="block text-[11px] text-slate-400 font-semibold">عدد الغرف</span>
                <span className="font-extrabold text-slate-800 text-sm">{property.rooms} غرف</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                <Bath className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <span className="block text-[11px] text-slate-400 font-semibold">الحمامات</span>
                <span className="font-extrabold text-slate-800 text-sm">{property.bathrooms} حمامات</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                <Layers className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <span className="block text-[11px] text-slate-400 font-semibold">الطابق</span>
                <span className="font-extrabold text-slate-800 text-xs sm:text-sm">{property.floor}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2">وصف العقار</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {property.description}
              </p>
            </div>

            {/* Features & Amenities */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">الميزات والخدمات المتوفرة</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {property.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right 1 Col: Agency Card & Booking Actions */}
        <div className="space-y-6">
          
          {/* Action Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-md space-y-6 sticky top-28">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500">حالة العقار</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                متاح للمعاينة الفورية
              </span>
            </div>

            {/* Booking Button */}
            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>حجز موعد معاينة ميدانية</span>
            </button>

            {/* Agency Contact Card */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
              <span className="text-[11px] font-bold text-slate-400 block">المكتب العقاري المعتمد</span>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shrink-0">
                  {property.agency.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{property.agency.name}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold">
                    <span>★ {property.agency.rating}</span>
                    <span className="text-slate-400 font-normal">(مكتب موثق)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href={`tel:${property.agency.phone}`}
                  className="py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-slate-800 hover:text-blue-600 hover:border-blue-300 transition-all font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-500" />
                  <span>اتصال</span>
                </a>

                <a
                  href={`https://wa.me/${property.agency.whatsapp}?text=مرحباً، أود الاستفسار عن: ${encodeURIComponent(property.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>واتساب</span>
                </a>
              </div>
            </div>

            {/* Security Guarantee Badge */}
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">
                هذا العقار مسجل رسمياً في شبكة <span className="font-bold">EngProp</span> مع التحقق من سند الملكية أو التفويض الرسمي للمكتب.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Similar Properties Section */}
      {similarProperties.length > 0 && (
        <div className="pt-8 border-t border-slate-200">
          <div className="mb-6">
            <h3 className="text-xl font-black text-slate-900">عقارات مشابهة قد تعجبك</h3>
            <p className="text-xs text-slate-500 mt-1">عقارات في نفس المنطقة أو بنفس المواصفات الفنية</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarProperties.map(sim => (
              <PropertyCard
                key={sim.id}
                property={sim}
                onSelect={(p) => {
                  onSelectProperty(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <ContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        property={property}
      />

    </div>
  );
}
