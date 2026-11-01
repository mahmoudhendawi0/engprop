import React from 'react';
import { ArrowRight, BadgeCheck, Building2, MapPin, MessageCircle, Phone, ShieldCheck, Star } from 'lucide-react';
import PropertyCard from '../components/property/PropertyCard';

export default function AgencyProfile({
  agency,
  propertyList = [],
  onBack,
  onSelectProperty,
  favorites = [],
  onToggleFavorite,
  comparedProperties = [],
  onToggleCompare,
  onBrowseProperties
}) {
  if (!agency) return null;

  const agencyProperties = propertyList.filter((property) =>
    property.agency?.id === agency.id || property.agency?.name === agency.name
  );
  const coverImage = agencyProperties[0]?.image || '/assets/images/af96a8dfef4a405a6b98308528432440891a8af7.jpg';
  // Agency avatar assets in the current data set are logos and unrelated images,
  // so use a clean initials badge until a real portrait is available.
  const initials = String(agency.owner || agency.name || 'ع')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('');

  return (
    <div className="bg-white pb-16" dir="rtl" lang="ar">
      <div className="relative h-[240px] sm:h-[330px] lg:h-[390px] overflow-hidden bg-slate-200">
        <img src={coverImage} alt="واجهة عقارية" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 to-transparent" />
        <button type="button" onClick={onBack} className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur-sm hover:bg-white"><ArrowRight className="h-4 w-4" />المكاتب</button>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="relative -mt-14 sm:-mt-20 flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4 sm:gap-6">
            <div aria-label={agency.name} className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-blue-50 text-3xl font-bold text-blue-700 shadow-sm sm:h-40 sm:w-40 sm:text-4xl">{initials}</div>
            <div className="pb-1 sm:pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{agency.owner || agency.name}</h1>
                {agency.verified && <BadgeCheck className="h-5 w-5 text-blue-600" aria-label="مكتب موثّق" />}
              </div>
              <p className="mt-1 text-sm text-slate-500">{agency.name}</p>
              <p className="mt-2 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" />{agency.address || agency.city}</p>
            </div>
          </div>
          <div className="flex w-full gap-2 pb-1 sm:w-auto sm:pb-3">
            {agency.phone && <a href={`tel:${agency.phone}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-blue-300 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 sm:flex-none"><Phone className="h-4 w-4" />اتصل بالمكتب</a>}
            {agency.whatsapp && <a href={`https://wa.me/${String(agency.whatsapp).replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 sm:flex-none"><MessageCircle className="h-4 w-4" />واتساب</a>}
          </div>
        </section>

        <section className="mt-8 grid gap-8 border-b border-slate-100 pb-10 lg:grid-cols-[1fr_280px]">
          <div>
            <p className="text-xs font-semibold text-slate-400">نبذة عن المكتب</p>
            <h2 className="mt-2 text-xl font-bold leading-relaxed text-slate-800">{agency.description || 'مكتب عقاري معتمد لخدمات البيع والإيجار والاستشارات العقارية.'}</h2>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-400" />{agency.propertiesCount || agencyProperties.length} إعلان عقاري</span>
              <span className="inline-flex items-center gap-2"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{agency.rating || '—'} من ٥</span>
              {agency.licenseNumber && <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" />ترخيص {agency.licenseNumber}</span>}
            </div>
          </div>
          <aside className="rounded-xl border border-slate-200 p-4">
            <span className="text-xs text-slate-500">تقييم العملاء</span>
            <div className="mt-1 flex items-center gap-2"><strong className="text-3xl text-slate-900">{agency.rating || '—'}</strong><span className="text-sm text-amber-500">★★★★★</span></div>
            <p className="mt-1 text-xs text-slate-500">{agency.reviewsCount || 0} تقييمًا مسجلًا</p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.min(Number(agency.rating || 0) / 5 * 100, 100)}%` }} /></div>
          </aside>
        </section>

        <section className="py-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-xs text-slate-400">عقارات المكتب</p><h2 className="mt-1 text-2xl font-bold text-slate-900">أحدث الإعلانات</h2></div>
            {onBrowseProperties && <button type="button" onClick={onBrowseProperties} className="text-sm font-semibold text-blue-700 hover:text-blue-900">عرض جميع العقارات <ArrowRight className="mr-1 inline h-4 w-4" /></button>}
          </div>
          {agencyProperties.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {agencyProperties.slice(0, 9).map((property) => <PropertyCard key={property.id} property={property} onSelect={onSelectProperty} isFavorite={favorites.includes(property.id)} onToggleFavorite={onToggleFavorite} isCompared={comparedProperties.some((item) => item.id === property.id)} onToggleCompare={onToggleCompare} />)}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500">لا توجد إعلانات نشطة لهذا المكتب حاليًا.</div>
          )}
        </section>

        <section className="border-t border-slate-100 pt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-xs text-slate-400">آراء العملاء</p><h2 className="mt-1 text-xl font-bold text-slate-900">تقييمات المكتب</h2></div>
            <span className="text-sm text-slate-500">{agency.reviewsCount || 0} تقييمًا · <span className="text-amber-500">★★★★★</span> {agency.rating || '—'}</span>
          </div>
          <p className="mt-4 rounded-xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">يعرض هذا الملخص التقييمات المسجلة للمكتب. تواصل مع المكتب للاستفسار عن العقارات ومواعيد المعاينة.</p>
        </section>
      </div>
    </div>
  );
}
