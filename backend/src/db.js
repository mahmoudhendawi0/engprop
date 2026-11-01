import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', '..', 'data');
const dbPath = path.join(dataDir, 'engprop.db');
const seedProperties = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'shared', 'properties-seed.json'), 'utf8'));

fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS agencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    data TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active',
    verified INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS agency_staff (
    agency_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    permissions TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (agency_id, user_id),
    FOREIGN KEY (agency_id) REFERENCES agencies(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    price REAL NOT NULL DEFAULT 0,
    limits TEXT NOT NULL DEFAULT '{}',
    features TEXT NOT NULL DEFAULT '{}',
    active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agency_id INTEGER NOT NULL,
    plan_id INTEGER NOT NULL,
    starts_at TEXT NOT NULL,
    ends_at TEXT NOT NULL,
    grace_days INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agency_id) REFERENCES agencies(id),
    FOREIGN KEY (plan_id) REFERENCES plans(id)
  );

  CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    agency_id INTEGER,
    status TEXT NOT NULL DEFAULT 'published',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER NOT NULL,
    property_id TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, property_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agency_id INTEGER NOT NULL,
    property_id TEXT,
    assigned_user_id INTEGER,
    data TEXT NOT NULL DEFAULT '{}',
    stage TEXT NOT NULL DEFAULT 'new',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agency_id INTEGER,
    property_id TEXT,
    requester_user_id INTEGER,
    data TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending',
    starts_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS rental_contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agency_id INTEGER NOT NULL,
    property_id TEXT NOT NULL,
    data TEXT NOT NULL DEFAULT '{}',
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS rental_renewals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id INTEGER NOT NULL,
    data TEXT NOT NULL DEFAULT '{}',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS rental_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id INTEGER NOT NULL,
    days_before INTEGER NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    UNIQUE(contract_id, days_before)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    data TEXT NOT NULL DEFAULT '{}',
    read_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agency_id INTEGER NOT NULL,
    data TEXT NOT NULL DEFAULT '{}',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    governorate TEXT NOT NULL,
    district TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'visible',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_user_id INTEGER,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    data TEXT NOT NULL DEFAULT '{}',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

const propertyColumns = db.prepare('PRAGMA table_info(properties)').all().map((column) => column.name);
if (!propertyColumns.includes('agency_id')) db.exec('ALTER TABLE properties ADD COLUMN agency_id INTEGER');
if (!propertyColumns.includes('status')) db.exec("ALTER TABLE properties ADD COLUMN status TEXT NOT NULL DEFAULT 'published'");

function normalizeProperty(property) {
  const normalizedId = String(property.id ?? Date.now());
  const priceValue = Number(property.priceUSD ?? property.price ?? 0);
  const imageValue = property.image || property.images?.[0] || property.gallery?.[0] || '/assets/images/74e3791940a62972275dd2c23dbee27e57215cf5.jpg';

  return {
    ...property,
    id: normalizedId,
    price: priceValue,
    priceUSD: priceValue,
    rooms: Number(property.rooms ?? property.bedrooms ?? 0),
    bedrooms: Number(property.bedrooms ?? property.rooms ?? 0),
    image: imageValue,
    images: Array.isArray(property.images) && property.images.length > 0
      ? property.images
      : [...(property.gallery || []), imageValue].filter(Boolean),
    location: property.location || property.address || `${property.city || ''} - ${property.district || ''}`,
    createdAt: property.createdAt || new Date().toISOString().slice(0, 10),
    publishedAt: property.publishedAt || 'منذ يومين'
  };
}

export const defaultAdminCredentials = {
  name: 'Admin EngProp',
  email: 'admin@engprop.sy',
  password: 'admin123'
};

