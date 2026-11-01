import React from 'react';
import { Heart, ArrowLeft, Trash2 } from 'lucide-react';
import PropertyCard from '../components/property/PropertyCard';
import { properties } from '../data/propertiesData';

export default function Favorites({ 
  favorites = [], 
  onToggleFavorite, 
  onSelectProperty,
  setActivePage,
  comparedProperties = [],
  onToggleCompare,
  propertyList = properties
}) {
  const currentProperties = propertyList?.length ? propertyList : properties;
  const favoriteProperties = currentProperties.filter(p => favorites.includes(p.id));

  if (favoriteProperties.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <Heart className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">قائمة المفضلة فارغة حالياً</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            احفظ العقارات التي تثير اهتمامك للرجوع إليها ومقارنتها في أي وقت من خلال الضغط على علامة القلب في بطاقات العقارات.
          </p>
        </div>
        <button
          onClick={() => setActivePage('properties')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
        >
          <span>تصفح العقارات المتاحة</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <span className="text-xs font-bold text-rose-500 block mb-1">العقارات المحفوظة</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            قائمة المفضلة ({favoriteProperties.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            العقارات التي قمت بتمييزها للرجوع إليها أو حجز مواعيد معاينة لها
          </p>
        </div>

        <button
          onClick={() => favorites.forEach(id => onToggleFavorite(id))}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>مسح كل المفضلة</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteProperties.map(property => (
          <PropertyCard
            key={property.id}
            property={property}
            onSelect={onSelectProperty}
            isFavorite={true}
            onToggleFavorite={onToggleFavorite}
            isCompared={comparedProperties.some(p => p.id === property.id)}
            onToggleCompare={onToggleCompare}
          />
        ))}
      </div>

    </div>
  );
}
