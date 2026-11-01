import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  MessageCircle, 
  Share2, 
  Copy, 
  Check, 
  ShieldCheck
} from 'lucide-react';

export default function ContactModal({ property, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !property) return null;

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/#property-${property.id}` 
    : `https://engprop.sy/property/${property.id}`;

  const priceValue = Number(property.priceUSD ?? property.price ?? 0);

  const whatsappMessage = encodeURIComponent(
    `مرحباً، أود الاستفسار بخصوص العقار المعروض في منصة EngProp:\n"${property.title}"\nالسعر: $${priceValue.toLocaleString()}\nالرابط: ${shareUrl}`
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-right">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-sky-950 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-5 left-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-xs font-bold text-sky-400 block mb-1">تواصل مباشر وسريع</span>
          <h3 className="text-lg font-black">{property.agency?.name}</h3>
          <p className="text-xs text-slate-300 mt-1">الوسيط المعتمد والمرخص لهذا العقار</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Agent Info Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3.5">
            <img 
              src={property.agency?.avatar} 
              alt={property.agency?.name} 
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
            />
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <h4 className="font-extrabold text-slate-900 text-sm">{property.agency?.agentName || property.agency?.name}</h4>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">عضو معتمد بنقابة المكاتب العقارية</p>
              <span className="inline-block mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                متاح الآن للرد
              </span>
            </div>
          </div>

          {/* Direct WhatsApp button */}
          <a
            href={`https://wa.me/${property.agency?.whatsapp}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
            <span>محادثة واتساب فورية</span>
          </a>

          {/* Direct Phone Call */}
          <a
            href={`tel:${property.agency?.phone}`}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md shadow-sky-600/20 transition-all cursor-pointer"
          >
            <Phone className="w-5 h-5" />
            <span dir="ltr">{property.agency?.phone}</span>
            <span>- اتصال هاتفي</span>
          </a>

          {/* Share Property Link */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-sky-600" />
              <span>مشاركة رابط العقار الثابت (واتساب / فيسبوك):</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                dir="ltr"
                value={shareUrl}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 select-all"
              />
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
