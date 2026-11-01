import React, { useState } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Sparkles, 
  Search, 
  CheckCircle
} from 'lucide-react';

export default function VoiceAIModal({ isOpen, onClose, onApplySearch }) {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [extractedFilters, setExtractedFilters] = useState(null);

  if (!isOpen) return null;

  const samplePrompts = [
    "بدي بيت للإيجار بإعزاز 3 غرف وسعره أقل من 400 دولار",
    "فيلا حديثة للبيع في إعزاز أو ريف حلب مع مسبح",
    "شقة مفروشة للإيجار بدمشق الميدان 3 غرف",
    "مكتب تجاري حديث متكامل للإيجار بدمشق للشركات",
    "بنتهاوس فاخر للبيع في حلب الشهباء"
  ];

  const handleSelectSample = (text) => {
    setQuery(text);
    parseNaturalLanguage(text);
  };

  const parseNaturalLanguage = (text) => {
    const filters = {};
    const lower = text.toLowerCase();

    // Purpose
    if (lower.includes('إيجار') || lower.includes('للايجار')) {
      filters.purpose = 'للإيجار';
    } else if (lower.includes('بيع') || lower.includes('شراء')) {
      filters.purpose = 'للبيع';
    }

    // City
    if (lower.includes('إعزاز') || lower.includes('اعزاز')) {
      filters.city = 'إعزاز';
    } else if (lower.includes('دمشق') || lower.includes('الميدان') || lower.includes('المزة')) {
      filters.city = 'دمشق';
    } else if (lower.includes('حلب') || lower.includes('الشهباء')) {
      filters.city = 'حلب';
    } else if (lower.includes('عفرين') || lower.includes('ريف حلب')) {
      filters.city = 'ريف حلب';
    }

    // Type
    if (lower.includes('فيلا')) {
      filters.type = 'فيلا';
    } else if (lower.includes('شقة') || lower.includes('بيت') || lower.includes('بنتهاوس')) {
      filters.type = 'شقة';
    } else if (lower.includes('مكتب')) {
      filters.type = 'مكتب';
    }

    // Bedrooms
    if (lower.includes('3 غرف') || lower.includes('ثلاث غرف')) {
      filters.bedrooms = 3;
    } else if (lower.includes('2 غرف') || lower.includes('غرفتين')) {
      filters.bedrooms = 2;
    } else if (lower.includes('4 غرف') || lower.includes('اربع غرف')) {
      filters.bedrooms = 4;
    } else if (lower.includes('5 غرف') || lower.includes('خمس غرف')) {
      filters.bedrooms = 5;
    }

    // Price
    const matchPrice = text.match(/(\d+)\s*(دولار|\$)/);
    if (matchPrice) {
      filters.maxPrice = parseInt(matchPrice[1], 10);
    }

    setExtractedFilters(filters);
  };

  const handleApply = () => {
    if (onApplySearch) {
      onApplySearch(query, extractedFilters);
    }
    onClose();
  };

  const toggleMic = () => {
    if (!isListening) {
      setIsListening(true);
      // Simulate voice capture
      setTimeout(() => {
        const randomSample = samplePrompts[0];
        setQuery(randomSample);
        parseNaturalLanguage(randomSample);
        setIsListening(false);
      }, 2000);
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden text-right">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-5 left-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black">المساعد العقاري الذكي (EngProp AI)</h3>
              <p className="text-xs text-sky-200 font-medium">البحث الذكي باللغة الطبيعية والصوت المباشر</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              احكِ طلبك أو اكتبه كما تتحدث تماماً:
            </label>
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  parseNaturalLanguage(e.target.value);
                }}
                rows={3}
                placeholder="مثال: بدي بيت للإيجار بإعزاز 3 غرف وسعره أقل من 400 دولار..."
                className="w-full px-4 py-3 text-slate-800 text-sm font-medium bg-slate-50 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all resize-none"
              />

              <button
                type="button"
                onClick={toggleMic}
                className={`absolute left-3 bottom-3 p-2.5 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  isListening 
                    ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30' 
                    : 'bg-sky-100 hover:bg-sky-200 text-sky-700'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span>جاري الاستماع...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>تحدث بصوتك</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Extracted filters preview */}
          {extractedFilters && Object.keys(extractedFilters).length > 0 && (
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900">
                <CheckCircle className="w-4 h-4 text-sky-600" />
                <span>المعايير المستخرجة بالذكاء الاصطناعي:</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {extractedFilters.purpose && (
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-sky-200 text-sky-800 text-xs font-bold">
                    العملية: {extractedFilters.purpose}
                  </span>
                )}
                {extractedFilters.city && (
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-sky-200 text-sky-800 text-xs font-bold">
                    المدينة: {extractedFilters.city}
                  </span>
                )}
                {extractedFilters.type && (
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-sky-200 text-sky-800 text-xs font-bold">
                    النوع: {extractedFilters.type}
                  </span>
                )}
                {extractedFilters.bedrooms && (
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-sky-200 text-sky-800 text-xs font-bold">
                    الغرف: {extractedFilters.bedrooms}
                  </span>
                )}
                {extractedFilters.maxPrice && (
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-sky-200 text-sky-800 text-xs font-bold">
                    أقصى سعر: ${extractedFilters.maxPrice}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Preset Prompts Chips */}
          <div>
            <span className="block text-xs font-bold text-slate-400 mb-2">
              أمثلة لطلبات شائعة جاهزة للتجربة:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(p)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 border border-slate-200/80 text-slate-700 transition-colors cursor-pointer text-right"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            إلغاء
          </button>

          <button
            onClick={handleApply}
            disabled={!query.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-sm font-bold shadow-md transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>عرض العقارات المطابقة</span>
          </button>
        </div>
      </div>
    </div>
  );
}
