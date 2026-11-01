const normalizeHeader = (value) => String(value || '')
  .trim()
  .toLocaleLowerCase()
  .replace(/[\s_\-./()]+/g, '')
  .replace(/[أإآ]/g, 'ا')
  .replace(/ة/g, 'ه');

const HEADER_ALIASES = {
  title: ['العنوان', 'عنوانالعقار', 'عنوانالاعلان', 'اسم العقار', 'title', 'propertytitle', 'name'],
  city: ['المدينة', 'المدينه', 'المدينةالمنطقة', 'city', 'governorate'],
  location: ['الموقع', 'العنوانالتفصيلي', 'الحي', 'المنطقة', 'الحي والعنوان', 'العنوانوالحي', 'location', 'address', 'district'],
  price: ['السعر', 'السعرالمطلوب', 'price', 'priceusd'],
  purpose: ['العملية', 'نوعالعملية', 'الغرض', 'purpose', 'listingtype'],
  type: ['النوع', 'نوعالعقار', 'type', 'propertytype'],
  area: ['المساحة', 'المساحهم2', 'area', 'aream2'],
  rooms: ['الغرف', 'عددالغرف', 'rooms', 'bedrooms'],
  bathrooms: ['الحمامات', 'عددالحمامات', 'bathrooms'],
  description: ['الوصف', 'التفاصيل', 'الوصفالتفصيلي', 'description'],
  image: ['الصورة', 'رابطالصورة', 'image', 'imageurl'],
  latitude: ['خطالعرض', 'latitude', 'lat'],
  longitude: ['خطالطول', 'longitude', 'lng', 'lon']
};

function parseCsv(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] || '';
  const delimiter = [',', ';', '\t'].sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0];
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') { value += '"'; index += 1; }
      else quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(value); value = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(value); value = '';
      if (row.some((cell) => String(cell).trim())) rows.push(row);
      row = [];
    } else value += char;
  }
  row.push(value);
  if (row.some((cell) => String(cell).trim())) rows.push(row);
  return rows;
}

async function readZipEntries(buffer) {
  const view = new DataView(buffer);
  let eocd = -1;
  for (let offset = view.byteLength - 22; offset >= Math.max(0, view.byteLength - 65557); offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) { eocd = offset; break; }
  }
  if (eocd < 0) throw new Error('الملف ليس بصيغة Excel XLSX صالحة.');
  const entries = new Map();
  const entryCount = view.getUint16(eocd + 10, true);
  let offset = view.getUint32(eocd + 16, true);
  const decoder = new TextDecoder();

  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) break;
    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    const name = decoder.decode(new Uint8Array(buffer, offset + 46, nameLength));
    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = new Uint8Array(buffer, dataOffset, compressedSize);
    let bytes;
    if (method === 0) bytes = compressed;
    else if (method === 8 && typeof DecompressionStream !== 'undefined') {
      const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      bytes = new Uint8Array(await new Response(stream).arrayBuffer());
    } else throw new Error('المتصفح لا يدعم فك ضغط ملف Excel هذا. احفظه بصيغة XLSX حديثة أو CSV.');
    entries.set(name, decoder.decode(bytes));
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

function xmlDocument(text) {
  const document = new DOMParser().parseFromString(text, 'application/xml');
  if (document.querySelector('parsererror')) throw new Error('تعذر قراءة محتوى ملف Excel.');
  return document;
}

async function parseXlsx(buffer) {
  const entries = await readZipEntries(buffer);
  const sharedStrings = entries.has('xl/sharedStrings.xml')
    ? Array.from(xmlDocument(entries.get('xl/sharedStrings.xml')).getElementsByTagName('si'), (item) =>
      Array.from(item.getElementsByTagName('t'), (text) => text.textContent || '').join(''))
    : [];
  let sheetPath = 'xl/worksheets/sheet1.xml';
  if (entries.has('xl/workbook.xml') && entries.has('xl/_rels/workbook.xml.rels')) {
    const workbook = xmlDocument(entries.get('xl/workbook.xml'));
    const firstSheet = workbook.getElementsByTagName('sheet')[0];
    const relationId = firstSheet?.getAttribute('r:id');
    const relationships = xmlDocument(entries.get('xl/_rels/workbook.xml.rels'));
    const relation = Array.from(relationships.getElementsByTagName('Relationship')).find((item) => item.getAttribute('Id') === relationId);
    const target = relation?.getAttribute('Target');
    if (target) sheetPath = target.startsWith('/') ? target.slice(1) : `xl/${target.replace(/^\.\//, '')}`;
  }
  const sheetXml = entries.get(sheetPath) || entries.get('xl/worksheets/sheet1.xml');
  if (!sheetXml) throw new Error('لم يتم العثور على ورقة بيانات داخل ملف Excel.');
  const sheet = xmlDocument(sheetXml);
  const rows = [];
  for (const rowElement of Array.from(sheet.getElementsByTagName('row'))) {
    const row = [];
    for (const cell of Array.from(rowElement.getElementsByTagName('c'))) {
      const reference = cell.getAttribute('r') || '';
      const letters = reference.match(/[A-Z]+/i)?.[0] || 'A';
      const column = letters.toUpperCase().split('').reduce((sum, letter) => sum * 26 + letter.charCodeAt(0) - 64, 0) - 1;
      const type = cell.getAttribute('t');
      const value = type === 'inlineStr'
        ? Array.from(cell.getElementsByTagName('t'), (text) => text.textContent || '').join('')
        : cell.getElementsByTagName('v')[0]?.textContent || '';
      row[column] = type === 's' ? (sharedStrings[Number(value)] || '') : value;
    }
    rows.push(row.map((cell) => cell ?? ''));
  }
  return rows;
}

