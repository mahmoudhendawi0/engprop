import React from 'react';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  Heart, 
  Scale, 
  ShieldCheck, 
  Eye, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export default function PropertyCard({ 
  property, 
  onSelect, 
  isFavorite = false, 
  onToggleFavorite, 
  isCompared = false, 
  onToggleCompare,
  layout = 'grid' // 'grid' or 'list'
}) {
  const isList = layout === 'list';
  const priceValue = Number(property.priceUSD ?? property.price ?? 0);

  return (
    <div 
      className={`group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col ${
        isList ? 'md:flex-row' : ''
      }`}
    >
      {/* Image Container */}
      <div 
        className={`relative overflow-hidden cursor-pointer ${
          isList ? 'md:w-72 md:shrink-0 h-64 md:h-auto' : 'h-64'
        }`}
        onClick={() => onSelect(property)}
      >
        <img 
          src={property.image} 
          alt={property.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 pointer-events-none" />

        {/* Badges Top */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <span 
            className={`px-3 py-1 rounded-full text-xs font-black shadow-md ${
              property.purpose === 'للبيع' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-sky-600 text-white'
            }`}
          >
            {property.purpose}
          </span>
          {property.featured && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3" />
              <span>مميز</span>
            </span>
          )}
        </div>

        {/* Top Left: Actions (Favorite + Compare) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(property.id);
            }}
            aria-label="إضافة للمفضلة"
            className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-md ${
              isFavorite 
                ? 'bg-rose-500 text-white scale-110' 
                : 'bg-white/80 hover:bg-white text-slate-700 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(property);
            }}
            aria-label="مقارنة العقار"
            className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-md ${
              isCompared 
                ? 'bg-sky-600 text-white scale-110' 
                : 'bg-white/80 hover:bg-white text-slate-700 hover:text-sky-600'
            }`}
          >
            <Scale className="w-4 h-4" />
          </button>
        </div>

        {/* Verified Badge Bottom */}
        {property.verified && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>عقار موثّق</span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 text-xs text-slate-200 flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />
          <span>{property.viewsCount} مشاهدة</span>
        </div>
      </div>

      {/* Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between text-right">
        <div>
          {/* Price */}
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-2xl font-black text-sky-700">
                ${priceValue.toLocaleString()}
              </span>
              {property.pricePer && (
                <span className="text-xs text-slate-500 font-bold mr-1">
                  / {property.pricePer}
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-slate-400">
              {property.priceSYP} ل.س
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelect(property)}
            className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1 cursor-pointer mb-2"
          >
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="truncate">{property.city} - {property.district}</span>
          </div>

          {/* Key Specs Bar */}
          <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 text-xs font-bold mb-4">
            <div className="flex items-center justify-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-sky-600" />
              <span>{property.area} م²</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 border-x border-slate-200/80">
              <Bed className="w-3.5 h-3.5 text-sky-600" />
              <span>{property.bedrooms > 0 ? `${property.bedrooms} غرف` : 'مفتوح'}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Bath className="w-3.5 h-3.5 text-sky-600" />
              <span>{property.bathrooms} حمام</span>
            </div>
          </div>
        </div>

        {/* Card Footer: Agency info & View detail button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src={property.agency.avatar} 
              alt={property.agency.name} 
              className="w-7 h-7 rounded-full object-cover border border-slate-200" 
            />
            <span className="text-xs font-bold text-slate-700 truncate max-w-[130px]">
              {property.agency.name}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSelect(property)}
            className="flex items-center gap-1 text-xs font-extrabold text-sky-600 group-hover:text-sky-700 group-hover:-translate-x-1 transition-all cursor-pointer"
          >
            <span>التفاصيل</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
