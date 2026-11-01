import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LocateFixed, MapPin, Minus, Plus } from 'lucide-react';

const CITY_CENTERS = {
  'دمشق': [33.5138, 36.2765],
  'حلب': [36.2021, 37.1343],
  'إعزاز': [36.586, 37.044],
  'اللاذقية': [35.531, 35.792],
  'حمص': [34.7324, 36.7137],
  'حماة': [35.1318, 36.7578],
  'طرطوس': [34.889, 35.886]
};

const tileCount = (zoom) => 2 ** zoom;
const project = (lat, lng, zoom) => {
  const scale = 256 * tileCount(zoom);
  const safeLat = Math.max(-85.0511, Math.min(85.0511, lat));
  const sin = Math.sin((safeLat * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale
  };
};
const unproject = (x, y, zoom) => {
  const scale = 256 * tileCount(zoom);
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(Math.sinh(n));
  return { lat, lng };
};

export default function LocationPicker({ city, value, onChange, readOnly = false }) {
  const mapRef = useRef(null);
  const dragRef = useRef(null);
  const [zoom, setZoom] = useState(14);
  const initialCenter = readOnly && value
    ? [value.lat, value.lng]
    : CITY_CENTERS[city] || CITY_CENTERS['دمشق'];
  const [center, setCenter] = useState(() => project(...initialCenter, 14));
  const [dragging, setDragging] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [viewport, setViewport] = useState({ width: 640, height: 320 });

  useEffect(() => {
    if (!mapRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      setViewport({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);

  const visibleTiles = useMemo(() => {
    const firstX = Math.floor((center.x - viewport.width / 2) / 256) - 1;
    const lastX = Math.floor((center.x + viewport.width / 2) / 256) + 1;
    const firstY = Math.floor((center.y - viewport.height / 2) / 256) - 1;
    const lastY = Math.floor((center.y + viewport.height / 2) / 256) + 1;
    const count = tileCount(zoom);
    const tiles = [];
    for (let x = firstX; x <= lastX; x += 1) {
      for (let y = firstY; y <= lastY; y += 1) {
        if (y < 0 || y >= count) continue;
        const wrappedX = ((x % count) + count) % count;
        tiles.push({ x, y, urlX: wrappedX, key: `${x}-${y}` });
      }
    }
    return tiles;
  }, [center, viewport, zoom]);

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;
    const rect = mapRef.current.getBoundingClientRect();
    dragRef.current = { x: event.clientX, y: event.clientY, center, rect, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 5) {
      drag.moved = true;
      setDragging(true);
      setCenter({ x: drag.center.x - dx, y: drag.center.y - dy });
    }
  };

  const handlePointerUp = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (!drag.moved && !readOnly) {
      const x = center.x + event.clientX - drag.rect.left - drag.rect.width / 2;
      const y = center.y + event.clientY - drag.rect.top - drag.rect.height / 2;
      onChange(unproject(x, y, zoom));
    }
    dragRef.current = null;
    setDragging(false);
  };

  const locateDevice = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('المتصفح لا يدعم تحديد الموقع.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition((position) => {
      const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
      setZoom(17);
      setCenter(project(coords.lat, coords.lng, 17));
      onChange(coords);
      setLocating(false);
    }, (error) => {
      const message = error.code === error.PERMISSION_DENIED
        ? 'لم يُسمح بالوصول إلى الموقع. فعّل إذن الموقع للمتصفح ثم حاول مجددًا.'
        : error.code === error.TIMEOUT
          ? 'انتهت مهلة تحديد الموقع. حاول مرة أخرى.'
          : 'تعذر تحديد موقع الجهاز. تحقق من تفعيل خدمات الموقع.';
      setLocationError(message);
      setLocating(false);
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  };

  const changeZoom = (delta) => {
    const nextZoom = Math.max(4, Math.min(zoom + delta, 19));
    const geographicCenter = unproject(center.x, center.y, zoom);
    setCenter(project(geographicCenter.lat, geographicCenter.lng, nextZoom));
    setZoom(nextZoom);
  };

  const marker = value ? project(value.lat, value.lng, zoom) : null;
  const markerLeft = marker ? marker.x - center.x + viewport.width / 2 : 0;
  const markerTop = marker ? marker.y - center.y + viewport.height / 2 : 0;

  return (
    <section className="space-y-3" dir="rtl" lang="ar">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <label className="block text-xs font-bold text-slate-700">{readOnly ? 'موقع العقار' : <>حدد موقع العقار على الخريطة <span className="text-red-600">*</span></>}</label>
          <p className="mt-1 text-[11px] text-slate-500">{readOnly ? 'موقع العقار على صور الأقمار الصناعية.' : 'حرّك الخريطة إلى موقع العقار ثم انقر لوضع العلامة، أو استخدم موقع الجهاز.'}</p>
        </div>
        {!readOnly && <button type="button" onClick={locateDevice} disabled={locating} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60">
          <LocateFixed className="h-4 w-4" />{locating ? 'جارٍ تحديد الموقع...' : 'استخدم موقعي الحالي'}
        </button>}
        {value && !readOnly && <span className="text-[11px] font-semibold text-emerald-700">تم تحديد الموقع</span>}
      </div>

      {locationError && <p role="alert" className="text-xs font-semibold text-red-600">{locationError}</p>}

      <div
        ref={mapRef}
        className={`relative h-72 touch-none overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:h-80 ${dragging ? 'cursor-grabbing' : readOnly ? 'cursor-grab' : 'cursor-crosshair'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { dragRef.current = null; setDragging(false); }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {visibleTiles.map((tile) => (
            <img
              key={tile.key}
              src={`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${tile.y}/${tile.urlX}`}
              alt=""
              draggable="false"
              onError={() => setMapError(true)}
              className="absolute max-w-none select-none"
              style={{ left: `calc(50% + ${tile.x * 256 - center.x}px)`, top: `calc(50% + ${tile.y * 256 - center.y}px)`, width: 256, height: 256 }}
            />
          ))}
        </div>

        {marker && markerLeft >= -20 && markerLeft <= viewport.width + 20 && markerTop >= -35 && markerTop <= viewport.height + 20 && (
          <MapPin className="pointer-events-none absolute z-10 h-9 w-9 -translate-x-1/2 -translate-y-full fill-blue-600 text-white drop-shadow-md" style={{ left: markerLeft, top: markerTop }} />
        )}

        <div className="absolute left-3 top-3 z-20 flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" onPointerDown={(event) => event.stopPropagation()}>
          <button type="button" aria-label="تكبير الخريطة" onClick={() => changeZoom(1)} className="grid h-9 w-9 place-items-center text-slate-700 hover:bg-slate-50"><Plus className="h-4 w-4" /></button>
          <button type="button" aria-label="تصغير الخريطة" onClick={() => changeZoom(-1)} className="grid h-9 w-9 place-items-center border-t border-slate-200 text-slate-700 hover:bg-slate-50"><Minus className="h-4 w-4" /></button>
        </div>

        {mapError && <div className="absolute bottom-2 right-2 rounded bg-white/90 px-2 py-1 text-[10px] text-slate-600">تعذر تحميل بعض أجزاء الخريطة</div>}
        <a href="https://livingatlas.arcgis.com/imagery/" target="_blank" rel="noreferrer" className="absolute bottom-1 left-1 z-20 rounded bg-white/90 px-1.5 py-0.5 text-[10px] text-slate-700">الصور: Esri، Maxar، Earthstar Geographics، ومجتمع مستخدمي GIS</a>
      </div>

      {value && <p className="text-[11px] text-slate-500" dir="ltr">{value.lat.toFixed(6)}, {value.lng.toFixed(6)}</p>}
    </section>
  );
}
