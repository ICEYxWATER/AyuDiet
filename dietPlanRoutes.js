import express from 'express';
import {
  getPlanByPatient,
  saveOrUpdatePlan,
  approvePlan
} from './dietPlanController.js';
import { requirePractitioner } from './auth.js';

const router = express.Router();

// Clients / Patients can view and draft plans
router.get('/patient/:patientId', getPlanByPatient);
router.post('/', saveOrUpdatePlan);

// ONLY Authorized Practitioners at Backend can Approve and Sign Plans
router.put('/:id/approve', requirePractitioner, approvePlan);

export default router;