export function seedDatabase() {
  const seedUsers = [
    { ...defaultAdminCredentials, role: 'admin' },
    { name: 'المهندس محمود هنداوي', email: 'office@engprop.sy', password: 'office123', role: 'office' },
    { name: 'مستخدم EngProp التجريبي', email: 'user@engprop.sy', password: 'user123', role: 'user' }
  ];
  const insertUser = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
  seedUsers.forEach((seedUser) => {
    if (!getUserByEmail(seedUser.email)) {
      insertUser.run(
        seedUser.name,
        seedUser.email,
        bcrypt.hashSync(seedUser.password, 10),
        seedUser.role
      );
    }
  });

  const seedPlans = [
    { name: 'Basic', price: 0, limits: { properties: 10, employees: 2, images: 50, videos: 2 }, features: { crm: true, rentals: true, analytics: false, api: false, excelImport: false } },
    { name: 'Pro', price: 29, limits: { properties: 100, employees: 10, images: 500, videos: 25 }, features: { crm: true, rentals: true, analytics: true, api: true, excelImport: true } },
    { name: 'Premium', price: 79, limits: { properties: -1, employees: -1, images: -1, videos: -1 }, features: { crm: true, rentals: true, analytics: true, api: true, excelImport: true } }
  ];
  const insertPlan = db.prepare('INSERT OR IGNORE INTO plans (name, price, limits, features) VALUES (?, ?, ?, ?)');
  seedPlans.forEach((plan) => insertPlan.run(plan.name, plan.price, JSON.stringify(plan.limits), JSON.stringify(plan.features)));

  const propertiesCount = db.prepare('SELECT COUNT(*) AS count FROM properties').get().count;
  if (propertiesCount === 0) {
    const insertProperty = db.prepare('INSERT INTO properties (id, data) VALUES (?, ?)');
    const normalized = seedProperties.map(normalizeProperty);
    normalized.forEach((property) => {
      insertProperty.run(String(property.id), JSON.stringify(property));
    });
  }
}

seedDatabase();

export function getAllProperties() {
  return db.prepare('SELECT data FROM properties ORDER BY rowid DESC').all().map((row) => JSON.parse(row.data));
}

export function listUserFavorites(userId) {
  return db.prepare('SELECT property_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC').all(Number(userId)).map(row => row.property_id);
}

export function setUserFavorite(userId, propertyId, enabled) {
  if (enabled) {
    db.prepare('INSERT OR IGNORE INTO favorites (user_id, property_id) VALUES (?, ?)').run(Number(userId), String(propertyId));
  } else {
    db.prepare('DELETE FROM favorites WHERE user_id = ? AND property_id = ?').run(Number(userId), String(propertyId));
  }
  return listUserFavorites(userId);
}

export function getPropertyById(id) {
  const row = db.prepare('SELECT data FROM properties WHERE id = ?').get(String(id));
  return row ? JSON.parse(row.data) : null;
}

export function createProperty(property) {
  const normalized = normalizeProperty(property);
  db.prepare('INSERT OR REPLACE INTO properties (id, data, agency_id, status) VALUES (?, ?, ?, ?)').run(
    String(normalized.id),
    JSON.stringify(normalized),
    property.agencyId || null,
    property.status || 'published'
  );
  return normalized;
}

export function getOrCreateAgencyForUser(userId, name = 'مكتب المهندس محمود هنداوي العقاري') {
  let agency = db.prepare('SELECT * FROM agencies WHERE owner_user_id = ?').get(Number(userId));
  if (!agency) {
    const slug = `agency-${userId}`;
    const result = db.prepare('INSERT INTO agencies (owner_user_id, name, slug, data) VALUES (?, ?, ?, ?)').run(userId, name, slug, JSON.stringify({}));
    agency = db.prepare('SELECT * FROM agencies WHERE id = ?').get(result.lastInsertRowid);
    const plan = db.prepare('SELECT id FROM plans ORDER BY id LIMIT 1').get();
    const startsAt = new Date().toISOString().slice(0, 10);
    const endsAt = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    db.prepare('INSERT INTO subscriptions (agency_id, plan_id, starts_at, ends_at) VALUES (?, ?, ?, ?)').run(agency.id, plan.id, startsAt, endsAt);
  }
  return agency;
}

export function createAgencyWithOwner({ agencyName, managerName, email, password, city, planName = 'Basic', durationDays = 30 }) {
  const transaction = db.transaction(() => {
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      throw new Error('البريد الإلكتروني مستخدم مسبقاً');
    }

    const userResult = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
      managerName,
      email,
      bcrypt.hashSync(password, 10),
      'office'
    );
    const slug = `agency-${userResult.lastInsertRowid}-${Date.now()}`;
    const agencyResult = db.prepare(
      'INSERT INTO agencies (owner_user_id, name, slug, data, status, verified) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      userResult.lastInsertRowid,
      agencyName,
      slug,
      JSON.stringify({ city, managerName }),
      'active',
      0
    );
    const plan = db.prepare('SELECT * FROM plans WHERE name = ? AND active = 1').get(planName);
    if (!plan) {
      throw new Error('الباقة المحددة غير موجودة');
    }
    const startsAt = new Date().toISOString().slice(0, 10);
    const endsAt = new Date(Date.now() + Number(durationDays) * 86400000).toISOString().slice(0, 10);
    const subscriptionResult = db.prepare(
      'INSERT INTO subscriptions (agency_id, plan_id, starts_at, ends_at) VALUES (?, ?, ?, ?)'
    ).run(agencyResult.lastInsertRowid, plan.id, startsAt, endsAt);

    return {
      user: db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(userResult.lastInsertRowid),
      agency: db.prepare('SELECT * FROM agencies WHERE id = ?').get(agencyResult.lastInsertRowid),
      subscription: db.prepare(`
        SELECT subscriptions.*, plans.name AS plan_name, plans.price, plans.limits, plans.features
        FROM subscriptions JOIN plans ON plans.id = subscriptions.plan_id
        WHERE subscriptions.id = ?
      `).get(subscriptionResult.lastInsertRowid)
    };
  });

  return transaction();
}

