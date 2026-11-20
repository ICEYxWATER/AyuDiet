import express from 'express';
import {
  getPlanByPatient,
  saveOrUpdatePlan,
  approvePlan
} from './dietPlanController.js';

const router = express.Router();

router.get('/patient/:patientId', getPlanByPatient);
router.post('/', saveOrUpdatePlan);
router.put('/:id/approve', approvePlan);

export default router;
