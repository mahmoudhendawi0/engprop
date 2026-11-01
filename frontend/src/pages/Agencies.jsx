import React, { useState } from 'react';
import { MapPin, Phone, Mail, Star, ShieldCheck, ArrowLeft, Search } from 'lucide-react';
import { agencies } from '../data/propertiesData';

export default function Agencies({ onSelectAgencyProperties, onSelectAgency, setActivePage }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('الكل');

  const filteredAgencies = agencies.filter(agency => {
    if (selectedCity !== 'الكل' && !agency.city.includes(selectedCity)) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return agency.name.toLowerCase().includes(q) || agency.address.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-blue-600 block">شبكة الوسطاء والشركاء</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          دليل المكاتب العقارية المعتمدة
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          تعامل مع نخبة المكاتب العقارية المرخصة رسمياً في دمشق، حلب، إعزاز، واللاذقية لضمان حقوقك القانونية
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="max-w-3xl mx-auto bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث باسم المكتب أو العنوان..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full sm:w-48 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="الكل">كافة المحافظات</option>
          <option value="دمشق">دمشق وريفها</option>
          <option value="حلب">حلب</option>
          <option value="إعزاز">إعزاز</option>
          <option value="اللاذقية">اللاذقية</option>
        </select>
      </div>

      {/* Agencies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgencies.map(agency => (
          <div
            key={agency.id}
            className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              {/* Agency Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center p-2 shrink-0">
                    <img
                      src={agency.logo || agency.avatar || '/assets/engprop-logo.png'}
                      alt={agency.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-tight">
                      {agency.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{agency.rating}</span>
                      <span className="text-slate-400 font-normal">({agency.reviewsCount} تقييم)</span>
                    </div>
                  </div>
                </div>

                {agency.verified && (
                  <span className="p-1 rounded-full bg-emerald-50 text-emerald-600" title="مكتب معتمد وموثق">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                )}
              </div>

              {/* Location & Details */}
              <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{agency.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                  <span dir="ltr">{agency.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{agency.email}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                <span className="text-blue-600 font-extrabold text-sm">{agency.propertiesCount}</span> عقار معروض
              </span>

              <button type="button" onClick={() => { onSelectAgency?.(agency); setActivePage('agency-profile'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-xs font-bold text-slate-700 hover:text-blue-700">
                عرض صفحة المكتب
              </button>

              <button
                onClick={() => {
                  if (onSelectAgencyProperties) onSelectAgencyProperties(agency);
                  setActivePage('properties');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors group cursor-pointer"
              >
                <span>تصفح عقارات المكتب</span>
                <ArrowLeft className="w-4 h-4 group-hover:translate-x-[-3px] transition-transform" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