export function createAdminResource(type, payload) {
  if (type === 'locations') {
    const result = db.prepare('INSERT INTO locations (governorate, district, status) VALUES (?, ?, ?)').run(payload.governorate, payload.district, payload.status || 'visible');
    return db.prepare('SELECT * FROM locations WHERE id = ?').get(result.lastInsertRowid);
  }
  if (type === 'plans') {
    const result = db.prepare('INSERT INTO plans (name, price, limits, features, active) VALUES (?, ?, ?, ?, ?)').run(
      payload.name, Number(payload.price || 0), JSON.stringify(payload.limits || { properties: 10, employees: 2 }), JSON.stringify(payload.features || {}), 1
    );
    return db.prepare('SELECT * FROM plans WHERE id = ?').get(result.lastInsertRowid);
  }
  if (type === 'users') {
    const result = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
      payload.name, payload.email, bcrypt.hashSync(payload.password, 10), payload.role || 'user'
    );
    return db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
  }
  if (type === 'payments') {
    const result = db.prepare('INSERT INTO payments (agency_id, data) VALUES (?, ?)').run(Number(payload.agencyId), JSON.stringify({
      amount: Number(payload.amount), invoice: payload.invoice, status: payload.status || 'paid', method: payload.method || 'manual'
    }));
    return db.prepare('SELECT * FROM payments WHERE id = ?').get(result.lastInsertRowid);
  }
  if (type === 'notifications') {
    const result = db.prepare('INSERT INTO notifications (user_id, data) VALUES (?, ?)').run(
      payload.userId ? Number(payload.userId) : null, JSON.stringify({ title: payload.title, message: payload.message, audience: payload.audience || 'all' })
    );
    return db.prepare('SELECT * FROM notifications WHERE id = ?').get(result.lastInsertRowid);
  }
  throw new Error('نوع السجل غير مدعوم');
}

export function listModerationProperties() {
  const rows = db.prepare('SELECT id, data, agency_id, status, created_at FROM properties ORDER BY created_at DESC').all();
  const signatures = new Map();
  return rows.map((row) => {
    const data = JSON.parse(row.data);
    const signature = [data.title, data.city, data.priceUSD ?? data.price].map(value => String(value || '').trim().toLowerCase()).join('|');
    const duplicateCount = (signatures.get(signature) || 0) + 1;
    signatures.set(signature, duplicateCount);
    return { ...data, id: row.id, agencyId: row.agency_id, moderationStatus: row.status, createdAt: row.created_at, duplicateKey: signature };
  }).map((item) => ({
    ...item,
    isDuplicate: (signatures.get(item.duplicateKey) || 0) > 1
  }));
}

export function moderateProperty(id, action) {
  const statusByAction = { approve: 'approved', reject: 'rejected', suspend: 'suspended' };
  if (action === 'delete') {
    const result = db.prepare('DELETE FROM properties WHERE id = ?').run(String(id));
    return result.changes > 0;
  }
  const status = statusByAction[action];
  if (!status) throw new Error('إجراء المراجعة غير صالح');
  const result = db.prepare('UPDATE properties SET status = ? WHERE id = ?').run(status, String(id));
  return result.changes > 0;
}

export function deleteAgencyProperty(agencyId, id) {
  const result = db.prepare('DELETE FROM properties WHERE id = ? AND agency_id = ?')
    .run(String(id), Number(agencyId));
  return result.changes > 0;
}

export function getAgencyForUser(user) {
  if (!user || !['office', 'admin'].includes(user.role)) return null;
  return getOrCreateAgencyForUser(user.id, user.name);
}

