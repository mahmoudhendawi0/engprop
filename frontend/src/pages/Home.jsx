import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  ArrowLeft, 
  Mic, 
  Sparkles,
  Users,
  FileText
} from 'lucide-react';
import PropertyCard from '../components/property/PropertyCard';
import { properties, cities } from '../data/propertiesData';

export default function Home({ 
  onSelectProperty, 
  setActivePage, 
  setFilterQuery, 
  favorites = [], 
  onToggleFavorite,
  comparedProperties = [],
  onToggleCompare,
  propertyList = properties
}) {
  const [searchPurpose, setSearchPurpose] = useState('الكل');
  const [searchCity, setSearchCity] = useState('الكل');
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (setFilterQuery) {
      setFilterQuery({
        purpose: searchPurpose,
        city: searchCity,
        search: searchTerm
      });
    }
    setActivePage('properties');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVoiceSearch = () => {
    setIsListening(true);
    setTimeout(() => {
      setSearchTerm('شقة 3 غرف في إعزاز');
      setIsListening(false);
    }, 1500);
  };

  const currentProperties = propertyList?.length ? propertyList : properties;
  const featuredProperties = currentProperties.filter(p => p.featured);

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative min-h-[580px] rounded-b-[40px] overflow-hidden bg-slate-950 flex items-center justify-center text-white px-4 sm:px-6 lg:px-8 py-16 shadow-2xl">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/images/af96a8dfef4a405a6b98308528432440891a8af7.jpg" 
            alt="فيلا عصرية مع مسبح" 
            className="w-full h-full object-cover opacity-35 scale-105 transform hover:scale-100 transition-transform duration-1000 ease-out" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-blue-950/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold backdrop-blur-md animate-fade-in">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>المنصة الأولى المعتمدة للوساطة العقارية وإدارة الأملاك</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-tight">
            ابحث عن عقارك المثالي بكل <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-400 to-sky-300">ثقة وسهولة</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-normal">
            تصفح آلاف الشقق، الفلل، والمكاتب الموثقة مباشرة من المكاتب العقارية المعتمدة، مع عقود رسمية موثقة وخريطة تفاعلية شاملة.
          </p>

          {/* Search Box */}
          <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-3xl shadow-2xl border border-white/20 text-slate-900">
            
            {/* Tabs for Purpose */}
            <div className="flex gap-2 border-b border-slate-100 pb-3 mb-3">
              {[
                { id: 'الكل', label: 'كافة العمليات' },
                { id: 'للإيجار', label: 'عقارات للإيجار' },
                { id: 'للبيع', label: 'عقارات للبيع' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSearchPurpose(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    searchPurpose === tab.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Input fields */}
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
              
              {/* Text / Keyword Search */}
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ابحث بالمنطقة، اسم المشروع، أو المواصفات (مثلاً: شقة في الميدان)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-blue-600 transition-colors ${
                    isListening ? 'text-red-500 animate-pulse' : ''
                  }`}
                  title="بحث صوتي"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              {/* City Selection */}
              <div className="sm:col-span-3 relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full pr-10 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="الكل">كل المدن والمناطق</option>
                  {cities.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>بحث عن عقارات</span>
                </button>
              </div>

            </form>

          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 max-w-4xl mx-auto">
            <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-amber-400 font-['Inter']">140+</span>
              <span className="text-xs text-slate-300 font-medium">عقار موثق ومتاح</span>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-sky-400 font-['Inter']">18+</span>
              <span className="text-xs text-slate-300 font-medium">مكتب عقاري معتمد</span>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-emerald-400 font-['Inter']">99%</span>
              <span className="text-xs text-slate-300 font-medium">عقود رسمية مؤمنة</span>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-purple-400 font-['Inter']">24/7</span>
              <span className="text-xs text-slate-300 font-medium">حجز مواعيد المعاينة</span>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs mb-2">
              <Sparkles className="w-4 h-4" />
              <span>مختارات اليوم المميزة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              أحدث العقارات الموثقة
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              شقق، فلل، ومكاتب فاخرة بأفضل الأسعار مع صور حقيقية وتفاصيل موثوقة
            </p>
          </div>

          <button
            onClick={() => setActivePage('properties')}
            className="self-start sm:self-auto flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors group cursor-pointer bg-blue-50 px-4 py-2.5 rounded-xl"
          >
            <span>استعراض كافة العقارات</span>
            <ArrowLeft className="w-4 h-4 group-hover:translate-x-[-3px] transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.slice(0, 6).map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelect={onSelectProperty}
              isFavorite={favorites.includes(property.id)}
              onToggleFavorite={onToggleFavorite}
              isCompared={comparedProperties.some(p => p.id === property.id)}
              onToggleCompare={onToggleCompare}
            />
          ))}
        </div>
      </section>

      {/* Explore Cities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-blue-600 block mb-1">المناطق والمدن</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            استكشف العقارات حسب المدينة
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            ابحث بسهولة في أشهر المحافظات والمناطق السورية ذات النشاط العقاري الأوسع
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {cities.map(city => (
            <div
              key={city.name}
              onClick={() => {
                if (setFilterQuery) setFilterQuery(prev => ({ ...prev, city: city.name }));
                setActivePage('properties');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group relative h-48 rounded-2xl overflow-hidden border border-slate-200 cursor-pointer shadow-xs hover:shadow-lg transition-all duration-300"
            >
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
              <div className="absolute bottom-3 right-3 left-3 text-white">
                <h4 className="font-bold text-base leading-tight group-hover:text-blue-300 transition-colors">
                  {city.name}
                </h4>
                <span className="text-[11px] text-slate-300 font-medium">
                  {city.count} عقار متاح
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Map Banner Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-4 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
              تصفح جغرافي متطور
            </span>
            <h3 className="text-2xl sm:text-3xl font-black leading-snug">
              تصفح العقارات عبر الخريطة التفاعلية الذكية
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              شاهد مواقع العقارات بدقة على الخريطة الجغرافية وتعرف على الخدمات المحيطة من مدارس، مراكز تسوق، ومستشفيات مع معاينة فورية للأسعار.
            </p>
            <button
              onClick={() => {
                setActivePage('map');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              <span>فتح الخريطة التفاعلية الآن</span>
            </button>
          </div>

          <div className="w-full md:w-80 h-56 rounded-2xl bg-slate-800/80 border border-slate-700 p-4 flex flex-col justify-between shadow-inner">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold border-b border-slate-700 pb-2">
              <span>تغطية الخريطة</span>
              <span className="text-emerald-400">مباشر ومحدث</span>
            </div>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg">
                <span>دمشق والميدان</span>
                <span className="font-bold text-white">42 عقار</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg">
                <span>حلب والشهباء</span>
                <span className="font-bold text-white">31 عقار</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg">
                <span>إعزاز والريف</span>
                <span className="font-bold text-white">20 عقار</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose EngProp */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-blue-600 block mb-1">المزايا والضمانات</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            لماذا يختار الآلاف منصة EngProp؟
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">عقارات موثقة 100%</h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              جميع الإعلانات تخضع لتدقيق الملكية والصور الواقعية قبل نشرها لضمان تجربة آمنة خالية من الاحتيال.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">مكاتب معتمدة فقط</h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              نتعامل حصرياً مع المكاتب العقارية المرخصة ذات السمعة العالية لضمان إبرام عقود نظامية ومحمية قانونياً.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">إدارة العقود الإلكترونية</h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              نظام متكامل لتتبع سريان العقود ومواعيد الإيجار والتنبيهات المؤتمتة عند اقتراب التجديد لتفادي أي تأخير.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-right">
            <h3 className="text-2xl sm:text-3xl font-bold">هل أنت صاحب مكتب عقاري أو مالك عقار؟</h3>
            <p className="text-slate-400 text-xs sm:text-sm">
              انضم إلى شبكة مكاتب EngProp واعرض عقاراتك أمام آلاف الباحثين عن عقارات يومياً.
            </p>
          </div>
          <button
            onClick={() => setActivePage('add-property')}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all shrink-0 cursor-pointer"
          >
            أضف عقارك الآن مجاناً
          </button>
        </div>
      </section>

    </div>
  );
}

