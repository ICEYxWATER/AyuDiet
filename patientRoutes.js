import express from 'express';
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  addFollowUp
} from '../controllers/patientController.js';

const router = express.Router();

router.route('/')
  .get(getPatients)
  .post(createPatient);

router.route('/:id')
  .get(getPatientById)
  .put(updatePatient);

router.post('/:id/follow-ups', addFollowUp);

export default router;