export function updateAgencySettings(userId, settings) {
  const agency = db.prepare('SELECT * FROM agencies WHERE owner_user_id = ?').get(Number(userId));
  if (!agency) return null;
  const current = JSON.parse(agency.data || '{}');
  const next = { ...current, ...settings };
  db.prepare('UPDATE agencies SET name = ?, data = ? WHERE id = ?').run(
    settings.name || agency.name,
    JSON.stringify(next),
    agency.id
  );
  return db.prepare('SELECT * FROM agencies WHERE id = ?').get(agency.id);
}

export function getSubscription(agencyId) {
  return db.prepare(`
    SELECT subscriptions.*, plans.name AS plan_name, plans.price, plans.limits, plans.features
    FROM subscriptions JOIN plans ON plans.id = subscriptions.plan_id
    WHERE agency_id = ? ORDER BY subscriptions.id DESC LIMIT 1
  `).get(Number(agencyId));
}

export function getAgencyPropertyCount(agencyId) {
  return db.prepare('SELECT COUNT(*) AS count FROM properties WHERE agency_id = ?').get(Number(agencyId)).count;
}

export function createRentalContract({ agencyId, propertyId, data, startDate, endDate }) {
  const overlap = db.prepare(`
    SELECT id FROM rental_contracts
    WHERE agency_id = ? AND property_id = ? AND status IN ('active', 'expiring')
      AND date(start_date) <= date(?) AND date(end_date) >= date(?)
  `).get(agencyId, String(propertyId), endDate, startDate);
  if (overlap) throw new Error('يوجد عقد فعال متداخل لهذا العقار');
  const result = db.prepare('INSERT INTO rental_contracts (agency_id, property_id, data, start_date, end_date) VALUES (?, ?, ?, ?, ?)').run(
    agencyId, String(propertyId), JSON.stringify(data), startDate, endDate
  );
  const contract = db.prepare('SELECT * FROM rental_contracts WHERE id = ?').get(result.lastInsertRowid);
  [30, 15, 7, 1].forEach((days) => {
    const dueDate = new Date(new Date(endDate).getTime() - days * 86400000).toISOString().slice(0, 10);
    db.prepare('INSERT OR IGNORE INTO rental_notifications (contract_id, days_before, due_date) VALUES (?, ?, ?)').run(contract.id, days, dueDate);
  });
  return { ...contract, data: JSON.parse(contract.data) };
}

export function listRentalContracts(agencyId) {
  return db.prepare('SELECT * FROM rental_contracts WHERE agency_id = ? ORDER BY date(end_date) ASC').all(Number(agencyId)).map((contract) => ({ ...contract, data: JSON.parse(contract.data) }));
}

export function listAgencyStaff(agencyId) {
  return db.prepare(`
    SELECT users.id, users.name, users.email, users.role, agency_staff.permissions, agency_staff.status, agency_staff.created_at
    FROM agency_staff JOIN users ON users.id = agency_staff.user_id
    WHERE agency_staff.agency_id = ? ORDER BY agency_staff.created_at DESC
  `).all(Number(agencyId)).map((row) => ({ ...row, permissions: JSON.parse(row.permissions || '[]') }));
}

export function inviteAgencyStaff({ agencyId, name, email, password, role, permissions }) {
  const user = createUser({ name, email, password, role: 'user' });
  db.prepare('INSERT INTO agency_staff (agency_id, user_id, permissions, status) VALUES (?, ?, ?, ?)').run(
    agencyId, user.id, JSON.stringify(permissions || []), 'invited'
  );
  return { id: user.id, name: user.name, email: user.email, role, permissions: permissions || [], status: 'invited' };
}

export function listLeads(agencyId) {
  return db.prepare('SELECT * FROM leads WHERE agency_id = ? ORDER BY updated_at DESC').all(Number(agencyId)).map((row) => ({ ...row, data: JSON.parse(row.data) }));
}

export function createLead({ agencyId, propertyId, data, stage = 'new' }) {
  const result = db.prepare('INSERT INTO leads (agency_id, property_id, data, stage) VALUES (?, ?, ?, ?)').run(
    agencyId, propertyId || null, JSON.stringify(data || {}), stage
  );
  return db.prepare('SELECT * FROM leads WHERE id = ?').get(result.lastInsertRowid);
}

export function updateLeadStage(agencyId, id, stage) {
  const result = db.prepare("UPDATE leads SET stage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND agency_id = ?").run(stage, Number(id), Number(agencyId));
  return result.changes > 0;
}

