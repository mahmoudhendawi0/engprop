import React, { useState, useMemo } from 'react';
import { 
  LayoutGrid, 
  List, 
  Map as MapIcon, 
  Search, 
  ArrowUpDown, 
  SlidersHorizontal,
  X
} from 'lucide-react';
import PropertyCard from '../components/property/PropertyCard';
import PropertyFilter from '../components/property/PropertyFilter';
import InteractiveMap from '../components/map/InteractiveMap';
import { properties, cities } from '../data/propertiesData';

export default function Properties({ 
  onSelectProperty, 
  initialFilters = {}, 
  favorites = [], 
  onToggleFavorite,
  comparedProperties = [],
  onToggleCompare,
  propertyList = properties
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'map'
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const currentProperties = propertyList?.length ? propertyList : properties;

  const [filters, setFilters] = useState({
    purpose: initialFilters.purpose || 'الكل',
    city: initialFilters.city || 'الكل',
    type: 'الكل',
    rooms: 'الكل',
    maxPrice: 250000,
    search: initialFilters.search || '',
    sortBy: 'newest'
  });

  const handleResetFilters = () => {
    setFilters({
      purpose: 'الكل',
      city: 'الكل',
      type: 'الكل',
      rooms: 'الكل',
      maxPrice: 250000,
      search: '',
      sortBy: 'newest'
    });
  };

  // Filter and sort logic
  const filteredProperties = useMemo(() => {
    return currentProperties.filter(item => {
      // Purpose
      if (filters.purpose !== 'الكل' && item.purpose !== filters.purpose) return false;
      // City
      if (filters.city !== 'الكل' && item.city !== filters.city) return false;
      // Type
      if (filters.type !== 'الكل' && item.type !== filters.type) return false;
      // Rooms
      const itemRooms = item.bedrooms ?? item.rooms ?? 0;
      const targetRooms = filters.rooms || filters.bedrooms || 'الكل';
      if (targetRooms !== 'الكل') {
        if (targetRooms === '5+') {
          if (itemRooms < 5) return false;
        } else if (itemRooms !== Number(targetRooms)) {
          return false;
        }
      }
      // Price
      const itemPrice = item.priceUSD || item.price || 0;
      if (filters.maxPrice && itemPrice > Number(filters.maxPrice)) return false;
      // Search term
      if (filters.search && filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesTitle = (item.title || '').toLowerCase().includes(query);
        const matchesLocation = (item.location || item.address || item.city || '').toLowerCase().includes(query);
        const matchesDesc = (item.description || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesLocation && !matchesDesc) return false;
      }
      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'area-desc') return b.area - a.area;
      return b.id - a.id; // newest
    });
  }, [filters, currentProperties]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 block mb-1">دليل العقارات الشامل</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            العقارات المتاحة ({filteredProperties.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ابحث وتصفح الشقق والفلل والمكاتب الموثوقة مع إمكانية التبديل بين الخريطة والقائمة
          </p>
        </div>

        {/* View mode toggle & sort controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setShowMobileFilter(true)}
            className="lg:hidden flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span>تصفية ({filteredProperties.length})</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-medium text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="bg-transparent focus:outline-none cursor-pointer font-bold"
            >
              <option value="newest">الأحدث إضافة</option>
              <option value="price-asc">الأقل سعراً</option>
              <option value="price-desc">الأعلى سعراً</option>
              <option value="area-desc">المساحة الأكبر</option>
            </select>
          </div>

          {/* Layout Toggle Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="عرض الشبكة"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="عرض القائمة"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'map' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="عرض الخريطة"
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Sidebar Filter */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-28">
            <PropertyFilter
              filters={filters}
              setFilters={setFilters}
              onReset={handleResetFilters}
              citiesList={cities}
            />
          </div>
        </div>

        {/* Mobile Filter Drawer Modal */}
        {showMobileFilter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs lg:hidden">
            <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-5 shadow-2xl relative">
              <button
                onClick={() => setShowMobileFilter(false)}
                className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
              <PropertyFilter
                filters={filters}
                setFilters={setFilters}
                onReset={handleResetFilters}
                citiesList={cities}
              />
              <button
                onClick={() => setShowMobileFilter(false)}
                className="w-full mt-4 py-3 bg-blue-600 text-white font-bold text-xs rounded-xl"
              >
                عرض النتائج ({filteredProperties.length})
              </button>
            </div>
          </div>
        )}

        {/* Properties Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Active Search & Tags Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {filters.purpose !== 'الكل' && (
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center gap-1">
                {filters.purpose}
                <button onClick={() => setFilters(p => ({ ...p, purpose: 'الكل' }))} className="hover:text-red-500">×</button>
              </span>
            )}
            {filters.city !== 'الكل' && (
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center gap-1">
                {filters.city}
                <button onClick={() => setFilters(p => ({ ...p, city: 'الكل' }))} className="hover:text-red-500">×</button>
              </span>
            )}
            {filters.type !== 'الكل' && (
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center gap-1">
                {filters.type}
                <button onClick={() => setFilters(p => ({ ...p, type: 'الكل' }))} className="hover:text-red-500">×</button>
              </span>
            )}
            {filters.search && (
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center gap-1">
                البحث: "{filters.search}"
                <button onClick={() => setFilters(p => ({ ...p, search: '' }))} className="hover:text-red-500">×</button>
              </span>
            )}
          </div>

          {/* View Render */}
          {viewMode === 'map' ? (
            <InteractiveMap
              properties={filteredProperties}
              onSelectProperty={onSelectProperty}
              selectedCity={filters.city}
            />
          ) : filteredProperties.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">لا توجد عقارات مطابقة لهذه المعايير</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                جرب تغيير خيارات التصفية أو زيادة نطاق السعر أو اختيار مدينة أخرى للعثور على خيارات مناسبة.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors"
              >
                إعادة ضبط خيارات البحث
              </button>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-2' : 'grid-cols-1'
            }`}>
              {filteredProperties.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onSelect={onSelectProperty}
                  isFavorite={favorites.includes(property.id)}
                  onToggleFavorite={onToggleFavorite}
                  isCompared={comparedProperties.some(p => p.id === property.id)}
                  onToggleCompare={onToggleCompare}
                  layout={viewMode}
                />
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
