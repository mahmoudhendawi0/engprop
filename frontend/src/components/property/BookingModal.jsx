import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  MapPin
} from 'lucide-react';

export default function BookingModal({ property, isOpen, onClose, onConfirmBooking }) {
  const [date, setDate] = useState('2026-03-24');
  const [time, setTime] = useState('04:30 مساءً');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !property) return null;

  const times = [
    '10:00 صباحاً',
    '11:30 صباحاً',
    '02:00 ظهراً',
    '04:30 مساءً',
    '06:00 مساءً'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newAppointment = {
      id: `APT-${Date.now().toString().slice(-4)}`,
      propertyId: property.id,
      propertyTitle: property.title,
      clientName: name,
      clientPhone: phone,
      preferredDate: date,
      preferredTime: time,
      notes: notes || 'طلب معاينة من خلال منصة EngProp',
      status: 'بانتظار التأكيد',
      agencyId: property.agency?.id || 'agency-1'
    };

    if (onConfirmBooking) {
      onConfirmBooking(newAppointment);
    }
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-right">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-sky-950 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-5 left-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-sky-300 text-xs font-bold mb-1">
            <Calendar className="w-4 h-4" />
            <span>حجز موعد معاينة ميدانية فوري</span>
          </div>
          <h3 className="text-lg font-black line-clamp-1">{property.title}</h3>
          <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>{property.city} - {property.district}</span>
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-black text-slate-900">تم إرسال طلب المعاينة بنجاح!</h4>
              <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                تم تسجيل موعدك في <span className="font-bold text-sky-700">{date}</span> الساعة <span className="font-bold text-sky-700">{time}</span>. سيتواصل معك ممثل <span className="font-bold text-slate-800">{property.agency?.name}</span> هاتفياً وعبر واتساب لتأكيد الحضور.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-md cursor-pointer"
                >
                  تم، العودة للعقار
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Agency card teaser */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={property.agency?.avatar} 
                    alt={property.agency?.name} 
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200" 
                  />
                  <div>
                    <span className="text-xs text-slate-500 block">المكتب المسؤول عن المعاينة:</span>
                    <span className="text-sm font-bold text-slate-900">{property.agency?.name}</span>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  وسيط موثق
                </span>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-sky-600" />
                    <span>تاريخ المعاينة المطلوب:</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    min="2026-03-22"
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-sky-600" />
                    <span>التوقيت المفضل:</span>
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    {times.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-sky-600" />
                    <span>الاسم الكامل:</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أحمد المحمد"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-sky-600" />
                    <span>رقم الهاتف / واتساب:</span>
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    placeholder="+963 9XX XXX XXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm text-right bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                  <span>ملاحظات أو استفسار خاص (اختياري):</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="مثال: هل يمكن اصطحاب مهندس لفحص الأساسات؟"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-sm font-bold rounded-xl shadow-md shadow-sky-600/30 transition-all cursor-pointer"
                >
                  تأكيد وحجز الموعد
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
