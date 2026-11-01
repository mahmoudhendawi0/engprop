import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Bath, BedDouble, Bookmark, Building2, CalendarDays, CheckCircle2, Clock3, MapPin, Maximize2, MessageCircle, Share2, ShieldCheck, SquareArrowOutUpRight, X } from 'lucide-react';
import ContactModal from '../components/property/ContactModal';
import PropertyCard from '../components/property/PropertyCard';
import { properties as fallbackProperties } from '../data/propertiesData';
import LocationPicker from '../components/map/LocationPicker';

const fallbackPhoto = '/assets/images/74e3791940a62972275dd2c23dbee27e57215cf5.jpg';

export default function PropertyDetailReference({
  property,
  onBack,
  onSelectProperty,
  onSelectAgency,
  onShowMap,
  isFavorite = false,
  onToggleFavorite,
  propertyList = fallbackProperties
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const images = useMemo(() => {
    const source = property?.images?.length ? property.images : property?.gallery?.length ? property.gallery : [property?.image || fallbackPhoto];
    return Array.from({ length: 5 }, (_, index) => source[index % source.length]);
  }, [property]);

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setLightboxOpen(false);
      if (event.key === 'ArrowLeft') setActiveImage(index => (index + 1) % images.length);
      if (event.key === 'ArrowRight') setActiveImage(index => (index - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, images.length]);

  const showImage = (index) => {
    setActiveImage(index);
    setLightboxOpen(true);
  };

  if (!property) return null;

  const price = Number(property.priceUSD ?? property.price ?? 0);
  const features = Array.isArray(property.features) ? property.features : [];
  const agency = property.agency || {};
  const similar = propertyList.filter((item) => item.id !== property.id && (item.city === property.city || item.type === property.type)).slice(0, 3);
  const coordinates = property.coords || property.coordinates;
  const propertyCoords = coordinates || (property.latitude != null && property.longitude != null
    ? { lat: Number(property.latitude), lng: Number(property.longitude) }
    : null);

  const shareProperty = async () => {
    try {
      await navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="bg-white pb-14" dir="rtl" lang="ar">
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <button type="button" onClick={onBack} className="text-sm text-slate-500 hover:text-slate-900"><ArrowRight className="ml-1 inline h-4 w-4" />العودة إلى العقارات</button>
          <div className="flex gap-3 text-slate-500">
            <button type="button" onClick={() => onToggleFavorite?.(property.id)} aria-label="حفظ العقار" className={isFavorite ? 'text-blue-600' : 'hover:text-blue-600'}><Bookmark className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} /></button>
            <button type="button" onClick={shareProperty} aria-label="مشاركة العقار" className="hover:text-blue-600"><Share2 className="h-5 w-5" /></button>
          </div>
        </div>

        <div className="grid h-[280px] grid-cols-3 grid-rows-2 gap-2 overflow-hidden rounded-2xl sm:h-[390px] sm:gap-3 lg:h-[470px]">
          <button type="button" onClick={() => showImage(activeImage)} aria-label="تكبير الصورة" className="relative row-span-2 overflow-hidden bg-slate-100 text-right">
            <img src={images[activeImage]} alt={property.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]" />
          </button>
          {images.slice(1, 5).map((image, index) => (
            <button key={`${image}-${index}`} type="button" onClick={() => showImage(index + 1)} aria-label={`تكبير الصورة ${index + 2}`} className={`overflow-hidden bg-slate-100 ${activeImage === index + 1 ? 'ring-2 ring-inset ring-blue-600' : ''}`}>
              <img src={image} alt={`${property.title} ${index + 2}`} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
            </button>
          ))}
        </div>

        <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <main>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-400">
              <span>{property.purpose}</span><span>·</span><span>{property.type}</span><span>·</span><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{property.publishedAt || 'إعلان حديث'}</span>
            </div>
            <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h1 className="text-2xl font-bold leading-relaxed text-slate-900 sm:text-3xl">{property.title}</h1>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="h-4 w-4" />{property.location || property.address || `${property.city || ''} - ${property.district || ''}`}</p>
              </div>
              <div className="shrink-0 sm:text-left"><span className="block text-xs text-slate-400">السعر المطلوب</span><strong className="text-2xl font-bold text-slate-900">{price.toLocaleString('en-US')}</strong><span className="mr-1 text-sm text-slate-500">{property.priceUnit || '$'}</span></div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-xl bg-slate-50 p-3 text-center sm:p-4"><Maximize2 className="mx-auto h-5 w-5 text-slate-500" /><span className="mt-2 block text-xs text-slate-400">المساحة</span><strong className="mt-1 block text-sm text-slate-800">{property.area} م²</strong></div>
              <div className="rounded-xl bg-slate-50 p-3 text-center sm:p-4"><BedDouble className="mx-auto h-5 w-5 text-slate-500" /><span className="mt-2 block text-xs text-slate-400">غرف النوم</span><strong className="mt-1 block text-sm text-slate-800">{property.bedrooms ?? property.rooms ?? 0}</strong></div>
              <div className="rounded-xl bg-slate-50 p-3 text-center sm:p-4"><Bath className="mx-auto h-5 w-5 text-slate-500" /><span className="mt-2 block text-xs text-slate-400">الحمامات</span><strong className="mt-1 block text-sm text-slate-800">{property.bathrooms ?? 0}</strong></div>
            </div>

            <section className="mt-9 border-t border-slate-100 pt-6">
              <h2 className="text-lg font-bold text-slate-900">المرافق والمميزات</h2>
              <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {features.length ? features.map((feature, index) => <div key={`${feature}-${index}`} className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="h-4 w-4 shrink-0 text-slate-400" />{feature}</div>) : <p className="text-sm text-slate-500">لم تُضف تفاصيل المرافق بعد.</p>}
              </div>
            </section>

            <section className="mt-9 border-t border-slate-100 pt-6">
              <h2 className="text-lg font-bold text-slate-900">تفاصيل العقار</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-8 text-slate-600">{property.description || 'تواصل مع المكتب لمعرفة المزيد من التفاصيل حول هذا العقار.'}</p>
            </section>

            <section className="mt-9 border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between gap-3">
                <div><h2 className="text-lg font-bold text-slate-900">الموقع</h2><p className="mt-1 text-sm text-slate-500">{property.city}{property.district ? `، ${property.district}` : ''}</p></div>
                {onShowMap && <button type="button" onClick={onShowMap} className="text-sm font-semibold text-blue-700">عرض على الخريطة <SquareArrowOutUpRight className="mr-1 inline h-4 w-4" /></button>}
              </div>
              <LocationPicker key={property.id} city={property.city} value={propertyCoords} readOnly onChange={() => {}} />
              {!propertyCoords && <p className="mt-2 text-xs text-slate-500">لا تتوفر إحداثيات دقيقة لهذا العقار؛ تعرض الخريطة موقع المدينة التقريبي.</p>}
            </section>
          </main>

          <aside className="h-fit rounded-2xl border border-slate-200 p-5 lg:sticky lg:top-24">
            <p className="text-xs text-slate-400">تواصل مع الوسيط</p>
            <button type="button" onClick={() => onSelectAgency?.(agency)} className="mt-3 flex w-full items-center gap-3 text-right">
              <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">{String(agency.owner || agency.name || 'ع').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('')}</span>
              <span><strong className="block text-sm font-bold text-slate-900">{agency.name || 'المكتب العقاري'}</strong><span className="mt-1 flex items-center gap-1 text-xs text-slate-500">{agency.verified && <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />}وسيط عقاري</span></span>
            </button>
            <div className="mt-5 grid gap-2">
              <button type="button" onClick={() => setContactOpen(true)} className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"><CalendarDays className="h-4 w-4" />احجز موعد معاينة</button>
              {agency.phone && <a href={`tel:${agency.phone}`} className="flex items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Building2 className="h-4 w-4" />اتصال بالمكتب</a>}
              {agency.whatsapp && <a href={`https://wa.me/${String(agency.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent(`استفسار عن ${property.title}`)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><MessageCircle className="h-4 w-4" />واتساب</a>}
            </div>
            <div className="mt-5 flex gap-2 rounded-lg bg-slate-50 p-3 text-xs leading-6 text-slate-600"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />تحقق من المستندات والتفاصيل مباشرةً مع المكتب قبل إتمام أي اتفاق.</div>
          </aside>
        </div>

        {similar.length > 0 && <section className="mt-12 border-t border-slate-100 pt-8"><div className="mb-5"><h2 className="text-xl font-bold text-slate-900">عقارات مشابهة</h2><p className="mt-1 text-sm text-slate-500">قد تناسبك هذه العقارات أيضًا</p></div><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{similar.map((item) => <PropertyCard key={item.id} property={item} onSelect={onSelectProperty} />)}</div></section>}
      </div>
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} property={property} />
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="صور العقار" onClick={() => setLightboxOpen(false)}>
          <button type="button" className="absolute left-4 top-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" aria-label="إغلاق الصور" onClick={() => setLightboxOpen(false)}><X className="h-6 w-6" /></button>
          <button type="button" className="absolute right-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:right-8" aria-label="الصورة التالية" onClick={(event) => { event.stopPropagation(); setActiveImage(index => (index + 1) % images.length); }}><ArrowRight className="h-6 w-6" /></button>
          <img src={images[activeImage]} alt={`${property.title} - ${activeImage + 1}`} className="max-h-[88vh] max-w-[88vw] rounded-lg object-contain" onClick={(event) => event.stopPropagation()} />
          <button type="button" className="absolute left-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:left-8" aria-label="الصورة السابقة" onClick={(event) => { event.stopPropagation(); setActiveImage(index => (index - 1 + images.length) % images.length); }}><ArrowLeft className="h-6 w-6" /></button>
          <span className="absolute bottom-5 rounded-full bg-black/50 px-4 py-2 text-sm text-white" dir="rtl">{activeImage + 1} / {images.length}</span>
        </div>
      )}
      {copied && <div className="fixed bottom-5 left-5 z-50 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">تم نسخ رابط العقار</div>}
    </div>
  );
}
