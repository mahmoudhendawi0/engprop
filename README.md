# EngProp

منصة عقارية عربية مبنية باستخدام React وVite للواجهة، وExpress وSQLite للخادم.

## هيكل المشروع

- `frontend/`: تطبيق React، الأصول المرئية، وإعداد Vite.
- `backend/src/`: واجهة Express البرمجية ومنطق قاعدة البيانات.
- `shared/`: بيانات البداية التي يستخدمها الخادم لتجهيز العقارات التجريبية.
- `data/`: قاعدة بيانات SQLite المحلية. تبقى منفصلة عن ملفات التطبيق.

## المتطلبات

- Node.js 20 أو أحدث.
- npm.

## التشغيل المحلي

من جذر المشروع:

```bash
npm install
npm run dev
```

يفتح Vite الواجهة على `http://localhost:5173`، ويعمل الخادم على `http://localhost:4000`. يمرر Vite طلبات `/api` إلى الخادم. يمكن تغيير الهدف باستخدام `VITE_DEV_API_TARGET`.

لتشغيل كل جزء منفرداً:

```bash
npm run dev --workspace @engprop/frontend
npm run dev --workspace @engprop/backend
```

## البناء والإنتاج

```bash
npm run build
npm start
```

ينتج بناء الواجهة في `frontend/dist/`، ويقدّمها خادم Express مع مسارات API. يمكن ضبط `PORT` و`JWT_SECRET` في بيئة الخادم. عند نشر الواجهة والخادم على نطاقين مختلفين، اضبط `VITE_API_URL` للواجهة واسمح بعنوان الواجهة في إعداد CORS للخادم.

## الاعتماديات

يعرف الجذر مساحات عمل npm وأوامر التشغيل المشتركة. لكل من `frontend/` و`backend/` ملف `package.json` مستقل يحدد اعتمادياته وأوامره؛ ويدير `package-lock.json` تثبيت المشروع كاملاً.