export async function readPropertySpreadsheet(file) {
  const extension = file.name.split('.').pop().toLocaleLowerCase();
  let rows;
  if (extension === 'csv') rows = parseCsv(await file.text().then((text) => text.replace(/^\uFEFF/, '')));
  else if (extension === 'xlsx') rows = await parseXlsx(await file.arrayBuffer());
  else throw new Error('يدعم الاستيراد ملفات XLSX وCSV فقط.');
  if (rows.length < 2) throw new Error('الملف فارغ أو لا يحتوي على صفوف عقارات.');

  const headers = rows[0].map(normalizeHeader);
  const columns = Object.fromEntries(Object.entries(HEADER_ALIASES).map(([field, aliases]) => [
    field,
    headers.findIndex((header) => aliases.some((alias) => normalizeHeader(alias) === header))
  ]));
  const missing = ['title', 'city', 'location', 'price', 'area', 'latitude', 'longitude'].filter((field) => columns[field] < 0);
  if (missing.length) throw new Error(`أضف الأعمدة المطلوبة إلى الملف: ${missing.map((field) => ({ title: 'العنوان', city: 'المدينة', location: 'الحي والعنوان', price: 'السعر', area: 'المساحة', latitude: 'خط العرض', longitude: 'خط الطول' })[field]).join('، ')}.`);

  const dataRows = rows.slice(1).filter((row) => row.some((cell) => String(cell).trim()));
  if (dataRows.length > 100) throw new Error('يمكن استيراد ١٠٠ عقار كحد أقصى في الملف الواحد.');
  return dataRows.map((row, index) => {
    const get = (field) => columns[field] < 0 ? '' : String(row[columns[field]] ?? '').trim();
    const lat = Number(get('latitude'));
    const lng = Number(get('longitude'));
    const price = Number(get('price').replace(/[^\d.-]/g, ''));
    const area = Number(get('area').replace(/[^\d.-]/g, ''));
    const errors = [];
    if (!get('title')) errors.push('العنوان مطلوب');
    if (!get('city')) errors.push('المدينة مطلوبة');
    if (!get('location')) errors.push('الحي والعنوان مطلوبان');
    if (!Number.isFinite(price) || price <= 0) errors.push('السعر غير صالح');
    if (!Number.isFinite(area) || area <= 0) errors.push('المساحة غير صالحة');
    if (!get('latitude') || !get('longitude') || !Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) errors.push('الإحداثيات غير صالحة');
    const rawPurpose = get('purpose');
    const rawType = get('type');
    const purpose = /rent|lease|إيجار|ايجار/i.test(rawPurpose) ? 'للإيجار' : /بيع|sale/i.test(rawPurpose) ? 'للبيع' : rawPurpose || 'للبيع';
    const type = /apartment|flat/i.test(rawType) ? 'شقة' : /villa/i.test(rawType) ? 'فيلا' : /office/i.test(rawType) ? 'مكتب' : rawType || 'شقة';
    return {
      rowNumber: index + 2,
      errors,
      property: {
        title: get('title'),
        city: get('city'),
        location: get('location'),
        district: get('location'),
        price,
        priceUSD: price,
        type,
        purpose,
        area,
        rooms: Number(get('rooms')) || 0,
        bedrooms: Number(get('rooms')) || 0,
        bathrooms: Number(get('bathrooms')) || 0,
        description: get('description'),
        coords: { lat, lng },
        image: get('image') || '/assets/images/74e3791940a62972275dd2c23dbee27e57215cf5.jpg'
      }
    };
  });
}
