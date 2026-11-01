import React from 'react';
import { 
  Search, 
  RotateCcw, 
  SlidersHorizontal,
  DollarSign,
  BedDouble,
  Building2,
  MapPin
} from 'lucide-react';

export default function PropertyFilter({
  filters,
  setFilters,
  onReset,
  citiesList = []
}) {
  // Cities options extraction
  const cityNames = [
    'الكل',
    ...(citiesList.length > 0 
      ? citiesList.map(c => typeof c === 'string' ? c : c.name) 
      : ['إعزاز', 'دمشق', 'حلب', 'اللاذقية', 'حمص', 'طرطوس'])
  ];

  // Remove duplicates
  const uniqueCities = Array.from(new Set(cityNames));

  const propertyTypes = ['الكل', 'شقة', 'فيلا', 'مكتب', 'دوبلكس'];
  const roomOptions = ['الكل', '1', '2', '3', '4', '5+'];

  const currentRooms = filters.rooms || filters.bedrooms || 'الكل';

  const handleRoomSelect = (val) => {
    setFilters({
      ...filters,
      rooms: val,
      bedrooms: val
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-6 text-right w-full">
      
      {/* Header: Title + Reset Button */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">تصفية العقارات</h3>
            <span className="text-[11px] text-slate-400 font-medium">حدد معايير البحث</span>
          </div>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
          title="إعادة تعيين كافة الفلاتر"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إعادة ضبط</span>
        </button>
      </div>

      {/* 1. Search by Keyword */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">
          البحث بالاسم أو الحي:
        </label>
        <div className="relative">
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="مثال: فيلا، الميدان، إعزاز..."
            className="w-full pl-8 pr-9 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          {filters.search && (
            <button
              onClick={() => setFilters({ ...filters, search: '' })}
              className="absolute left-2.5 top-2.5 text-[11px] text-slate-400 hover:text-slate-600 px-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. Purpose / Transaction Type (Segmented Control - Full Natural Width) */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">
          نوع العملية:
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/70">
          {['الكل', 'للبيع', 'للإيجار'].map((purpose) => {
            const isSelected = (filters.purpose || 'الكل') === purpose;
            return (
              <button
                key={purpose}
                type="button"
                onClick={() => setFilters({ ...filters, purpose })}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {purpose}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. City / Region Selector */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-blue-500" />
          <span>المدينة أو المحافظة:</span>
        </label>
        <select
          value={filters.city || 'الكل'}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {uniqueCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Property Type (Category Pills) */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Building2 className="w-3.5 h-3.5 text-blue-500" />
          <span>نوع العقار:</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {propertyTypes.map((type) => {
            const isSelected = (filters.type || 'الكل') === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setFilters({ ...filters, type })}
                className={`py-2 px-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 border-blue-300 ring-1 ring-blue-300 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Bedrooms Count (Even, comfortable square/circle buttons) */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <BedDouble className="w-3.5 h-3.5 text-blue-500" />
          <span>عدد الغرف:</span>
        </label>
        <div className="grid grid-cols-6 gap-1 p-1 bg-slate-100 rounded-2xl">
          {roomOptions.map((r) => {
            const isSelected = currentRooms === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => handleRoomSelect(r)}
                className={`h-9 flex items-center justify-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Maximum Price Range Slider */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-1 font-bold text-slate-700">
            <DollarSign className="w-3.5 h-3.5 text-blue-500" />
            <span>الحد الأقصى للسعر:</span>
          </label>
          <span className="font-black text-blue-600 font-['Inter']">
            ${Number(filters.maxPrice || 250000).toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min="500"
          max="350000"
          step="2500"
          value={filters.maxPrice || 250000}
          onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-semibold font-['Inter']">
          <span>$500</span>
          <span>$150,000</span>
          <span>$350,000+</span>
        </div>
      </div>

      {/* 7. Action Button */}
      <div className="pt-2">
        <button
          onClick={onReset}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
        >
          مسح خيارات التصفية
        </button>
      </div>

    </div>
  );
}
