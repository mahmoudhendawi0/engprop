import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {
  createAuditLog,
  createAgencyWithOwner,
  createAdminResource,
  createProperty,
  createRentalContract,
  createUser,
  db,
  getAgencyForUser,
  getAgencyPropertyCount,
  getAllProperties,
  getSubscription,
  getUserByEmail,
  getUserById,
  listRentalContracts
  , listModerationProperties, moderateProperty, deleteAgencyProperty, listAgencyStaff, inviteAgencyStaff,
  listLeads, createLead, updateLeadStage, listAppointments, createAppointment,
  updateAppointmentStatus, updateRentalContract, renewRentalContract, listExpiringRentals, updateAgencySettings
  , listUserFavorites, setUserFavorite
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '..', '..', 'frontend', 'dist');
const app = express();
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || 'engprop-super-secret';
app.use(cors());
app.use(express.json({ limit: '5mb' }));

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: user not found' });
    }
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized: invalid token' });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'ليس لديك صلاحية لتنفيذ هذا الإجراء' });
    }
    return next();
  };
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (req.user.role === 'admin') return next();
    const agency = getAgencyForUser(req.user);
    if (!agency) return res.status(403).json({ message: 'لا يوجد مكتب مرتبط بالحساب' });
    if (req.user.role === 'office') return next();
    return res.status(403).json({ message: `الصلاحية المطلوبة: ${permission}` });
  };
}

function requireActiveSubscription(req, res, next) {
  if (req.user.role === 'admin') return next();
  const agency = getAgencyForUser(req.user);
  const subscription = agency && getSubscription(agency.id);
  if (!subscription) return res.status(403).json({ message: 'لا يوجد اشتراك فعال للمكتب' });
  const expiresAt = new Date(subscription.ends_at);
  const graceUntil = new Date(expiresAt.getTime() + Number(subscription.grace_days || 0) * 86400000);
  if (subscription.status !== 'active' || graceUntil < new Date()) {
    return res.status(403).json({ message: 'انتهى اشتراك المكتب، يرجى التجديد للمتابعة' });
  }
  req.agency = agency;
  req.subscription = subscription;
  return next();
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'EngProp API is running', timestamp: new Date().toISOString() });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role = 'user' } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (!['user', 'office'].includes(role)) {
    return res.status(400).json({ message: 'نوع الحساب غير صالح' });
  }

  if (getUserByEmail(email)) {
    return res.status(409).json({ message: 'This email is already registered' });
  }

  const user = createUser({ name, email, password, role });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  return res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

app.get('/api/v1/agency/overview', authMiddleware, requireRole('office', 'admin'), (req, res) => {
  const agency = getAgencyForUser(req.user);
  const subscription = agency ? getSubscription(agency.id) : null;
  res.json({
    agency,
    subscription,
    usage: { properties: agency ? getAgencyPropertyCount(agency.id) : 0 }
  });
});

app.get('/api/v1/user/favorites', authMiddleware, (req, res) => {
  res.json({ items: listUserFavorites(req.user.id) });
});

app.put('/api/v1/user/favorites/:propertyId', authMiddleware, (req, res) => {
  const enabled = req.body?.enabled !== false;
  const items = setUserFavorite(req.user.id, req.params.propertyId, enabled);
  return res.json({ items });
});

app.patch('/api/v1/agency/settings', authMiddleware, requireRole('office'), (req, res) => {
  const allowed = ['name', 'slug', 'description', 'city', 'address', 'phone', 'hours', 'storeUrl', 'logo', 'cover', 'emailNotifications', 'twoFactor'];
  const settings = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));
  const agency = updateAgencySettings(req.user.id, settings);
  if (!agency) return res.status(404).json({ message: 'المكتب غير موجود' });
  createAuditLog({ actorUserId: req.user.id, action: 'agency.settings.updated', entityType: 'agency', entityId: agency.id });
  return res.json({ agency });
});

