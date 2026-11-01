import React, { useState } from 'react';
import { MapPin, ExternalLink, Compass } from 'lucide-react';

export default function InteractiveMap({ properties = [], onSelectProperty, selectedCity = 'الكل' }) {
  const [activeProperty, setActiveProperty] = useState(properties[0] || null);

  // Filter properties by city if specified
  const filtered = selectedCity === 'الكل' 
    ? properties 
    : properties.filter(p => p.city === selectedCity);

  return (
    <div className="relative w-full h-[650px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col md:flex-row">
      
      {/* Map Graphic Area */}
      <div className="relative flex-1 bg-[#151c2c] overflow-hidden flex items-center justify-center">
        {/* Stylized Grid Background */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>

        {/* Decorative Map Vectors / Regions */}
        <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 100 200 Q 250 150 400 300 T 700 350" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 6" />
          <path d="M 200 450 Q 350 300 500 500 T 850 400" fill="none" stroke="#0ea5e9" strokeWidth="1.5" />
          <circle cx="350" cy="320" r="140" fill="#1e293b" opacity="0.4" />
          <circle cx="650" cy="220" r="120" fill="#1e293b" opacity="0.3" />
        </svg>

        {/* Floating Region Labels */}
        <div className="absolute top-8 right-8 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300 font-semibold flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-sky-400" />
          <span>خريطة توزع العقارات في سوريا</span>
        </div>

        {/* Simulated Interactive Markers based on coordinates */}
        {filtered.map((property, idx) => {
          // Calculate stylized position percentage from coordinates
          // Damascus area ~ (33.5, 36.2), Aleppo ~ (36.2, 37.1)
          const posX = 20 + ((idx * 23) % 65);
          const posY = 25 + ((idx * 19) % 55);
          const isSelected = activeProperty?.id === property.id;

          return (
            <div
              key={property.id}
              style={{ top: `${posY}%`, left: `${posX}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <button
                onClick={() => setActiveProperty(property)}
                className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs shadow-lg transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white scale-110 ring-4 ring-blue-400/40 z-30'
                    : 'bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-600 hover:scale-105'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-sky-400'}`} />
                <span>{(property.priceUSD || property.price || 0).toLocaleString()} $</span>
              </button>

              {/* Ping Animation for Selected */}
              {isSelected && (
                <span className="absolute -inset-1 rounded-full bg-blue-500/30 animate-ping pointer-events-none"></span>
              )}
            </div>
          );
        })}

        {/* Map Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
          <button className="w-10 h-10 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-600 flex items-center justify-center font-bold text-lg shadow-lg">
            +
          </button>
          <button className="w-10 h-10 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-600 flex items-center justify-center font-bold text-lg shadow-lg">
            -
          </button>
        </div>

      </div>

      {/* Selected Property Preview Drawer / Sidebar */}
      {activeProperty && (
        <div className="w-full md:w-96 bg-slate-900 border-t md:border-t-0 md:border-r border-slate-800 p-6 flex flex-col justify-between z-30 shadow-xl">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span className="px-2.5 py-1 rounded-md bg-blue-900/60 text-blue-300 font-bold border border-blue-800">
                {activeProperty.purpose}
              </span>
              <span className="text-amber-400 font-bold text-base">
                {(activeProperty.priceUSD || activeProperty.price || 0).toLocaleString()} {activeProperty.priceUnit || '$'}
              </span>
            </div>

            {/* Property Image */}
            <div className="relative h-48 rounded-2xl overflow-hidden mb-4 border border-slate-800">
              <img
                src={activeProperty.image || activeProperty.images?.[0] || activeProperty.gallery?.[0] || '/assets/images/74e3791940a62972275dd2c23dbee27e57215cf5.jpg'}
                alt={activeProperty.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[11px] backdrop-blur-xs">
                {activeProperty.type}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>{activeProperty.location || activeProperty.address || `${activeProperty.city || ''} - ${activeProperty.district || ''}`}</span>
            </div>

            <h3 className="text-white font-bold text-base mb-3 leading-snug">
              {activeProperty.title}
            </h3>

            {/* Specs */}
            <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800 text-slate-300 text-xs mb-4 text-center">
              <div className="bg-slate-800/50 p-2 rounded-xl">
                <span className="block text-slate-400 text-[10px]">الغرف</span>
                <span className="font-bold">{activeProperty.bedrooms ?? activeProperty.rooms ?? 0}</span>
              </div>
              <div className="bg-slate-800/50 p-2 rounded-xl">
                <span className="block text-slate-400 text-[10px]">الحمامات</span>
                <span className="font-bold">{activeProperty.bathrooms ?? 1}</span>
              </div>
              <div className="bg-slate-800/50 p-2 rounded-xl">
                <span className="block text-slate-400 text-[10px]">المساحة</span>
                <span className="font-bold">{activeProperty.area} م²</span>
              </div>
            </div>

            <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">
              {activeProperty.description}
            </p>
          </div>

          <button
            onClick={() => onSelectProperty(activeProperty)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>عرض كافة تفاصيل العقار</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