export function listAppointments(agencyId) {
  return db.prepare('SELECT * FROM appointments WHERE agency_id = ? ORDER BY starts_at ASC').all(Number(agencyId)).map((row) => ({ ...row, data: JSON.parse(row.data) }));
}

export function createAppointment({ agencyId, propertyId, data, startsAt }) {
  const result = db.prepare('INSERT INTO appointments (agency_id, property_id, data, starts_at) VALUES (?, ?, ?, ?)').run(
    agencyId, propertyId || null, JSON.stringify(data || {}), startsAt
  );
  return db.prepare('SELECT * FROM appointments WHERE id = ?').get(result.lastInsertRowid);
}

export function updateAppointmentStatus(agencyId, id, status) {
  const result = db.prepare('UPDATE appointments SET status = ? WHERE id = ? AND agency_id = ?').run(status, Number(id), Number(agencyId));
  return result.changes > 0;
}

export function updateRentalContract(agencyId, id, { status, endDate, data }) {
  const current = db.prepare('SELECT * FROM rental_contracts WHERE id = ? AND agency_id = ?').get(Number(id), Number(agencyId));
  if (!current) return null;
  const nextData = data ? { ...JSON.parse(current.data), ...data } : JSON.parse(current.data);
  db.prepare(`
    UPDATE rental_contracts
    SET status = COALESCE(?, status), end_date = COALESCE(?, end_date), data = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND agency_id = ?
  `).run(status || null, endDate || null, JSON.stringify(nextData), Number(id), Number(agencyId));
  if (status === 'terminated') {
    db.prepare("UPDATE rental_notifications SET status = 'cancelled' WHERE contract_id = ? AND status = 'scheduled'").run(Number(id));
  }
  const updated = db.prepare('SELECT * FROM rental_contracts WHERE id = ?').get(Number(id));
  return { ...updated, data: JSON.parse(updated.data) };
}

export function renewRentalContract(agencyId, id, { endDate, data = {} }) {
  const current = db.prepare('SELECT * FROM rental_contracts WHERE id = ? AND agency_id = ?').get(Number(id), Number(agencyId));
  if (!current) return null;
  if (!endDate || new Date(endDate) <= new Date(current.end_date)) {
    throw new Error('تاريخ التجديد يجب أن يكون بعد تاريخ نهاية العقد الحالي');
  }
  const nextData = { ...JSON.parse(current.data), ...data };
  db.prepare(`
    UPDATE rental_contracts
    SET status = 'active', end_date = ?, data = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND agency_id = ?
  `).run(endDate, JSON.stringify(nextData), Number(id), Number(agencyId));
  db.prepare('INSERT INTO rental_renewals (contract_id, data) VALUES (?, ?)').run(Number(id), JSON.stringify({ previousEndDate: current.end_date, endDate, ...data }));
  db.prepare("DELETE FROM rental_notifications WHERE contract_id = ?").run(Number(id));
  [30, 15, 7, 1].forEach((days) => {
    const dueDate = new Date(new Date(endDate).getTime() - days * 86400000).toISOString().slice(0, 10);
    db.prepare('INSERT OR IGNORE INTO rental_notifications (contract_id, days_before, due_date) VALUES (?, ?, ?)').run(Number(id), days, dueDate);
  });
  const updated = db.prepare('SELECT * FROM rental_contracts WHERE id = ?').get(Number(id));
  return { ...updated, data: JSON.parse(updated.data) };
}

export function listExpiringRentals(agencyId, days = 45) {
  return listRentalContracts(agencyId).filter((contract) => {
    const remaining = Math.ceil((new Date(contract.end_date) - new Date()) / 86400000);
    return remaining > 0 && remaining <= Number(days) && ['active', 'expiring'].includes(contract.status);
  });
}

export function createAuditLog({ actorUserId, action, entityType, entityId, data = {} }) {
  db.prepare('INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, data) VALUES (?, ?, ?, ?, ?)').run(actorUserId || null, action, entityType, entityId ? String(entityId) : null, JSON.stringify(data));
}

export function getUserByEmail(email) {
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).trim().toLowerCase());
  return row || null;
}

export function getUserById(id) {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(id));
  return row || null;
}

export function createUser({ name, email, password, role = 'user' }) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
    String(name).trim(),
    normalizedEmail,
    passwordHash,
    role
  );
  return getUserById(result.lastInsertRowid);
}

export { db };
export default db;