app.post('/api/v1/admin/agencies', authMiddleware, requireRole('admin'), (req, res) => {
  const {
    agencyName,
    managerName,
    email,
    password,
    city = '',
    planName = 'Basic',
    durationDays = 30
  } = req.body || {};

  if (!agencyName || !managerName || !email || !password) {
    return res.status(400).json({ message: 'اسم المكتب واسم المسؤول والبريد وكلمة المرور حقول مطلوبة' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 محارف على الأقل' });
  }
  if (!Number.isInteger(Number(durationDays)) || Number(durationDays) < 1 || Number(durationDays) > 3650) {
    return res.status(400).json({ message: 'مدة الاشتراك غير صالحة' });
  }

  try {
    const result = createAgencyWithOwner({
      agencyName: String(agencyName).trim(),
      managerName: String(managerName).trim(),
      email: String(email).trim().toLowerCase(),
      password,
      city: String(city).trim(),
      planName,
      durationDays: Number(durationDays)
    });
    createAuditLog({
      actorUserId: req.user.id,
      action: 'agency.created',
      entityType: 'agency',
      entityId: result.agency.id
    });
    return res.status(201).json(result);
  } catch (error) {
    const status = error.message === 'البريد الإلكتروني مستخدم مسبقاً' ? 409 : 400;
    return res.status(status).json({ message: error.message || 'تعذر إنشاء المكتب' });
  }
});

app.post('/api/v1/admin/resources/:type', authMiddleware, requireRole('admin'), (req, res) => {
  const { type } = req.params;
  const payload = req.body || {};
  const required = {
    locations: ['governorate', 'district'],
    plans: ['name'],
    users: ['name', 'email', 'password'],
    payments: ['agencyId', 'amount'],
    notifications: ['title', 'message']
  }[type];
  if (!required) return res.status(400).json({ message: 'نوع السجل غير مدعوم' });
  if (required.some(field => payload[field] === undefined || payload[field] === '')) {
    return res.status(400).json({ message: 'يرجى تعبئة الحقول المطلوبة' });
  }
  if (type === 'users' && payload.password.length < 6) {
    return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 محارف على الأقل' });
  }
  try {
    const item = createAdminResource(type, payload);
    createAuditLog({ actorUserId: req.user.id, action: `admin.${type}.created`, entityType: type, entityId: item.id });
    return res.status(201).json({ item });
  } catch (error) {
    const message = error.code === 'SQLITE_CONSTRAINT_UNIQUE' ? 'القيمة موجودة مسبقاً' : error.message;
    return res.status(400).json({ message });
  }
});

app.get('/api/v1/admin/properties/moderation', authMiddleware, requireRole('admin'), (_req, res) => {
  res.json({ items: listModerationProperties() });
});

app.post('/api/v1/admin/properties/:id/moderate', authMiddleware, requireRole('admin'), (req, res) => {
  const action = req.body?.action;
  try {
    const changed = moderateProperty(req.params.id, action);
    if (!changed) return res.status(404).json({ message: 'العقار غير موجود' });
    createAuditLog({ actorUserId: req.user.id, action: `property.${action}`, entityType: 'property', entityId: req.params.id });
    return res.json({ ok: true, status: action });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.delete('/api/v1/agency/properties/:id', authMiddleware, requireRole('office'), requireActiveSubscription, (req, res) => {
  const changed = deleteAgencyProperty(req.agency.id, req.params.id);
  if (!changed) return res.status(404).json({ message: 'العقار غير موجود أو لا يتبع لهذا المكتب' });
  createAuditLog({ actorUserId: req.user.id, action: 'property.deleted', entityType: 'property', entityId: req.params.id });
  return res.json({ ok: true });
});

app.get('/api/properties', (_req, res) => {
  res.json({ items: getAllProperties() });
});

app.post('/api/properties', authMiddleware, requireRole('office', 'admin'), requireActiveSubscription, (req, res) => {
  const item = req.body || {};
  if (!item.title || !item.city) {
    return res.status(400).json({ message: 'Property title and city are required' });
  }

  const property = createProperty({
    ...item,
    id: item.id || `prop-${Date.now()}`,
    priceUSD: Number(item.priceUSD ?? item.price ?? 500),
    purpose: item.purpose || 'للإيجار',
    type: item.type || 'شقة',
    createdAt: new Date().toISOString().slice(0, 10),
    agencyId: req.agency?.id || null
  });

  if (req.agency) {
    const limits = JSON.parse(req.subscription.limits || '{}');
    const maxProperties = Number(limits.properties);
    const count = getAgencyPropertyCount(req.agency.id);
    if (maxProperties >= 0 && count > maxProperties) {
      db.prepare('DELETE FROM properties WHERE id = ?').run(String(property.id));
      return res.status(403).json({ message: 'تم تجاوز الحد المسموح للعقارات ضمن الباقة' });
    }
    createAuditLog({ actorUserId: req.user.id, action: 'property.created', entityType: 'property', entityId: property.id });
  }

  return res.status(201).json({ property });
});

app.get('/api/v1/agency/rentals', authMiddleware, requireRole('office', 'admin'), requirePermission('rentals.view'), requireActiveSubscription, (req, res) => {
  res.json({ items: listRentalContracts(req.agency.id) });
});

app.get('/api/v1/agency/staff', authMiddleware, requireRole('office', 'admin'), requireActiveSubscription, (req, res) => {
  res.json({ items: listAgencyStaff(req.agency.id) });
});

app.post('/api/v1/agency/staff', authMiddleware, requireRole('office', 'admin'), requireActiveSubscription, (req, res) => {
  const { name, email, role = 'agent', permissions = [] } = req.body || {};
  if (!name || !email) return res.status(400).json({ message: 'اسم الموظف والبريد مطلوبان' });
  const password = `EngProp-${Math.random().toString(36).slice(2, 10)}`;
  try {
    const staff = inviteAgencyStaff({ agencyId: req.agency.id, name, email: email.toLowerCase(), password, role, permissions });
    createAuditLog({ actorUserId: req.user.id, action: 'staff.invited', entityType: 'user', entityId: staff.id });
    return res.status(201).json({ staff, temporaryPassword: password });
  } catch (error) {
    return res.status(error.code === 'SQLITE_CONSTRAINT_UNIQUE' ? 409 : 400).json({ message: error.message });
  }
});

app.get('/api/v1/agency/leads', authMiddleware, requireRole('office', 'admin'), requireActiveSubscription, (req, res) => {
  res.json({ items: listLeads(req.agency.id) });
});

app.post('/api/v1/agency/leads', authMiddleware, requireRole('office', 'admin'), requireActiveSubscription, (req, res) => {
  const { propertyId, stage, ...data } = req.body || {};
  if (!data.name && !data.email && !data.phone) return res.status(400).json({ message: 'بيانات العميل مطلوبة' });
  const lead = createLead({ agencyId: req.agency.id, propertyId, data, stage });
  createAuditLog({ actorUserId: req.user.id, action: 'lead.created', entityType: 'lead', entityId: lead.id });
  return res.status(201).json({ lead });
});

app.patch('/api/v1/agency/leads/:id', authMiddleware, requireRole('office', 'admin'), requireActiveSubscription, (req, res) => {
  const { stage } = req.body || {};
  if (!stage || !updateLeadStage(req.agency.id, req.params.id, stage)) return res.status(404).json({ message: 'العميل غير موجود' });
  return res.json({ ok: true, stage });
});

app.get('/api/v1/agency/appointments', authMiddleware, requireRole('office', 'admin'), requireActiveSubscription, (req, res) => {
  res.json({ items: listAppointments(req.agency.id) });
});

app.post('/api/v1/agency/appointments', authMiddleware, requireRole('office', 'admin'), requireActiveSubscription, (req, res) => {
  const { propertyId, startsAt, ...data } = req.body || {};
  if (!startsAt) return res.status(400).json({ message: 'موعد المعاينة مطلوب' });
  const appointment = createAppointment({ agencyId: req.agency.id, propertyId, startsAt, data });
  return res.status(201).json({ appointment });
});

app.patch('/api/v1/agency/appointments/:id', authMiddleware, requireRole('office', 'admin'), requireActiveSubscription, (req, res) => {
  const { status } = req.body || {};
  if (!status || !updateAppointmentStatus(req.agency.id, req.params.id, status)) return res.status(404).json({ message: 'الموعد غير موجود' });
  return res.json({ ok: true, status });
});

app.patch('/api/v1/agency/rentals/:id', authMiddleware, requireRole('office', 'admin'), requirePermission('rentals.manage'), requireActiveSubscription, (req, res) => {
  const contract = updateRentalContract(req.agency.id, req.params.id, req.body || {});
  if (!contract) return res.status(404).json({ message: 'العقد غير موجود' });
  createAuditLog({ actorUserId: req.user.id, action: 'rental.updated', entityType: 'rental_contract', entityId: req.params.id });
  return res.json({ contract });
});

app.get('/api/v1/agency/rentals/expiring', authMiddleware, requireRole('office', 'admin'), requirePermission('rentals.view'), requireActiveSubscription, (req, res) => {
  const days = Number(req.query.days || 45);
  if (!Number.isInteger(days) || days < 1 || days > 365) return res.status(400).json({ message: 'مدة التنبيه غير صالحة' });
  return res.json({ items: listExpiringRentals(req.agency.id, days) });
});

app.post('/api/v1/agency/rentals/:id/renew', authMiddleware, requireRole('office', 'admin'), requirePermission('rentals.manage'), requireActiveSubscription, (req, res) => {
  try {
    const contract = renewRentalContract(req.agency.id, req.params.id, req.body || {});
    if (!contract) return res.status(404).json({ message: 'العقد غير موجود' });
    createAuditLog({ actorUserId: req.user.id, action: 'rental.renewed', entityType: 'rental_contract', entityId: req.params.id });
    return res.json({ contract });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.post('/api/v1/agency/rentals', authMiddleware, requireRole('office', 'admin'), requirePermission('rentals.manage'), requireActiveSubscription, (req, res) => {
  const { propertyId, startDate, endDate, ...data } = req.body || {};
  if (!propertyId || !startDate || !endDate || new Date(endDate) <= new Date(startDate)) {
    return res.status(400).json({ message: 'بيانات العقد غير صالحة وتاريخ النهاية يجب أن يكون بعد البداية' });
  }
  const property = db.prepare('SELECT id FROM properties WHERE id = ? AND (agency_id = ? OR ? = 1)').get(String(propertyId), req.agency.id, req.user.role === 'admin' ? 1 : 0);
  if (!property) return res.status(403).json({ message: 'لا يمكن إنشاء عقد لعقار لا يتبع المكتب' });
  try {
    const contract = createRentalContract({ agencyId: req.agency.id, propertyId, data, startDate, endDate });
    createAuditLog({ actorUserId: req.user.id, action: 'rental.created', entityType: 'rental_contract', entityId: contract.id });
    return res.status(201).json({ contract });
  } catch (error) {
    return res.status(409).json({ message: error.message });
  }
});

app.get('/api/v1/agency/subscription', authMiddleware, requireRole('office', 'admin'), (req, res) => {
  const agency = getAgencyForUser(req.user);
  res.json({ subscription: agency ? getSubscription(agency.id) : null });
});

const { promises: fsPromises } = await import('node:fs');

app.use(express.static(distDir));

app.use(async (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  try {
    await fsPromises.access(path.join(distDir, 'index.html'));
    return res.sendFile(path.join(distDir, 'index.html'));
  } catch {
    return res.status(200).send('EngProp API is running. Run the frontend build to serve the UI.');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`EngProp API listening on http://localhost:${PORT}`);
});
