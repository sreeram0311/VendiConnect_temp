import express from 'express';
import { requireResidentAuth, attachResident, requireOwnResident } from '../middleware/auth.js';
import {
  syncResident,
  loginWithPhone,
  getMyResidentProfile,
  updateMyResidentProfile,
  updateMyFcmToken,
} from '../controllers/residentAuthController.js';
import { setPreferences, getPreferences } from '../controllers/preferenceController.js';
import {
  getMyAlerts,
  markAlertRead,
  markAllAlertsRead,
} from '../controllers/residentAlertController.js';

const router = express.Router();

// Resident authentication and profile management
router.post('/auth/phone-login', loginWithPhone);
router.post('/auth/sync', requireResidentAuth, syncResident);
router.get('/auth/me', requireResidentAuth, getMyResidentProfile);
router.patch('/auth/me', requireResidentAuth, updateMyResidentProfile);
router.patch('/auth/fcm-token', requireResidentAuth, updateMyFcmToken);

// Resident in-app proximity alerts and notification center
router.get('/alerts', requireResidentAuth, attachResident, getMyAlerts);
router.patch('/alerts/:alertId/read', requireResidentAuth, attachResident, markAlertRead);
router.patch('/alerts/read-all', requireResidentAuth, attachResident, markAllAlertsRead);

// Manage preferences with resident ownership verification
router.put('/:residentId/preferences', requireResidentAuth, attachResident, requireOwnResident, setPreferences);
router.get('/:residentId/preferences', requireResidentAuth, attachResident, requireOwnResident, getPreferences);

export default router;
